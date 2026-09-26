/* THE FIRM — the case board in the project room. Pin, connect, understand. */
(function (F) {
  'use strict';
  const el = F.el;

  const NODES = {
    zielinski: { type: 'photo', x: 14, y: 22, rot: -3, title: 'Tomasz Zieliński', sub: 'President · KS Carbo', portrait: 'zielinski' },
    anna: { type: 'photo', x: 14, y: 64, rot: 2.5, title: 'Anna Zielińska', sub: '?', portrait: 'anna', need: ['spouse', 'anna'], hint: 'Who is Anna? Open sources.' },
    vistula: { type: 'doc', x: 38, y: 70, rot: -1.5, title: 'Odra Capital sp. z o.o.', body: 'KRS 0000981234<br>registered <b>18.09.2026</b><br>capital PLN 5,000', need: ['anna', 'factoring', 'newco'], hint: 'A name in the board minutes. Check the registry.' },
    factoring: { type: 'doc', x: 42, y: 30, rot: 1.8, title: 'Factoring agreement', body: 'Board consent <b>02.10.2026</b><br>media receivables 2027–30<br>at <b>61%</b> of face value', need: ['factoring'], hint: 'Something the board approved on 2 October.' },
    tv: { type: 'note', x: 64, y: 12, rot: -4, title: 'Media rights', body: 'Ekstraklasa TV money<br>≈ 40% of club revenue<br>2027/28 – 2029/30' },
    folder73: { type: 'note', x: 66, y: 44, rot: 3, title: 'VDR 7.3 “Financing”', body: 'closed 03:12<br>by seller’s counsel', need: ['revoked', 'cfo'], hint: 'Check the data room index.' },
    spa74: { type: 'clause', x: 84, y: 26, rot: -1, title: 'SPA §7.4', body: '“No receivables have been assigned, factored or sold.”' },
    spa34: { type: 'clause', x: 64, y: 76, rot: 1.2, title: 'SPA §3.4', body: '“Permitted Leakage … payments to a Related Party”' },
    lease: { type: 'doc', x: 86, y: 62, rot: 2, title: 'Stadium lease §14.2', body: 'City may terminate<br>on <b>change of control</b>', need: ['lease'], hint: 'Real estate folder — the stadium.' },
    spa63: { type: 'clause', x: 86, y: 88, rot: -2, title: 'SPA §6.3', body: '“…termination at the Purchaser’s sole risk.”' },
    uefa: { type: 'note', x: 30, y: 10, rot: 2, title: 'UEFA licence', body: 'renewed for 2027<br>(no issues)' },
  };
  const LINKS = [
    { a: 'zielinski', b: 'anna', label: 'married', core: true },
    { a: 'anna', b: 'vistula', label: '100% owner', core: true },
    { a: 'vistula', b: 'factoring', label: 'buyer of receivables', core: true },
    { a: 'factoring', b: 'spa74', label: 'breaches warranty', core: true },
    { a: 'factoring', b: 'tv', label: 'sells 2027–30' },
    { a: 'vistula', b: 'spa34', label: 'related party' },
    { a: 'lease', b: 'spa63', label: 'risk shifted to us' },
    { a: 'folder73', b: 'factoring', label: 'hidden' },
    { a: 'zielinski', b: 'factoring', label: 'left the room (conflict)' },
  ];
  const key = (a, b) => [a, b].sort().join('|');
  const unlocked = (id) => { const n = NODES[id]; return !n.need || n.need.some((e) => F.state.findings[e]); };

  F.openBoard = () => new Promise((res) => {
    const S = F.state;
    const p = F.ui.panel('board', `
      <div class="bd-wall"></div><div class="bd-lamp"></div>
      <div class="bd-area"><svg class="bd-svg"><defs><filter id="strshadow" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="3" stdDeviation="2" flood-opacity=".55"/></filter></defs><g class="bd-links"></g><path class="bd-temp" /></svg></div>
      <div class="bd-title">PROJEKT CARBO<span>project room 22.3 · Monday 18:58</span></div>
      <div class="bd-help">Drag from one card to another to connect them. Cards with “?” need evidence from the documents.</div>
      <button class="bd-close">Step back <kbd>Esc</kbd></button>
      <div class="bd-reveal"></div>`);
    const area = p.node.querySelector('.bd-area');
    const svg = p.node.querySelector('.bd-svg');
    const gl = p.node.querySelector('.bd-links');
    const temp = p.node.querySelector('.bd-temp');
    const cards = {};

    Object.keys(NODES).forEach((id) => {
      const n = NODES[id];
      const open = unlocked(id);
      const c = el('div', `bd-card t-${n.type} ${open ? '' : 'locked'}`);
      c.style.left = n.x + '%'; c.style.top = n.y + '%';
      c.style.setProperty('--rot', n.rot + 'deg');
      c.dataset.id = id;
      let inner = '';
      if (!open) inner = `<div class="bd-q">?</div><div class="bd-hint">${n.hint}</div>`;
      else if (n.type === 'photo') inner = `<canvas width="220" height="220"></canvas><div class="bd-cap">${n.title}<i>${id === 'anna' && S.findings.spouse ? 'wife of T. Zieliński' : n.sub}</i></div>`;
      else inner = `<div class="bd-t">${n.title}</div><div class="bd-b">${n.body}</div>`;
      c.innerHTML = `<i class="pin"></i>${inner}`;
      area.appendChild(c);
      cards[id] = c;
      if (open && n.type === 'photo') {
        const g = c.querySelector('canvas').getContext('2d');
        const bg = g.createLinearGradient(0, 0, 0, 220); bg.addColorStop(0, '#4a4f58'); bg.addColorStop(1, '#1a1c20');
        g.fillStyle = bg; g.fillRect(0, 0, 220, 220);
        F.people.draw(g, F.people.cast[n.portrait], 110, 1150, 1100, { crop: 'bust', turn: id === 'anna' ? -0.2 : 0.25, expr: id === 'anna' ? 'smile' : 'cold', slot: 'board', light: { key: [255, 244, 225], keyA: 0.75, dir: -1, amb: [130, 128, 130], rimA: 0.25 } });
        const d = g.getImageData(0, 0, 220, 220);
        for (let k = 0; k < d.data.length; k += 4) { const v = d.data[k] * 0.35 + d.data[k + 1] * 0.5 + d.data[k + 2] * 0.15; d.data[k] = v * 1.08 + 10; d.data[k + 1] = v * 1.0 + 6; d.data[k + 2] = v * 0.88; }
        g.putImageData(d, 0, 0);
      }
    });

    const pinPos = (id) => {
      const c = cards[id], ar = area.getBoundingClientRect(), r = c.getBoundingClientRect();
      return { x: r.left + r.width / 2 - ar.left, y: r.top + 10 - ar.top };
    };
    const pathD = (a, b) => {
      const dx = b.x - a.x, dy = b.y - a.y, dist = Math.hypot(dx, dy);
      return `M${a.x},${a.y} Q${(a.x + b.x) / 2},${(a.y + b.y) / 2 + dist * 0.12} ${b.x},${b.y}`;
    };
    const drawLinks = (animateKey) => {
      gl.innerHTML = '';
      LINKS.forEach((L) => {
        if (!S.links[key(L.a, L.b)]) return;
        const a = pinPos(L.a), b = pinPos(L.b);
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathD(a, b));
        path.setAttribute('class', 'str' + (L.core ? ' core' : '') + (animateKey === key(L.a, L.b) ? ' draw' : ''));
        gl.appendChild(path);
        const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        t.setAttribute('x', (a.x + b.x) / 2); t.setAttribute('y', (a.y + b.y) / 2 + dist * 0.06 - 8);
        t.setAttribute('class', 'strlab'); t.textContent = L.label;
        gl.appendChild(t);
        cards[L.a].classList.add('linked'); cards[L.b].classList.add('linked');
      });
    };
    requestAnimationFrame(() => drawLinks());
    const onResize = () => drawLinks();
    window.addEventListener('resize', onResize);

    // dragging strings
    let drag = null;
    area.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      const c = e.target.closest('.bd-card');
      if (!c || c.classList.contains('locked')) return;
      drag = { from: c.dataset.id };
      c.classList.add('src');
      F.audio.tone(700, 0.08, 0.015);
      area.setPointerCapture(e.pointerId);
    });
    area.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const ar = area.getBoundingClientRect();
      const a = pinPos(drag.from), b = { x: e.clientX - ar.left, y: e.clientY - ar.top };
      temp.setAttribute('d', pathD(a, b));
      const over = document.elementFromPoint(e.clientX, e.clientY);
      const oc = over && over.closest && over.closest('.bd-card');
      Object.values(cards).forEach((c) => c.classList.toggle('over', c === oc && c.dataset.id !== drag.from));
    });
    area.addEventListener('pointerup', (e) => {
      if (!drag) return;
      temp.setAttribute('d', '');
      const over = document.elementFromPoint(e.clientX, e.clientY);
      const oc = over && over.closest && over.closest('.bd-card');
      Object.values(cards).forEach((c) => c.classList.remove('over', 'src'));
      const from = drag.from; drag = null;
      if (!oc || oc.dataset.id === from) return;
      const to = oc.dataset.id;
      if (oc.classList.contains('locked')) { F.audio.wrong(); return; }
      const L = LINKS.find((l) => key(l.a, l.b) === key(from, to));
      if (L) {
        if (!S.links[key(from, to)]) {
          S.links[key(from, to)] = true; F.save();
          F.audio.connect();
          drawLinks(key(from, to));
          [cards[from], cards[to]].forEach((c) => { c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash'); });
          checkReveal();
        }
      } else {
        F.audio.wrong();
        [cards[from], cards[to]].forEach((c) => { c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake'); });
      }
    });

    const reveal = p.node.querySelector('.bd-reveal');
    function checkReveal() {
      const core = LINKS.filter((l) => l.core).every((l) => S.links[key(l.a, l.b)]);
      if (core && !F.flag('boardSolved')) {
        F.flag('boardSolved', true);
        setTimeout(() => {
          F.audio.reveal();
          F.audio.chord('tense');
          p.node.classList.add('revealed');
          reveal.innerHTML = `<div class="rv-k">The shape of it</div>
            <div class="rv-h">He is selling the club’s future<br>to his wife.</div>
            <div class="rv-p">Three weeks ago Anna Zielińska founded Odra Capital with five thousand złoty. On 2 October the club agreed to sell it three seasons of TV money at 61 cents on the euro. Folder 7.3 closed at 03:12. And the seller’s draft makes the entire data room “disclosed” — so the warranty that would have caught it is worthless.</div>
            <button class="rv-go">Continue</button>`;
          reveal.querySelector('.rv-go').addEventListener('pointerdown', (e) => { e.stopPropagation(); close(); });
        }, 900);
      }
    }
    if (F.flag('boardSolved')) p.node.classList.add('solved');

    const close = () => { F.off('key', onKey); window.removeEventListener('resize', onResize); p.close(); setTimeout(res, 350); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    F.on('key', onKey);
    p.node.querySelector('.bd-close').addEventListener('pointerdown', (e) => { e.stopPropagation(); close(); });
  });

  F.boardLinksCount = () => LINKS.filter((l) => F.state.links[key(l.a, l.b)]).length;
})(window.F);
