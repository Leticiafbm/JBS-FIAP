 window.cart = {
  add({ sku, qty, name, price }) {
    const items = readCart();
    const idx = items.findIndex(i => i.id === sku);

    if (idx > -1) {
      items[idx].qty += qty;
    } else {
      items.push({
        id: sku,             // usamos 'id' = sku (compatível com main.js)
        name: name || sku,   // fallback usando sku se n tiver nome
        price: price || 0,   // precisa de price p/ subtotal no modal
        qty
      });
    }

    writeCart(items);
    updateCartBadge();
    showToast(`${name || sku} adicionado (${qty})`);
  }
};
 
 
 // ===== popup do carrinho (usa readCart/writeCart/updateCartBadge do main.js) =====
  (function(){
    const $ = (s, r=document)=>r.querySelector(s);
    const $$ = (s, r=document)=>[...r.querySelectorAll(s)];
    const fmt = v => new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v);

    const readCart  = window.readCart  || (()=>JSON.parse(localStorage.getItem('swift_cart')||'[]'));
    const writeCart = window.writeCart || (items=>localStorage.setItem('swift_cart', JSON.stringify(items)));
    const updateCartBadge = window.updateCartBadge || (()=>{ const el=$('#cartCount'); if(el){ el.textContent = readCart().reduce((a,i)=>a+i.qty,0); } });

    const modalEl = $('#cartModal');
    if(!modalEl) return;

    const listEl = $('#cartList', modalEl);
    const emptyEl = $('#cartEmpty', modalEl);
    const subtotalEl = $('#cartSubtotal', modalEl);
    const countEl = $('#cartCountModal', modalEl);

    function thumbFor(id){
      return `assets/img/produtos/${id}.jpg`;
    }

    function render(){
      const items = readCart();
      listEl.innerHTML = '';
      if(!items.length){
        emptyEl.classList.remove('d-none');
        subtotalEl.textContent = fmt(0);
        countEl.textContent = '0';
        return;
      }
      emptyEl.classList.add('d-none');

      let subtotal = 0, totalQty = 0;

      items.forEach(it=>{
        subtotal += it.price * it.qty;
        totalQty += it.qty;

        const row = document.createElement('div');
        row.className = 'cart-item p-3';
        row.innerHTML = `
          <div class="row g-3 align-items-center">
            <div class="col-auto">
              <img src="${thumbFor(it.id)}" alt="${it.name}" class="cart-thumb">
            </div>
            <div class="col">
              <div class="cart-name">${it.name}</div>
              <div class="text-muted small">ID: ${it.id}</div>
            </div>
            <div class="col-12 col-sm-auto">
              <div class="d-flex align-items-center gap-2 cart-qty justify-content-sm-end">
                <button class="btn btn-outline-secondary btn-sm cart-dec" data-id="${it.id}">-</button>
                <input class="form-control form-control-sm cart-input" data-id="${it.id}" value="${it.qty}">
                <button class="btn btn-outline-secondary btn-sm cart-inc" data-id="${it.id}">+</button>
              </div>
            </div>
            <div class="col-6 col-sm-auto text-start text-sm-end">
              <div class="cart-price">${fmt(it.price * it.qty)}</div>
              <div class="text-muted small">(${fmt(it.price)} un)</div>
            </div>
            <div class="col-6 col-sm-auto text-end">
              <button class="btn btn-outline-danger btn-sm cart-remove" data-id="${it.id}">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        `;
        listEl.appendChild(row);
      });

      subtotalEl.textContent = fmt(subtotal);
      countEl.textContent = String(totalQty);
    }

    function updateQty(id, delta){
      const items = readCart();
      const idx = items.findIndex(i=>i.id===id);
      if(idx<0) return;
      items[idx].qty = Math.max(1, items[idx].qty + delta);
      writeCart(items);
      updateCartBadge();
      render();
    }
    function setQty(id, val){
      const q = Math.max(1, parseInt(val||'1',10));
      const items = readCart();
      const idx = items.findIndex(i=>i.id===id);
      if(idx<0) return;
      items[idx].qty = q;
      writeCart(items);
      updateCartBadge();
      render();
    }
    function removeItem(id){
      const items = readCart().filter(i=>i.id!==id);
      writeCart(items);
      updateCartBadge();
      render();
    }
    function clearCart(){
      writeCart([]);
      updateCartBadge();
      render();
    }

    // Eventos
    modalEl.addEventListener('show.bs.modal', render);
    modalEl.addEventListener('click', (e)=>{
      const inc = e.target.closest('.cart-inc');
      const dec = e.target.closest('.cart-dec');
      const rem = e.target.closest('.cart-remove');
      const clr = e.target.closest('#cartClear');

      if(inc){ updateQty(inc.dataset.id, +1); }
      if(dec){ updateQty(dec.dataset.id, -1); }
      if(rem){ removeItem(rem.dataset.id); }
      if(clr){ clearCart(); }
    });
    modalEl.addEventListener('change', (e)=>{
      const input = e.target.closest('.cart-input');
      if(input){ setQty(input.dataset.id, input.value); }
    });

    const cartLink = document.querySelector('a[href="#"], .navbar .bi-cart')?.closest('a');
    if (cartLink && !cartLink.hasAttribute('data-bs-toggle')) {
      cartLink.setAttribute('data-bs-toggle','modal');
      cartLink.setAttribute('data-bs-target','#cartModal');
    }
  })();