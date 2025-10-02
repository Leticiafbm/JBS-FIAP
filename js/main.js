const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
const formatBRL = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);

const CART_KEY = 'swift_cart';
const readCart = () => JSON.parse(localStorage.getItem(CART_KEY) || '[]');
const writeCart = items => localStorage.setItem(CART_KEY, JSON.stringify(items));
const updateCartBadge = () => {
  const el = $('#cartCount');
  if (el) el.textContent = readCart().reduce((a, i) => a + i.qty, 0);
};

updateCartBadge();

document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.add-to-cart');
  if(!btn) return;
  const id = btn.dataset.id, name = btn.dataset.name, price = parseFloat(btn.dataset.price);
  const qtyInput = $(`.qty-input[data-id="${id}"]`);
  const qty = Math.max(1, parseInt(qtyInput?.value || '1',10));
  const cart = readCart();
  const idx = cart.findIndex(i=>i.id===id);
  if(idx>-1) cart[idx].qty += qty; else cart.push({id,name,price,qty});
  writeCart(cart); updateCartBadge();
  showToast(`${name} adicionado (${qty})`);
});

document.addEventListener('click', (e)=>{
  if(e.target.matches('.qty-inc, .qty-dec')){
    const id = e.target.dataset.id;
    const input = $(`.qty-input[data-id="${id}"]`);
    if(!input) return;
    let v = parseInt(input.value||'1',10);
    v = e.target.classList.contains('qty-inc') ? v+1 : Math.max(1, v-1);
    input.value = v;
  }
});

function showToast(msg){
  let holder = $('#toastHolder');
  if(!holder){
    holder = document.createElement('div');
    holder.id='toastHolder';
    holder.className='position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(holder);
  }
  const el = document.createElement('div');
  el.className='toast align-items-center text-bg-dark border-0';
  el.role='alert'; el.ariaLive='assertive'; el.ariaAtomic='true';
  el.innerHTML = `<div class="d-flex">
      <div class="toast-body">${msg}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  holder.appendChild(el);
  const t = new bootstrap.Toast(el,{delay:1800});
  t.show();
  el.addEventListener('hidden.bs.toast', ()=> el.remove());
}

$('#togglePwd')?.addEventListener('click', ()=>{
  const input = $('#senha');
  if(!input) return;
  input.type = input.type==='password' ? 'text' : 'password';
});
$('#loginForm')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const cpf = $('#cpf').value.replace(/[^\d]/g,'');
  const senha = $('#senha').value.trim();
  const ok = cpf.length===11 && senha.length>=3;
  $('#cpf').classList.toggle('is-invalid', cpf.length!==11);
  $('#senha').classList.toggle('is-invalid', senha.length<3);
  if(ok){ showToast('Login efetuado (mock)'); setTimeout(()=>location.href='index.html',700); }
});

let searchDebounce;
$('#globalSearch')?.addEventListener('input', (e)=>{
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(()=>{
    // TODO: filtrar itens na grade ou redirecionar para busca, usando json por titulo/descrição
    console.log('Buscar:', e.target.value);
  }, 250);
});


(() => {
  const PDP_PATH = 'produto.html'; // se mudar o nome/rota do produto, atualizar aqui

  function pdpHref(sku, base = PDP_PATH) {
    if (!sku) return base;
    const u = new URL(base, location.href);
    u.searchParams.set('sku', sku);
    return u.pathname + u.search;
  }

  document.querySelectorAll('a[data-sku]').forEach(a => {
    const sku = (a.dataset.sku || '').trim();
    if (!sku) return;
    const base = a.dataset.pdp || PDP_PATH; 
    a.setAttribute('href', pdpHref(sku, base));
  });

  document.querySelectorAll('[data-sku]').forEach(card => {
    const sku = (card.dataset.sku || '').trim();
    if (!sku) return;

    card.querySelectorAll('a').forEach(a => {
      const href = (a.getAttribute('href') || '').trim();
      if (!href || href === '#' || href.includes('produto.html')) {
        a.setAttribute('href', pdpHref(sku));
      }
    });
    if (card.hasAttribute('data-card-link')) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (ev) => {
        if (ev.target.closest('button, .qty, [data-add], .add-to-cart, a')) return;
        location.href = pdpHref(sku);
      });
    }
  });
})();
