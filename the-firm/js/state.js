/* THE FIRM — game state (hidden stats, flags, findings). Nothing here is shown as a HUD meter. */
(function (F) {
  'use strict';
  const S = {
    chapter: 1,
    flags: {},
    trust: { wendt: 0, jonas: 0, marta: 0, steinhauer: 0 }, // hidden relationship values
    findings: {},    // discovered facts from documents
    redlines: {},    // clause decisions
    links: {},       // case board connections made
    readMail: {},
    readDocs: {},
    stage: 'arrive',
    time: '07:12',
  };
  F.state = S;
  F.flag = (k, v) => { if (v === undefined) return !!S.flags[k]; S.flags[k] = v; F.save(); return v; };
  F.find = (k) => { if (!S.findings[k]) { S.findings[k] = true; F.save(); F.emit('finding', k); return true; } return false; };
  F.trust = (who, d) => { S.trust[who] = (S.trust[who] || 0) + d; F.save(); };
  F.save = () => { try { localStorage.setItem('thefirm.save', JSON.stringify(S)); } catch (e) { /* storage unavailable */ } };
  F.loadSave = () => {
    try { const d = JSON.parse(localStorage.getItem('thefirm.save') || 'null'); if (d) Object.assign(S, d); return !!d; } catch (e) { return false; }
  };
  F.resetSave = () => { try { localStorage.removeItem('thefirm.save'); } catch (e) { /* ignore */ } };
})(window.F);
