document.querySelectorAll('.pdp-gallery .thumbs img').forEach(t=>{
  t.addEventListener('click', ()=>{
    const main = document.querySelector('.pdp-gallery .main-media img');
    if(!main) return;
    const src = t.getAttribute('data-large') || t.src;
    main.src = src;
  });
});


(() => {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const formatBRL = (v) =>
    (window.formatBRL ? window.formatBRL(v) :
      new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(v));

  const params = new URLSearchParams(location.search);
  const urlSku = (params.get('sku') || '').trim();
  const fallbackSku = $('.add-to-cart')?.dataset?.id || '';
  const sku = urlSku || fallbackSku;
  if (!sku) return; 

  fetch('../assets/data/produtos.json', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(db => {
      const p = db[sku];
      if (!p) return; 

      if (p.name) { const h1 = $('.pdp-buy h1'); if (h1) h1.textContent = p.name; }
      if (Number.isFinite(p.price)) {
        const priceEls = $$('.pdp .price');
        priceEls.forEach(el => el.textContent = formatBRL(p.price));
      }
      if (p.pack) { const packEl = $('.pdp .pack'); if (packEl) packEl.textContent = p.pack; }
      if (Number.isFinite(p.rating)) {
        const sub = $('.pdp-buy .subtitle');
        if (sub) sub.innerHTML = `<i class="bi bi-star-fill text-warning"></i> ${p.rating.toFixed(1)} (126 avaliações)`;
      }

      if (p.category) {
        const bc = $('.pdp-breadcrumb');
        if (bc) bc.innerHTML = `<a href="#">Swift</a> › <a href="#">${p.category}</a> › ${p.name || sku}`;
      }

      const mainImg = $('.pdp-gallery .main-media img');
      if (p.images && p.images.length) {
        if (mainImg) {
          mainImg.src = p.images[0];
          mainImg.alt = p.name || mainImg.alt;
        }
        const thumbs = $('.pdp-gallery .thumbs');
        if (thumbs) {
          thumbs.innerHTML = '';
          p.images.forEach((src, i) => {
            const t = document.createElement('img');
            t.src = src;
            t.alt = `thumb ${i+1}`;
            t.dataset.large = src;
            thumbs.appendChild(t);
          });
        }
      }

      const thumbsClick = (ev) => {
        const img = ev.target.closest('img[data-large]');
        if (!img) return;
        if (mainImg) { mainImg.src = img.dataset.large; mainImg.alt = (p.name || mainImg.alt); }
      };
      const thumbsBox = $('.pdp-gallery .thumbs');
      if (thumbsBox) {
        thumbsBox.removeEventListener('click', thumbsClick);
        thumbsBox.addEventListener('click', thumbsClick);
      }

      //    - data-id = sku
      //    - data-name = p.name
      //    - data-price = p.price
      $$('.add-to-cart').forEach(btn => {
        btn.dataset.id = sku;
        if (p.name)  btn.dataset.name  = p.name;
        if (Number.isFinite(p.price)) btn.dataset.price = String(p.price);
      });
      $$('.qty-inc, .qty-dec, .qty-input').forEach(el => { el.dataset.id = sku; });

      $$('.add-to-cart').forEach(btn => {
        if (!btn.dataset.thumb && p.images && p.images[0]) {
          btn.dataset.thumb = p.images[0];
        }
      });

      if (p.name) document.title = `Swift — ${p.name}`;

    })
    .catch(() => {
      console.log('Erro ao carregar dados do produto');
    });

  (function bindThumbsIfNoJson() {
    const box = $('.pdp-gallery .thumbs');
    const main = $('.pdp-gallery .main-media img');
    if (!box || !main) return;
    box.addEventListener('click', (e) => {
      const img = e.target.closest('img[data-large]');
      if (!img) return;
      main.src = img.dataset.large;
      main.alt = img.alt || main.alt;
    });
  })();
})();

//reviews
(() => {
  const root  = document.querySelector('.pdp-reviews');
  if (!root) return;

  const chips = [...root.querySelectorAll('.chip')];
  const items = [...root.querySelectorAll('.pdp-review')];

  function getStars(el){
    const ds = parseInt(el.dataset.stars || '', 10);
    if (!Number.isNaN(ds)) return ds;
    const txt = el.querySelector('.review-stars')?.textContent || '';
    const m   = txt.match(/★/g);
    return m ? m.length : 0;
  }

  function hasPhotos(el){
    return !!el.querySelector('.review-photos img');
  }

  function applyFilter(kind){
    items.forEach(it => {
      const stars  = getStars(it);
      const photos = hasPhotos(it);
      let show = true;

      switch (kind) {
        case 'photos': show = photos; break;
        case '5':      show = stars === 5; break;
        case '4':      show = stars === 4; break;
        default:       show = true;
      }
      it.classList.toggle('d-none', !show);
    });
  }

  chips.forEach(chip => {
    chip.tabIndex = 0;

    function handleActivate() {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const t = (chip.dataset.filter || chip.textContent).toLowerCase().trim();
      let kind = 'all';
      if (t.includes('foto')) kind = 'photos';
      else if (t.startsWith('5')) kind = '5';
      else if (t.startsWith('4')) kind = '4';

      applyFilter(kind);
    }

    chip.addEventListener('click', handleActivate);
    chip.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleActivate(); }
    });
  });

  (chips.find(c => c.classList.contains('active')) || chips[0])?.click();
})();

