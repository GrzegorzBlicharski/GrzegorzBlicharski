/* THE FIRM — generic work product: a written opinion answered question by question, each answer cited to evidence.
   Used from Chapter III on (Chapter II keeps its own Stellungnahme in documents2.js).
   cfg = { key, ch, qs, folder, title, lh, heading, meta, extra, send, flag } → Promise(sent) */
(function (F) {
  'use strict';

  const store = (cfg) => {
    const S = F.state;
    S[cfg.key] = S[cfg.key] || {};
    S[cfg.key].memo = S[cfg.key].memo || {};
    return S[cfg.key].memo;
  };

  F.workMemo = (cfg) => new Promise((res) => {
    const S = F.state;
    const M = store(cfg);
    const found = () => Object.keys(F.EVIDENCE).filter((k) => F.EVIDENCE[k].ch === cfg.ch && S.findings[k]);
    const p = F.ui.panel('redline memo', `
      <div class="dv-dim"></div>
      <div class="dv-top"><span class="dv-folder">${cfg.folder || 'Your work product'}</span><span class="dv-title">${cfg.title}</span><button class="dv-close">Put down <kbd>Esc</kbd></button></div>
      <div class="rl-nav"><div class="rl-navh">Evidence you have noted</div><div class="memo-ev"></div><button class="rl-send" disabled>${cfg.send || 'Send'}</button><div class="rl-left"></div></div>
      <div class="dv-scroll"><div class="paper kind-memo"><div class="paper-inner">
        <div class="lh"><div class="lh-firm">ADLER WENDT <span>KANCELARIA · RECHTSANWÄLTE</span></div><div class="lh-addr">${cfg.lh || 'ul. Zwycięstwa 7 · 44-100 Gliwice'}</div></div>
        <h1 class="memo-h">${cfg.heading}</h1>
        <div class="memo-meta">${cfg.meta}</div>
        ${cfg.extra || ''}
        <div class="memo-qs"></div>
      </div></div></div>`);
    const qs = p.node.querySelector('.memo-qs'), evl = p.node.querySelector('.memo-ev'), send = p.node.querySelector('.rl-send'), left = p.node.querySelector('.rl-left');
    const render = () => {
      const fnd = found();
      evl.innerHTML = fnd.length ? fnd.map((k) => `<div class="mev"><b>${F.EVIDENCE[k].label}</b><span>${F.EVIDENCE[k].src}</span></div>`).join('') : '<div class="mev-none">Nothing noted yet. Open the file and click the passages that matter.</div>';
      qs.innerHTML = cfg.qs.map((Q) => {
        const a = M[Q.id] || {};
        return `<section class="mq" data-q="${Q.id}"><h3>${Q.q}</h3><div class="mq-hint">${Q.hint}</div>
          ${Q.opts.map((o, i) => `<button class="mo ${a.opt === i ? 'on' : ''}" data-i="${i}"><i>${String.fromCharCode(65 + i)}</i>${o.t}</button>`).join('')}
          <div class="mq-sup"><span>Supported by:</span>${fnd.length ? fnd.map((k) => `<button class="chip ${a.sup === k ? 'on' : ''}" data-k="${k}">${F.EVIDENCE[k].src}</button>`).join('') : '<em>— no evidence noted —</em>'}</div></section>`;
      }).join('');
      const n = cfg.qs.filter((Q) => M[Q.id] && M[Q.id].opt != null).length;
      send.disabled = n < cfg.qs.length;
      left.textContent = n < cfg.qs.length ? `${cfg.qs.length - n} questions open` : 'Ready to send';
      qs.querySelectorAll('.mo').forEach((b) => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); const q = b.closest('.mq').dataset.q; M[q] = M[q] || {}; M[q].opt = +b.dataset.i; F.save(); F.audio.paper(); render(); }));
      qs.querySelectorAll('.chip').forEach((b) => b.addEventListener('pointerdown', (e) => { e.stopPropagation(); const q = b.closest('.mq').dataset.q; M[q] = M[q] || {}; M[q].sup = b.dataset.k; F.save(); F.audio.click(); render(); }));
    };
    render();
    F.audio.paper();
    let sent = false;
    const close = () => { F.off('key', onKey); p.close(); setTimeout(() => res(sent), 300); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    F.on('key', onKey);
    p.node.querySelector('.dv-close').addEventListener('pointerdown', (e) => { e.stopPropagation(); close(); });
    send.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (send.disabled) return; sent = true; if (cfg.flag) F.flag(cfg.flag, true); F.audio.whoosh(); close(); });
  });

  F.scoreWork = (cfg) => {
    const M = store(cfg);
    let right = 0, cited = 0; const missed = [];
    cfg.qs.forEach((Q) => {
      const a = M[Q.id] || {};
      const o = Q.opts[a.opt];
      if (o && o.ok) right++; else missed.push(Q);
      if (a.sup && Q.support.includes(a.sup)) cited++;
    });
    return { right, cited, missed, total: cfg.qs.length };
  };
  F.workOk = (cfg, id) => { const M = store(cfg); const Q = cfg.qs.find((q) => q.id === id); const a = M[id]; return !!(Q && a && Q.opts[a.opt] && Q.opts[a.opt].ok); };
})(window.F);
