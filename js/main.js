/* DevKartz site — interactions and scroll effects (no dependencies) */
(() => {
  'use strict';

  // Set this to the Chrome Web Store listing URL once the extension is published.
  // While empty, "Add to Chrome" opens a small "coming soon" dialog instead.
  const STORE_URL = 'https://chromewebstore.google.com/detail/devkartz-%E2%80%94-developer-reso/hjikfpmbbcdpcnaibpapnfpeigadacom?utm_source=item-share-cb';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- install dialog ---------- */
  const dialog = $('#installDialog');
  $$('[data-install]').forEach(b => b.addEventListener('click', () => {
    if (STORE_URL) { window.open(STORE_URL, '_blank', 'noopener'); return; }
    dialog.showModal();
  }));
  dialog?.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

  /* ---------- mobile menu ---------- */
  const menuBtn = $('#menuBtn'), nav = $('#nav');
  menuBtn?.addEventListener('click', () => {
    const open = menuBtn.getAttribute('aria-expanded') !== 'true';
    menuBtn.setAttribute('aria-expanded', open);
    nav.classList.toggle('open', open);
  });
  $$('a', nav).forEach(a => a.addEventListener('click', () => { menuBtn.setAttribute('aria-expanded', 'false'); nav.classList.remove('open'); }));

  /* ---------- reveal on scroll ---------- */
  $$('.hero .reveal').forEach((el, i) => el.style.setProperty('--d', (i * 0.09) + 's'));
  $$('.reveal-words .w').forEach((w, i) => w.style.setProperty('--i', i));
  const revealIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); }
  }), { threshold: .15, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal, .reveal-words, .fan, .never').forEach(el => reduce ? el.classList.add('in') : revealIO.observe(el));
  $$('.never s').forEach((s, i) => s.style.setProperty('--k', i));

  /* ---------- active nav link ---------- */
  const navLinks = $$('a', nav);
  const secIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['features', 'how', 'privacy', 'faq'].forEach(id => { const s = document.getElementById(id); if (s) secIO.observe(s); });

  /* ---------- count-up (privacy) ---------- */
  const countIO = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    countIO.unobserve(e.target);
    $$('[data-count]', e.target).forEach(b => {
      const target = +b.dataset.count;
      if (reduce) { b.textContent = target; return; }
      const from = target === 0 ? 24 : 0, dur = 1400, t0 = performance.now();
      const tick = now => {
        const k = clamp((now - t0) / dur, 0, 1), eased = 1 - Math.pow(1 - k, 3);
        b.textContent = Math.round(from + (target - from) * eased);
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }), { threshold: .5 });
  const counters = $('.counters'); if (counters) countIO.observe(counters);

  /* ---------- FAQ accordion ---------- */
  $$('.acc-item button').forEach(btn => btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    $$('.acc-item button').forEach(b => b.setAttribute('aria-expanded', 'false'));
    btn.setAttribute('aria-expanded', String(!open));
  }));

  /* ---------- magnetic buttons ---------- */
  if (!reduce && matchMedia('(hover: hover)').matches) {
    $$('.btn-magnet').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .16}px, ${(e.clientY - r.top - r.height / 2) * .22}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  /* ---------- statement: words light up as you scroll ---------- */
  const statement = $('#statement');
  let sWords = [];
  if (statement) {
    statement.innerHTML = statement.textContent.trim().split(/\s+/).map(w => `<span class="sw">${esc(w)}</span>`).join(' ');
    sWords = $$('.sw', statement);
    if (reduce) sWords.forEach(w => w.classList.add('lit'));
  }

  /* ---------- ribbon (doubled so it never runs out) ---------- */
  const rows = $$('.ribbon-row');
  rows.forEach(r => { r.innerHTML += r.innerHTML; });
  const ribbon = $('.ribbon');

  /* ---------- one scroll loop for every scroll-linked effect ---------- */
  const header = $('#header'), bar = $('#progress'), marks = $$('[data-speed]'), steps = $('#steps');
  let lastY = scrollY, ticking = false;
  function onScroll() {
    ticking = false;
    const y = scrollY, vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
    header.classList.toggle('scrolled', y > 8);
    if (menuBtn.getAttribute('aria-expanded') !== 'true') header.classList.toggle('hide', y > 160 && y > lastY + 2);
    if (y < lastY - 2) header.classList.remove('hide');
    lastY = y;
    if (reduce) return;
    marks.forEach(m => { m.style.transform = `translateY(${y * parseFloat(m.dataset.speed)}px) rotate(${y * 0.012}deg)`; });
    if (ribbon) {
      const t = ribbon.getBoundingClientRect().top;
      rows.forEach((r, i) => { const dir = i === 0 ? 1 : -1; r.style.transform = `translateX(${(i === 0 ? -300 : -700) + t * .35 * dir}px)`; });
    }
    if (statement) {
      const r = statement.getBoundingClientRect();
      const p = clamp((vh * .8 - r.top) / (r.height + vh * .25), 0, 1);
      const n = Math.round(p * sWords.length);
      sWords.forEach((w, i) => w.classList.toggle('lit', i < n));
    }
    if (steps) {
      const r = steps.getBoundingClientRect();
      steps.style.setProperty('--p', clamp((vh * .5 - r.top) / r.height, 0, 1).toFixed(3));
    }
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* =====================================================
     HERO DEMO — a working miniature of the extension
     ===================================================== */
  const IC = {
    star: '<svg viewBox="0 0 24 24"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
    copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></svg>',
    del: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>'
  };
  const SEED = [
    { id: 1, name: 'MDN Web Docs', url: 'developer.mozilla.org', desc: 'Web platform documentation', cat: 'Documentation', tags: ['html', 'css', 'javascript'], fav: true, t: 1 },
    { id: 2, name: 'Can I use', url: 'caniuse.com', desc: 'Browser support tables for web features', cat: 'Testing', tags: ['browser'], fav: false, t: 2 },
    { id: 3, name: 'Regex101', url: 'regex101.com', desc: 'Build, test, and explain regular expressions', cat: 'Tools', tags: ['regex', 'debugging'], fav: false, t: 3 },
    { id: 4, name: 'GitHub Docs', url: 'docs.github.com', desc: 'Guides for GitHub workflows and features', cat: 'Documentation', tags: ['git'], fav: false, t: 4 }
  ];
  const PAGES = [
    { name: 'web.dev', url: 'web.dev', desc: 'Guidance for high-quality web experiences', cat: 'Learning', tags: ['performance', 'accessibility'] },
    { name: 'JavaScript.info', url: 'javascript.info', desc: 'Modern JavaScript tutorial and reference', cat: 'Learning', tags: ['javascript', 'tutorial'] },
    { name: 'Stack Overflow', url: 'stackoverflow.com', desc: 'Community questions and answers', cat: 'Community', tags: ['questions'] },
    { name: 'TypeScript Docs', url: 'typescriptlang.org/docs', desc: 'Official TypeScript handbook', cat: 'Documentation', tags: ['typescript'] },
    { name: 'React Docs', url: 'react.dev', desc: 'Learn React with the official docs', cat: 'Documentation', tags: ['react', 'frontend'] },
    { name: 'Node.js Docs', url: 'nodejs.org/docs', desc: 'Official Node.js API documentation', cat: 'Documentation', tags: ['node', 'backend'] },
    { name: 'JSONLint', url: 'jsonlint.com', desc: 'Validate and format JSON data', cat: 'Tools', tags: ['json', 'validation'] }
  ];

  const D = { items: SEED.map(x => ({ ...x, tags: [...x.tags] })), page: 0, nextId: 10, q: '', cat: '', fav: false, sort: 'fav', undo: null };
  const el = { list: $('#popList'), count: $('#popCount'), q: $('#popQuery'), cat: $('#popCategory'), sort: $('#popSort'), fav: $('#popFav'),
    save: $('#saveTab'), toast: $('#popToast'), toastMsg: $('#popToastMsg'), undo: $('#popUndo'), addr: $('#address'), title: $('#pageTitle') };

  let toastTimer;
  function toast(msg, undoFn) {
    el.toastMsg.textContent = msg;
    el.undo.hidden = !undoFn; D.undo = undoFn || null;
    el.toast.classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.toast.classList.remove('show'), undoFn ? 4500 : 2200);
  }
  el.undo.addEventListener('click', () => { D.undo?.(); el.toast.classList.remove('show'); });

  const SORT = { fav: (a, b) => Number(b.fav) - Number(a.fav) || a.name.localeCompare(b.name), az: (a, b) => a.name.localeCompare(b.name), new: (a, b) => b.t - a.t };
  function updatePage() {
    const p = PAGES[D.page];
    if (p) { el.addr.textContent = p.url; el.title.textContent = p.name; el.save.textContent = 'Save this tab'; }
    else { el.addr.textContent = 'You saved them all'; el.title.textContent = 'That’s the whole demo'; el.save.textContent = 'Reset demo'; }
  }
  function render() {
    const cats = [...new Set(D.items.map(i => i.cat))].sort();
    el.cat.innerHTML = '<option value="">All categories</option>' + cats.map(c => `<option${c === D.cat ? ' selected' : ''}>${esc(c)}</option>`).join('');
    if (D.cat && !cats.includes(D.cat)) D.cat = '';
    const q = D.q.trim().toLowerCase();
    const shown = D.items.filter(i => (!D.cat || i.cat === D.cat) && (!D.fav || i.fav) &&
      (!q || [i.name, i.url, i.desc, i.cat, ...i.tags].join(' ').toLowerCase().includes(q))).sort(SORT[D.sort]);
    el.count.textContent = shown.length === D.items.length ? D.items.length : `${shown.length} of ${D.items.length}`;
    el.list.innerHTML = shown.length ? shown.map(i => `
      <article class="rc${i.fresh ? ' fresh' : ''}" data-id="${i.id}">
        <div class="rc-head"><div class="av">${esc(i.name[0].toUpperCase())}</div>
          <div class="rc-info"><b>${esc(i.name)}</b><span>${esc(i.url)}</span></div>
          <div class="rc-act">
            <button class="${i.fav ? 'on' : ''}" data-a="fav" aria-label="Favorite ${esc(i.name)}">${IC.star}</button>
            <button data-a="copy" aria-label="Copy link">${IC.copy}</button>
            <button data-a="del" aria-label="Delete ${esc(i.name)}">${IC.del}</button>
          </div></div>
        <p class="rc-desc">${esc(i.desc)}</p>
        <div class="rc-tags"><button class="tg cat" data-cat="${esc(i.cat)}">${esc(i.cat)}</button>${i.tags.map(t => `<button class="tg" data-tag="${esc(t)}">${esc(t)}</button>`).join('')}</div>
      </article>`).join('') : '<div class="pop-empty"><b>No matches</b><br>Try another word, or clear the filters.</div>';
    D.items.forEach(i => { i.fresh = false; });
  }

  el.save.addEventListener('click', () => {
    if (!PAGES[D.page]) { D.items = SEED.map(x => ({ ...x, tags: [...x.tags] })); D.page = 0; D.q = ''; el.q.value = ''; D.cat = ''; D.fav = false; el.fav.setAttribute('aria-pressed', 'false'); updatePage(); render(); toast('Demo reset'); return; }
    const p = PAGES[D.page++];
    const item = { ...p, tags: [...p.tags], id: D.nextId++, fav: false, t: D.nextId + 100, fresh: true };
    D.items.push(item); D.sort = 'new'; el.sort.value = 'new'; D.q = ''; el.q.value = ''; D.cat = ''; D.fav = false; el.fav.setAttribute('aria-pressed', 'false');
    updatePage(); render(); el.list.scrollTop = 0;
    toast(`Saved “${p.name}”`);
  });
  el.q.addEventListener('input', () => { D.q = el.q.value; render(); });
  el.cat.addEventListener('change', () => { D.cat = el.cat.value; render(); });
  el.sort.addEventListener('change', () => { D.sort = el.sort.value; render(); });
  el.fav.addEventListener('click', () => { D.fav = !D.fav; el.fav.setAttribute('aria-pressed', String(D.fav)); render(); });
  el.list.addEventListener('click', e => {
    const tagBtn = e.target.closest('[data-tag]'), catBtn = e.target.closest('[data-cat]'), act = e.target.closest('[data-a]');
    if (tagBtn) { D.q = tagBtn.dataset.tag; el.q.value = D.q; render(); return; }
    if (catBtn) { D.cat = catBtn.dataset.cat; render(); return; }
    if (!act) return;
    const id = +act.closest('.rc').dataset.id, item = D.items.find(i => i.id === id);
    if (act.dataset.a === 'fav') { item.fav = !item.fav; render(); }
    if (act.dataset.a === 'copy') { navigator.clipboard?.writeText('https://' + item.url).catch(() => {}); toast('Link copied'); }
    if (act.dataset.a === 'del') {
      const before = D.items.slice(); D.items = D.items.filter(i => i.id !== id); render();
      toast(`Deleted “${item.name}”`, () => { D.items = before; render(); });
    }
  });
  $('#extBtn')?.addEventListener('click', e => { const hidden = $('#pop').classList.toggle('is-hidden'); e.currentTarget.classList.toggle('is-open', !hidden); });
  updatePage(); render();

  /* =====================================================
     HOW IT WORKS — the sticky mini popup follows the steps
     ===================================================== */
  const mini = { list: $('#miniList'), count: $('#miniCount'), q: $('#miniQuery'), search: $('.mini-search'), btn: $('#miniBtn'), toast: $('#miniToast') };
  if (mini.list) {
    const base = [{ name: 'Can I use', url: 'caniuse.com', desc: 'Browser support tables', cat: 'Testing', tags: ['browser'] },
      { name: 'GitHub Docs', url: 'docs.github.com', desc: 'Guides for GitHub workflows', cat: 'Documentation', tags: ['git'] }];
    const fresh = { name: 'Regex101', url: 'regex101.com', desc: 'Build, test, and explain regular expressions', cat: 'Tools', tags: ['regex', 'debugging'], isNew: true };
    const row = (i, full) => `<article class="rc${i.isNew ? ' fresh' : ''}"><div class="rc-head"><div class="av">${esc(i.name[0])}</div><div class="rc-info"><b>${esc(i.name)}</b><span>${esc(i.url)}</span></div></div>` +
      (full ? `<div class="rc-tags"><span class="tg cat">${esc(i.cat)}</span>${i.tags.map(t => `<span class="tg">${esc(t)}</span>`).join('')}</div>` : '') + '</article>';
    let timers = [], current = 0;
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    function paint(items, full, total) { mini.list.innerHTML = items.map(i => row(i, full)).join(''); mini.count.textContent = (items.length === total ? total : `${items.length} of ${total}`) + ' resources'; }
    function setStep(n) {
      if (n === current) return; current = n;
      timers.forEach(clearTimeout); timers = [];
      mini.toast.classList.remove('show'); mini.search.classList.remove('focus'); mini.q.textContent = '';
      if (n === 1) {
        mini.btn.classList.add('pulse'); paint(base, false, 2);
        if (!reduce) later(() => { mini.btn.classList.remove('pulse'); paint([fresh, ...base], false, 3); mini.toast.classList.add('show'); later(() => mini.toast.classList.remove('show'), 2200); }, 1200);
        else { paint([fresh, ...base], false, 3); }
      } else if (n === 2) { mini.btn.classList.remove('pulse'); paint([fresh, ...base], true, 3); }
      else if (n === 3) {
        mini.btn.classList.remove('pulse'); paint([fresh, ...base], true, 3); mini.search.classList.add('focus');
        const word = 'regex'; let k = 0;
        const type = () => { mini.q.textContent = word.slice(0, ++k); if (k < word.length) later(type, 140); else later(() => paint([fresh], true, 3), 250); };
        reduce ? (mini.q.textContent = word, paint([fresh], true, 3)) : later(type, 500);
      }
    }
    current = -1; setStep(1);
    const stepEls = $$('.step');
    const stepIO = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { stepEls.forEach(s => s.classList.toggle('is-active', s === e.target)); setStep(+e.target.dataset.step); }
    }), { rootMargin: '-42% 0px -42% 0px' });
    stepEls.forEach(s => stepIO.observe(s));
  }
})();
