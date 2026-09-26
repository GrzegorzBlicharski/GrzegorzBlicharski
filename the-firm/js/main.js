/* THE FIRM — boot */
(function (F) {
  'use strict';
  const params = new URLSearchParams(location.search);
  F.startLoop();

  async function boot() {
    try { await document.fonts.ready; } catch (e) { /* fonts optional */ }
    // developer jumps: ?scene=office&mode=evening  or  ?story=partner
    const jumpScene = params.get('scene'), jumpStory = params.get('story'), jumpSt = params.get('st');
    if (jumpScene || jumpStory || jumpSt) {
      F.audio.init();
      const opts = {};
      params.forEach((v, k) => { if (k !== 'scene' && k !== 'story' && k !== 'st') opts[k] = v; });
      if (params.has('findall')) { Object.keys(F.EVIDENCE).forEach((k) => (F.state.findings[k] = true)); }
      if (jumpSt) { const [n, fn] = jumpSt.split('.'); const T = F['story' + n]; if (T) { if (n !== '1' && n !== '') F.state.chapter = +n; T[fn || 'start'](opts); } return; }
      if (jumpStory && F.story[jumpStory]) { F.story[jumpStory](opts); return; }
      await F.go(jumpScene, Object.assign({ cut: true, fadeIn: 10 }, opts));
      return;
    }
    F.story.title();
  }
  boot();
})(window.F);
