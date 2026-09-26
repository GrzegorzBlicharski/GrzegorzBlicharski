import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/bebas-neue/400.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/400-italic.css';
import './styles.css';
import { useGame } from '../engine/store';
import { audio } from '../engine/audio';
import { Menu, NewGame, Opening } from './screens/Menu';
import { World } from './screens/World';
import { MapOverlay, Travel } from './screens/MapOverlay';
import { Phone } from './phone/Phone';
import { Dossier } from './screens/Dossier';
import { Training } from './screens/Training';
import { ChapterCard, DayEnd, Debrief, IncomingCall, Settings, Toast } from './screens/Overlays';

function App() {
  const screen = useGame((s) => s.ui.screen);
  const overlay = useGame((s) => s.ui.overlay);
  const travel = useGame((s) => s.ui.travel);
  const ringing = useGame((s) => s.ui.ringing);
  const inDialogue = useGame((s) => !!s.ui.dialogue);
  const settings = useGame((s) => s.settings);

  // Audio can only start after a user gesture.
  useEffect(() => {
    const unlock = () => {
      audio.init();
      audio.setVolume(settings.volume);
      audio.setEnabled(settings.ambience);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [settings.volume, settings.ambience]);

  useEffect(() => {
    if (travel) audio.sfx('transit');
  }, [travel]);

  // global shortcuts
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const s = useGame.getState();
      if (s.ui.screen !== 'world') return;
      if (e.key === 'Escape') {
        if (s.ui.overlay && s.ui.overlay !== 'debrief' && s.ui.overlay !== 'dayEnd') s.closeOverlay();
        else if (!s.ui.overlay && !s.ui.dialogue) s.openOverlay('settings');
        return;
      }
      if (s.ui.dialogue || (s.ui.overlay && s.ui.overlay !== 'map' && s.ui.overlay !== 'phone' && s.ui.overlay !== 'profile')) return;
      const k = e.key.toLowerCase();
      if (k === 'm') s.ui.overlay === 'map' ? s.closeOverlay() : s.openOverlay('map');
      if (k === 'h') s.ui.overlay === 'phone' ? s.closeOverlay() : s.openOverlay('phone', null);
      if (k === 'p') s.ui.overlay === 'profile' ? s.closeOverlay() : s.openOverlay('profile');
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  const letterbox = screen === 'world' && inDialogue;

  return (
    <div className={`app ${settings.reduceMotion ? 'reduce-motion' : ''}`}>
      {screen === 'menu' && <Menu />}
      {screen === 'newgame' && <NewGame />}
      {screen === 'opening' && <Opening />}
      {screen === 'world' && <World />}

      {screen === 'world' && overlay === 'map' && <MapOverlay />}
      {screen === 'world' && overlay === 'phone' && <Phone />}
      {screen === 'world' && overlay === 'profile' && <Dossier />}
      {screen === 'world' && overlay === 'training' && <Training />}
      {screen === 'world' && overlay === 'debrief' && <Debrief />}
      {screen === 'world' && overlay === 'dayEnd' && <DayEnd />}
      {overlay === 'settings' && <Settings />}
      {travel && <Travel />}
      {screen === 'world' && ringing && !inDialogue && <IncomingCall />}
      <ChapterCard />
      <Toast />

      <div className={`letterbox ${letterbox ? '' : 'open'}`} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 58 }} />
      <div className="vignette" />
      <div className="grain" />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
