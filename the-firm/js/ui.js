/* THE FIRM — overlay UI: fades, letterbox, cards, dialogue, choices, hover labels, phone, toasts */
(function (F) {
  'use strict';
  const U = F.U;
  const $ = (sel) => document.querySelector(sel);
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  F.el = el;
  const ui = { _m: 0 };
  // modal is a counter so stacked panels (OS → document) behave
  Object.defineProperty(ui, 'modal', { get() { return this._m > 0; }, set(v) { this._m = Math.max(0, this._m + (v ? 1 : -1)); } });
  F.ui = ui;
  const root = $('#ui');

  // stop DOM overlay clicks from reaching the canvas
  root.addEventListener('pointerdown', (e) => { if (e.target !== root) e.stopPropagation(); });

  // ------------------------------------------------------------------ fade / letterbox / flash
  const fader = el('div', 'fader'); document.body.appendChild(fader);
  fader.style.opacity = 1;
  const bars = el('div', 'bars', '<i></i><i></i>'); document.body.appendChild(bars);
  F.fx = {
    fade(to, ms) {
      return new Promise((res) => {
        fader.style.transition = `opacity ${ms}ms cubic-bezier(.4,0,.2,1)`;
        requestAnimationFrame(() => { fader.style.opacity = to; });
        setTimeout(res, ms + 30);
      });
    },
    fadeWhite(ms) { fader.classList.add('white'); return F.fx.fade(1, ms); },
    black() { fader.classList.remove('white'); },
    bars(on, ms) { bars.style.transitionDuration = (ms || 1200) + 'ms'; bars.classList.toggle('on', !!on); document.body.classList.toggle('letterbox', !!on); },
  };

  // ------------------------------------------------------------------ title cards / location stamps
  ui.card = (lines, opts) => {
    opts = opts || {};
    const c = el('div', 'card ' + (opts.cls || ''));
    lines.forEach((l, i) => {
      const d = el('div', 'card-line ' + (l.cls || ''), l.text);
      d.style.animationDelay = (opts.stagger == null ? 0.35 : opts.stagger) * i + 's';
      c.appendChild(d);
    });
    document.body.appendChild(c); // above the fader (outside #ui stacking context)
    const hold = opts.hold || 3200;
    return new Promise((res) => {
      setTimeout(() => { c.classList.add('out'); setTimeout(() => { c.remove(); res(); }, 1100); }, hold);
    });
  };
  ui.stamp = (place, time, sub) => {
    const c = el('div', 'stamp', `<div class="stamp-place">${place}</div><div class="stamp-time">${time}</div>${sub ? `<div class="stamp-sub">${sub}</div>` : ''}`);
    root.appendChild(c);
    setTimeout(() => { c.classList.add('out'); setTimeout(() => c.remove(), 1400); }, 4200);
  };
  ui.caption = (text, ms) => {
    const c = el('div', 'caption', text);
    root.appendChild(c);
    setTimeout(() => { c.classList.add('out'); setTimeout(() => c.remove(), 900); }, ms || 3000);
  };

  // ------------------------------------------------------------------ objective whisper (minimal HUD)
  const obj = el('div', 'objective'); root.appendChild(obj);
  let objText = '';
  ui.objective = (text) => {
    objText = text;
    obj.innerHTML = `<span>${text}</span>`;
    obj.classList.remove('show'); void obj.offsetWidth; obj.classList.add('show');
    clearTimeout(obj._t);
    obj._t = setTimeout(() => obj.classList.remove('show'), 5200);
  };
  F.on('key', (e) => { if (e.key === 'Tab') { e.preventDefault(); if (objText) ui.objective(objText); } });

  // ------------------------------------------------------------------ hover label
  const hl = el('div', 'hoverlabel', '<b></b><span></span>'); root.appendChild(hl);
  let hlA = 0;
  ui.clearHover = () => { hl.style.opacity = 0; hlA = 0; };
  ui.updateHover = (dt) => {
    const h = F.hover;
    const target = h && !F.inputLocked && !ui.modal ? 1 : 0;
    hlA = U.damp(hlA, target, 14, dt);
    hl.style.opacity = hlA.toFixed(3);
    if (h) {
      hl.firstChild.textContent = h.label || '';
      hl.lastChild.textContent = h.sub || '';
      hl.style.transform = `translate(${F.mouse.x + 22}px, ${F.mouse.y + 14}px)`;
    }
  };

  // ------------------------------------------------------------------ dialogue
  const dlg = el('div', 'dlg', '<div class="dlg-shade"></div><div class="dlg-inner"><div class="dlg-name"></div><div class="dlg-text"></div><div class="dlg-choices"></div><div class="dlg-next">▸</div></div>');
  root.appendChild(dlg);
  const dName = dlg.querySelector('.dlg-name'), dText = dlg.querySelector('.dlg-text'), dCh = dlg.querySelector('.dlg-choices'), dNext = dlg.querySelector('.dlg-next');
  ui.dialogueOpen = (on) => { dlg.classList.toggle('on', on); };
  ui.speaking = null;

  // render words with staggered fade; returns total reveal ms
  function renderText(text) {
    dText.innerHTML = '';
    let gloss = null;
    text = text.replace(/<span class="gloss">([\s\S]*?)<\/span>/, (m, g1) => { gloss = g1; return ''; }).trim();
    const words = text.split(/(\s+)/);
    let delay = 0;
    words.forEach((w) => {
      if (/^\s+$/.test(w)) { dText.appendChild(document.createTextNode(' ')); return; }
      if (w === '|') { delay += 420; return; } // dramatic pause token
      const s = el('span', 'w', w.replace(/\*(.+?)\*/g, '<em>$1</em>'));
      s.style.animationDelay = delay + 'ms';
      dText.appendChild(s);
      delay += 34 + w.length * 7;
      if (/[.?!…—]$/.test(w)) delay += 160;
      else if (/[,;:]$/.test(w)) delay += 70;
    });
    if (gloss) { const gl = el('span', 'gloss w', gloss); gl.style.animationDelay = delay + 'ms'; dText.appendChild(gl); delay += 200; }
    return delay;
  }
  function finishText() { dText.querySelectorAll('.w').forEach((s) => { s.style.animationDelay = '0ms'; s.style.animationDuration = '120ms'; }); }

  // say(speakerName, text, {role, onStart}) → resolves on click
  ui.say = (name, text, o) => {
    o = o || {};
    ui.dialogueOpen(true);
    dCh.innerHTML = '';
    dName.innerHTML = name ? `${name}${o.role ? `<i>${o.role}</i>` : ''}` : '';
    dName.style.display = name ? '' : 'none';
    dlg.classList.toggle('narr', !name);
    const total = renderText(text);
    dNext.classList.remove('on');
    ui.speaking = o.speaker || null;
    const t0 = performance.now();
    return new Promise((res) => {
      let done = false;
      const readyAt = t0 + total;
      setTimeout(() => { if (!done) dNext.classList.add('on'); }, total + 200);
      const onAdv = () => {
        if (performance.now() < readyAt) { finishText(); ui.speaking = null; dNext.classList.add('on'); return; }
        done = true;
        F.off('advance', onAdv);
        dlg.removeEventListener('pointerdown', onClick);
        ui.speaking = null;
        res();
      };
      const onClick = (e) => { e.stopPropagation(); onAdv(); };
      setTimeout(() => { F.on('advance', onAdv); dlg.addEventListener('pointerdown', onClick); }, 250);
      setTimeout(() => { if (ui.speaking === o.speaker) ui.speaking = null; }, total);
    });
  };
  ui.choose = (options, o) => {
    o = o || {};
    ui.dialogueOpen(true);
    dNext.classList.remove('on');
    dCh.innerHTML = '';
    if (o.prompt != null) { dName.style.display = 'none'; renderText(o.prompt); dlg.classList.add('narr'); }
    dlg.classList.add('choosing');
    return new Promise((res) => {
      const items = options.map((opt, i) => {
        const b = el('button', 'choice' + (opt.tag ? ' tagged' : ''), `<span class="n">${i + 1}</span><span class="t">${opt.text}</span>${opt.tag ? `<span class="tag">${opt.tag}</span>` : ''}`);
        b.style.animationDelay = 120 + i * 90 + 'ms';
        if (opt.disabled) b.disabled = true;
        b.addEventListener('pointerdown', (e) => { e.stopPropagation(); pick(i); });
        b.addEventListener('mouseenter', () => F.audio.hover());
        dCh.appendChild(b);
        return b;
      });
      const onKey = (e) => { const n = parseInt(e.key, 10); if (n >= 1 && n <= options.length && !options[n - 1].disabled) pick(n - 1); };
      F.on('key', onKey);
      function pick(i) {
        F.off('key', onKey);
        F.audio.click();
        items.forEach((b, j) => b.classList.add(j === i ? 'picked' : 'gone'));
        setTimeout(() => { dCh.innerHTML = ''; dlg.classList.remove('choosing'); res(i); }, 450);
      }
    });
  };
  ui.dialogueClose = () => { ui.dialogueOpen(false); dText.innerHTML = ''; dName.innerHTML = ''; dCh.innerHTML = ''; };

  // ------------------------------------------------------------------ toast (email arrivals etc.)
  ui.toast = (title, body, icon) => {
    const t = el('div', 'toast', `<div class="toast-ic">${icon || '✉'}</div><div><b>${title}</b><span>${body}</span></div>`);
    root.appendChild(t);
    F.audio.chime();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 800); }, 4200);
  };

  // ------------------------------------------------------------------ phone (physical, slides into frame)
  const phone = el('div', 'phone', `
    <div class="ph-body"><div class="ph-screen">
      <div class="ph-status"><span class="ph-clock">07:19</span><span>●●● 5G ▮▮▮</span></div>
      <div class="ph-head"><div class="ph-av"></div><div><b class="ph-who"></b><span class="ph-sub"></span></div></div>
      <div class="ph-thread"></div>
      <div class="ph-foot">iMessage</div>
    </div></div>`);
  root.appendChild(phone);
  ui.phone = {
    open(who, sub, msgs, clock) {
      ui.modal = true;
      phone.querySelector('.ph-who').textContent = who;
      phone.querySelector('.ph-sub').textContent = sub || '';
      phone.querySelector('.ph-av').textContent = who.split(' ').map((s) => s[0]).join('').slice(0, 2);
      if (clock) phone.querySelector('.ph-clock').textContent = clock;
      const th = phone.querySelector('.ph-thread');
      th.innerHTML = '';
      msgs.forEach((m, i) => {
        const b = el('div', 'ph-msg ' + (m.me ? 'me' : ''), m.text + (m.time ? `<i>${m.time}</i>` : ''));
        b.style.animationDelay = 0.5 + i * 0.5 + 's';
        th.appendChild(b);
      });
      phone.classList.add('on');
      F.audio.paper();
      return new Promise((res) => {
        const close = (e) => {
          if (e && e.type === 'keydown' && e.key !== 'Escape' && e.key !== ' ' && e.key !== 'Enter') return;
          phone.classList.remove('on');
          document.removeEventListener('pointerdown', close, true);
          document.removeEventListener('keydown', close, true);
          setTimeout(() => { ui.modal = false; res(); }, 450);
        };
        setTimeout(() => { document.addEventListener('pointerdown', close, true); document.addEventListener('keydown', close, true); }, 700 + msgs.length * 500);
      });
    },
  };

  // incoming call — cinematic overlay
  const call = el('div', 'call', `<div class="call-ring"></div><div class="call-who"></div><div class="call-sub"></div><div class="call-btns"><button class="call-ans">Answer</button></div>`);
  root.appendChild(call);
  ui.incomingCall = (who, sub) => new Promise((res) => {
    call.querySelector('.call-who').textContent = who;
    call.querySelector('.call-sub').textContent = sub || 'Mobile';
    call.classList.add('on');
    ui.modal = true;
    let ringing = setInterval(() => F.audio.buzz(2), 2200);
    F.audio.buzz(2);
    const btn = call.querySelector('.call-ans');
    const ans = (e) => { e.stopPropagation(); clearInterval(ringing); btn.removeEventListener('pointerdown', ans); call.classList.remove('on'); ui.modal = false; F.audio.click(); setTimeout(res, 400); };
    btn.addEventListener('pointerdown', ans);
  });

  // ------------------------------------------------------------------ chapter / modal panels helper
  ui.panel = (cls, html) => {
    const p = el('div', 'panel ' + (cls || ''), html);
    root.appendChild(p);
    requestAnimationFrame(() => p.classList.add('on'));
    ui.modal = true;
    let closed = false;
    return {
      node: p,
      close() { if (closed) return; closed = true; p.classList.remove('on'); ui.modal = false; setTimeout(() => p.remove(), 600); },
    };
  };
})(window.F);
