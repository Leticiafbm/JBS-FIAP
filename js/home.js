function startTimer(elId, secs){
  const el = document.getElementById(elId);
  if(!el) return;
  let t = secs;
  const tick = ()=>{
    const m = String(Math.floor(t/60)).padStart(2,'0');
    const s = String(t%60).padStart(2,'0');
    el.textContent = `${m}:${s}`;
    if(t>0){ t--; setTimeout(tick,1000); }
  };
  tick();
}
startTimer('dealTimerHero', 120);
startTimer('dealTimerList', 115);

(() => {
  const root = document.querySelector('.swift-daily-deal');
  if (!root) return;
  const mEl   = root.querySelector('#dealMin');
  const sEl   = root.querySelector('#dealSec');
  const mini  = root.querySelector('#dealTimerListMini');
  const ended = root.querySelector('#dealEnded');
  const bar   = root.querySelector('#dealBar');
  const totalEl = root.querySelector('#dealTotalUnits');
  const KEY   = 'swiftDealEndsAt_25min';   
  const SPAN  = 25 * 60 * 1000;            
  const KEY_START = 'swiftDealStartedAt_25min';

  const now = Date.now();
  let endsAt = sessionStorage.getItem(KEY);
  let startedAt = parseInt(sessionStorage.getItem(KEY_START) || '0', 10);

  if (!endsAt || (+endsAt - now) <= 0 || !startedAt) {
  startedAt = now;
  endsAt = (now + SPAN).toString();
  sessionStorage.setItem(KEY, endsAt);
  sessionStorage.setItem(KEY_START, String(startedAt));
} else {
  const spanStored = (+endsAt) - startedAt;
  if (spanStored !== SPAN) {
    startedAt = (+endsAt) - SPAN;
    sessionStorage.setItem(KEY_START, String(startedAt));
  }
}
  const totalMs = +endsAt - now;
  const fmt = (n)=> String(n).padStart(2,'0');
  const clamp01 = (x)=> Math.max(0, Math.min(1, x));

  const cards = [...root.querySelectorAll('[data-sku]')].map(card => {
    const init = +(card.dataset.stock || 20);
    const minLeft = +(card.dataset.minLeft || Math.max(1, Math.floor(init*0.08)));
    card.dataset.stockInit   = String(init);
    card.dataset.minLeft     = String(minLeft);
    card.dataset.soldManual  = card.dataset.soldManual || '0';
    const leftEl = card.querySelector('[data-left]');
    if (leftEl) leftEl.textContent = init + ' un';
    return card;
  });

  function computeTimeBasedLeft(card, tRemainingMs) {
    const init    = +card.dataset.stockInit;
    const minLeft = +card.dataset.minLeft;
    const pct = clamp01(tRemainingMs / SPAN);
    const raw     = minLeft + (init - minLeft) * pct;
    return Math.max(minLeft, Math.ceil(raw));
  }

  function renderStocks(tRemainingMs) {
    cards.forEach(card => {
      const leftEl = card.querySelector('[data-left]');
      const soldManual = +card.dataset.soldManual || 0;
      const timeLeft   = computeTimeBasedLeft(card, tRemainingMs);
      const minLeft    = +card.dataset.minLeft;
      const finalLeft  = Math.max(minLeft, timeLeft - soldManual);
      card.dataset.stock = String(finalLeft);
      if (leftEl) leftEl.textContent = finalLeft + ' un';
    });
    renderTotal();
  }

  function renderTotal() {
    if (!totalEl) return;
    const sum = cards.reduce((acc, c)=> acc + (+c.dataset.stock || 0), 0);
    totalEl.textContent = sum;
  }

  let lastMinuteShown = null;
  function minuteAction(tRemainingMs) {
    if (tRemainingMs <= 0) return;
    const minuteNow = Math.floor(tRemainingMs/60000);
    if (minuteNow === lastMinuteShown) return;
    lastMinuteShown = minuteNow;

    const pool = [];
    cards.forEach(card => {
      const stock = +card.dataset.stock || 0;
      const minL  = +card.dataset.minLeft;
      if (stock > minL) {
        const weight = Math.max(1, stock - minL); 
        for (let i=0;i<weight;i++) pool.push(card);
      }
    });
    if (!pool.length) return;

    const picked = pool[Math.floor(Math.random()*pool.length)];
    const qtyDec = 1 + Math.floor(Math.random()*3); // 1..3
    const minL   = +picked.dataset.minLeft;
    const current= +picked.dataset.stock;
    const willGo = Math.max(minL, current - qtyDec);

    const soldManual = +picked.dataset.soldManual || 0;
    const newSold    = soldManual + (current - willGo);
    picked.dataset.soldManual = String(newSold);

    const leftEl = picked.querySelector('[data-left]');
    if (leftEl) {
      leftEl.textContent = willGo + ' un';
      leftEl.style.transition = 'background-color .4s ease';
      leftEl.style.backgroundColor = 'rgba(230,72,46,.15)';
      setTimeout(()=> leftEl.style.backgroundColor = 'transparent', 450);
    }
    picked.dataset.stock = String(willGo);
    renderTotal();
  }

  function tick() {
    const t = +endsAt - Date.now();
    if (t <= 0) {
      mEl.textContent = '00'; sEl.textContent = '00';
      if (mini) mini.textContent = '00:00';
      ended?.classList.remove('d-none');
      bar.style.width = '0%';
      renderStocks(0); 
      root.classList.add('ended');
      clearInterval(iv);
      return;
    }
    const m = Math.floor(t/60000);
    const s = Math.floor((t%60000)/1000);
    mEl.textContent = fmt(m);
    sEl.textContent = fmt(s);
    if (mini) mini.textContent = `${fmt(m)}:${fmt(s)}`;
    bar.style.width = (clamp01(t / SPAN) * 100).toFixed(1) + '%'; 

    renderStocks(t);
    minuteAction(t);
  }
  const iv = setInterval(tick, 1000); tick();

  root.querySelectorAll('.qty-inc').forEach(b=>{
    b.addEventListener('click', ()=>{
      const id = b.dataset.id;
      const input = root.querySelector(`.qty-input[data-id="${id}"]`);
      input.value = Math.min(99, (+input.value||1)+1);
    });
  });
  root.querySelectorAll('.qty-dec').forEach(b=>{
    b.addEventListener('click', ()=>{
      const id = b.dataset.id;
      const input = root.querySelector(`.qty-input[data-id="${id}"]`);
      input.value = Math.max(1, (+input.value||1)-1);
    });
  });

  root.querySelectorAll('[data-add]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if (root.classList.contains('ended')) return;
      const card = btn.closest('[data-sku]');
      const qtyInput = card.querySelector('.qty-input');
      const qty = +qtyInput.value || 1;
      const sold = (+card.dataset.soldManual || 0) + qty;
      card.dataset.soldManual = String(sold);

      btn.textContent = 'Adicionado!';
      setTimeout(()=>btn.textContent='Adicionar', 1000);

      const t = Math.max(0, +endsAt - Date.now());
      renderStocks(t);
      window.cart.add({
        sku: card.dataset.sku,
        qty,
        name: card.dataset.name,
        price: parseFloat(card.dataset.price)
});
    });
  });

  renderTotal();
})();



(() => {

  const root   = document.currentScript.closest('.swift-daily-deal');
  if (!root) return;

  const mEl    = root.querySelector('#dealMin');
  const sEl    = root.querySelector('#dealSec');
  const mini   = root.querySelector('#dealTimerListMini');
  const ended  = root.querySelector('#dealEnded');
  const bar    = root.querySelector('#dealBar');

  const KEY_ENDS   = 'swiftDealEndsAt_25min';
  const KEY_START  = 'swiftDealStartedAt_25min';
  const KEY_SPAN   = 'swiftDealSpanMs';           
  const SPAN_MS    = 25 * 60 * 1000;             

  const now = Date.now();
  let startedAt = parseInt(sessionStorage.getItem(KEY_START) || '0', 10);
  let endsAt    = parseInt(sessionStorage.getItem(KEY_ENDS)  || '0', 10);
  let spanMs    = parseInt(sessionStorage.getItem(KEY_SPAN)  || '0', 10);

  const needReset =
    !startedAt || !endsAt || (endsAt - now) <= 0 || (endsAt - startedAt) <= 0 || (spanMs !== SPAN_MS);

  if (needReset) {
    startedAt = now;
    endsAt    = now + SPAN_MS;
    spanMs    = SPAN_MS;
    sessionStorage.setItem(KEY_START, String(startedAt));
    sessionStorage.setItem(KEY_ENDS,  String(endsAt));
    sessionStorage.setItem(KEY_SPAN,  String(spanMs));
  }

  const fmt      = (n)=> String(n).padStart(2,'0');
  const clamp01  = (x)=> Math.max(0, Math.min(1, x));
  const getRemain= ()=> Math.max(0, endsAt - Date.now());


  if (bar) {
    const prevTransition = bar.style.transition;
    bar.style.transition = 'none';
    const pct = clamp01(getRemain() / SPAN_MS) * 100;
    bar.style.width = pct.toFixed(1) + '%';
    requestAnimationFrame(() => {
      bar.style.transition = prevTransition || '';
    });
  }

  window.SWIFT_DEAL_TIMING = {
    get startedAt() { return startedAt; },
    get endsAt()    { return endsAt; },
    get spanMs()    { return SPAN_MS; },
    get remainMs()  { return getRemain(); }
  };

  function tick() {
    const t = getRemain();
    if (t <= 0) {
      mEl && (mEl.textContent = '00');
      sEl && (sEl.textContent = '00');
      mini && (mini.textContent = '00:00');
      ended && ended.classList.remove('d-none');
      bar && (bar.style.width = '0%');
      clearInterval(iv);
      return;
    }
    const m = Math.floor(t/60000);
    const s = Math.floor((t%60000)/1000);
    mEl && (mEl.textContent = fmt(m));
    sEl && (sEl.textContent = fmt(s));
    mini && (mini.textContent = `${fmt(m)}:${fmt(s)}`);
    if (bar) {
      const pct = clamp01(t / SPAN_MS) * 100;
      bar.style.width = pct.toFixed(1) + '%';
    }
  }

  const iv = setInterval(tick, 1000);
  tick();

})();

