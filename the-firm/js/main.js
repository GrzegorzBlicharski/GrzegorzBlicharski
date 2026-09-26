/* THE FIRM — boot */
(function (F) {
  'use strict';
  const params = new URLSearchParams(location.search);
  F.startLoop();

  async function boot() {
    try { await document.fonts.ready; } catch (e) { /* fonts optional */ }
    // developer jumps: ?scene=office&mode=evening  or  ?story=partner
    const jumpScene = params.get('scene'), jumpStory = params.get('story');
    if (jumpScene || jumpStory) {
      F.audio.init();
      const opts = {};
      params.forEach((v, k) => { if (k !== 'scene' && k !== 'story') opts[k] = v; });
      if (params.has('findall')) { Object.keys(F.EVIDENCE).forEach((k) => (F.state.findings[k] = true)); }
      if (jumpStory && F.story[jumpStory]) { F.story[jumpStory](opts); return; }
      await F.go(jumpScene, Object.assign({ cut: true, fadeIn: 10 }, opts));
      return;
    }
    F.story.title();
  }
  boot();
})(window.F);
