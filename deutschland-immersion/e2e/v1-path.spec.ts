import { test, expect, type Page } from '@playwright/test';

/**
 * V1 DEFINITION OF DONE — plays the complete Berlin Day 1 (+ Day 2 opener) path:
 * menu → new game → cinematic opening → world → NPCs → German answers → missions →
 * feedback → XP → profile → unlocks → reload → continue with saved progress.
 */

const ANSWERS: Record<string, string> = {
  'hbf_pohl.p2': 'Guten Morgen! Könnten Sie mir sagen, von welchem Gleis die S5 Richtung Strausberg fährt?',
  'key_main.k2': 'Guten Morgen, Frau Wiesner! Ich bin Grzegorz Nowak und komme aus Polen. Ich fange nächste Woche in einer Kanzlei in Mitte an. Freut mich sehr, Sie kennenzulernen.',
  'cafe_order.c2': 'Ich hätte gern einen großen Cappuccino mit Hafermilch und ein Franzbrötchen, bitte.',
  'cafe_order.c7': 'Stimmt, ich bin heute Morgen aus Warschau angekommen. Ab Montag arbeite ich in einer Kanzlei in Mitte.',
  'call_kessler.ca4': 'Selbstverständlich. Dann bin ich um 14:30 Uhr in der Friedrichstraße 148, vierter Stock – und bringe meinen Ausweis mit.',
  'k_desk.d3': 'Ja, einiges: In der polnischen Fassung ist die Vertragsstrafe zehnmal kleiner – 25.000 statt 250.000 Euro. Und bei der Ausstiegsklausel steht 2026 statt 2027.',
  'k_desk.t2': 'Sehr geehrte Frau Dr. Kessler, mein Mandant hat die polnische Fassung des Vertrags bereits akzeptiert. Wir gehen davon aus, dass die Vertragsstrafe – wie vereinbart – 25.000 Euro beträgt. Mit freundlichen Grüßen, Paweł Mazur',
  'k_desk.t5': 'Prawo do rozwiązania umowy bez zachowania okresu wypowiedzenia z ważnej przyczyny pozostaje nienaruszone.',
  'k_desk.m2':
    'Sehr geehrte Frau Dr. Kessler,\n\nbeim Abgleich habe ich drei Abweichungen festgestellt:\n1. § 7: DE 250.000,00 EUR, PL 25.000,00 EUR.\n2. § 9 Abs. 1: „außerordentliche Kündigung“ wurde mit „odstąpienie“ (= Rücktritt) übersetzt.\n3. § 9 Abs. 2: DE 30.06.2027, PL 30.06.2026.\n\nDa die deutsche Fassung maßgeblich ist, empfehle ich, die polnische Fassung vor der Unterzeichnung zu berichtigen.\n\nMit freundlichen Grüßen\nGrzegorz Nowak',
  'dinner_main.dn4': 'Danke, sehr gut – wenn auch etwas chaotisch: Heute Morgen bin ich gleich in die falsche S-Bahn eingestiegen, aber inzwischen habe ich eine Wohnung gefunden.',
  'dinner_main.dn8':
    'Das ist richtig, Herr Fink. Allerdings hat Herr Wrona auf Grundlage der polnischen Fassung zugestimmt – dort beträgt die Vertragsstrafe 25.000 statt 250.000 Euro. Im Interesse beider Seiten würden wir vorschlagen, die Punkte heute Abend in einer Zusatzvereinbarung klarzustellen.',
  'dinner_main.dn14': 'Kara umowna wynosi 250 000 euro, a nie 25 000. Zapiszemy to w aneksie, który podpisze Pan razem z umową.',
  'call_lukas.nl3': 'Klar, ich bin dabei. Bis morgen um elf!',
  'amt_main.a2': 'Guten Morgen. Ich möchte meinen Wohnsitz anmelden. Ich bin vor zwei Tagen in die Graefestraße 12 eingezogen.',
};

// choice index per node (default 0 = the natural option in authored order)
const CHOICE: Record<string, number> = { 'hbf_board.b3': 1, 'hbf_platforms.pl2': 1, 'hbf_platforms.pl2b': 1 };

type G = {
  location: string;
  flags: Record<string, boolean>;
  missions: Record<string, { status: string }>;
  day: number;
  xp: number;
  pendingCall: unknown;
  ui: { overlay: string | null; dialogue: unknown; ringing: boolean; travel: unknown };
};
const state = (p: Page) => p.evaluate(() => (window as unknown as { __game: { getState: () => G } }).__game.getState()) as Promise<G>;
const tap = (p: Page, sel: string) => p.click(sel, { timeout: 2500, force: true }).catch(() => {});
const visible = (p: Page, sel: string) => p.locator(sel).first().isVisible().catch(() => false);

async function travel(p: Page, loc: string) {
  await p.click('[data-testid=open-map]');
  await p.click(`[data-testid=pin-${loc}]`, { force: true });
  await p.click('[data-testid=travel]');
  await p.waitForTimeout(400);
  await p.click('[data-testid=travel-screen]').catch(() => {});
}

/** One step of the autopilot: resolve whatever the game is currently showing. */
async function resolveUI(p: Page, log: string[]): Promise<boolean> {
  if (await visible(p, '[data-testid=chapter]')) return tap(p, '[data-testid=chapter]').then(() => true);
  if (await visible(p, '[data-testid=day2-card]')) return tap(p, '[data-testid=day2-card]').then(() => true);
  if (await visible(p, '[data-testid=day-continue]')) return tap(p, '[data-testid=day-continue]').then(() => true);
  if (await visible(p, '[data-testid=debrief-continue]')) {
    log.push('debrief');
    return tap(p, '[data-testid=debrief-continue]').then(() => true);
  }
  if (await visible(p, '[data-testid=accept]')) return tap(p, '[data-testid=accept]').then(() => true);
  if (await visible(p, '[data-testid=travel-screen]')) return tap(p, '[data-testid=travel-screen]').then(() => true);
  if (await visible(p, '[data-testid=training]')) return tap(p, '[data-testid=close]').then(() => true);
  if (await visible(p, '[data-testid=inspect]')) {
    if (await visible(p, '[data-testid=inspect-submit]')) {
      for (const id of ['pl7', 'pl9_1', 'pl9_2']) await tap(p, `[data-line=${id}]`);
      await tap(p, '[data-testid=inspect-submit]');
      log.push('inspect');
    }
    await tap(p, '[data-testid=inspect] [data-testid=continue]');
    return true;
  }
  const dlg = p.locator('[data-testid=dialogue]');
  if (await dlg.isVisible().catch(() => false)) {
    const node = (await dlg.getAttribute('data-node', { timeout: 1000 }).catch(() => null)) ?? '';
    if (!node) return false;
    if (await visible(p, '[data-testid=evaluation]')) {
      const tier = await p.locator('[data-testid=evaluation]').getAttribute('data-tier', { timeout: 1000 }).catch(() => '?');
      log.push(`${node}:${tier}`);
      await tap(p, '[data-testid=evaluation] [data-testid=continue]');
      return true;
    }
    if (await visible(p, '[data-testid=free-input]')) {
      const a = ANSWERS[node] ?? 'Ja, genau. Das mache ich gern.';
      await p.fill('[data-testid=answer]', a, { timeout: 2000 }).catch(() => {});
      await tap(p, '[data-testid=submit]');
      return true;
    }
    if (await visible(p, '[data-testid=choice-0]')) {
      await tap(p, `[data-testid=choice-${CHOICE[node] ?? 0}]`);
      return true;
    }
    if (await visible(p, '[data-testid=dialogue] [data-testid=continue]')) {
      await tap(p, '[data-testid=dialogue] [data-testid=continue]');
      return true;
    }
  }
  return false;
}

async function settle(p: Page, log: string[], until: (s: G) => boolean, what: string, budget = 400) {
  for (let i = 0; i < budget; i++) {
    const s = await state(p);
    if (until(s) && !s.ui.dialogue && !s.ui.overlay && !s.ui.travel && !s.ui.ringing && !s.pendingCall) {
      console.log(`✓ ${what} (${i} steps)`);
      return s;
    }
    const acted = await resolveUI(p, log);
    if (!acted) await p.waitForTimeout(250);
  }
  throw new Error(`Timeout waiting for: ${what}\n${log.slice(-15).join('\n')}`);
}

test.setTimeout(600_000);

test('Berlin Day 1 → Day 2: complete playable path with persistence', async ({ page: p }) => {
  const errors: string[] = [];
  p.on('pageerror', (e) => errors.push(e.message));
  const log: string[] = [];

  await p.goto('/');
  await expect(p.getByTestId('menu')).toBeVisible();
  await p.click('[data-testid=new-game]');
  await p.fill('[data-testid=first]', 'Grzegorz');
  await p.fill('[data-testid=last]', 'Nowak');
  await p.click('[data-testid=start]');
  await expect(p.getByTestId('opening')).toBeVisible();
  await expect(p.getByText('BERLIN', { exact: true })).toBeVisible({ timeout: 6000 });
  await p.click('[data-testid=skip]');

  // MISSION 1 — DAS FALSCHE GLEIS
  await settle(p, log, (s) => !!s.flags.intro_done, 'intro');
  await p.click('[data-testid=hotspot-board]');
  await settle(p, log, (s) => !!s.flags.heard_announcement, 'board');
  await p.click('[data-testid=hotspot-info]');
  await settle(p, log, (s) => !!s.flags.knows_16, 'Pohl');
  await p.click('[data-testid=hotspot-platforms]');
  await settle(p, log, (s) => s.missions.m_platform?.status === 'completed' && s.location === 'kreuzberg' && !!s.flags.kb_arrived, 'platform done');
  expect((await state(p)).flags.right_train).toBe(true);

  // MISSION 2 — DER SCHLÜSSEL
  await p.click('[data-testid=hotspot-house]');
  await settle(p, log, (s) => s.missions.m_key?.status === 'completed', 'key');
  expect((await state(p)).flags.no_wgb).toBeFalsy();

  // MISSION 3 + 4 — ERSTER KAFFEE, DER ANRUF
  await p.click('[data-testid=hotspot-cafe]');
  await settle(p, log, (s) => s.missions.m_call?.status === 'completed', 'cafe + call');

  // phone: messages, mail, missions
  await p.click('[data-testid=open-phone]');
  await p.click('[data-testid=app-mail]');
  await p.click('[data-testid=mail-mail_wrona_intro]');
  await expect(p.getByTestId('mail-open')).toContainText('Vertrag Wrona');
  await p.click('[data-testid=phone-back]');
  await p.click('[data-testid=app-missions]');
  await expect(p.getByTestId('missions')).toContainText('DER VERTRAG');
  await p.keyboard.press('Escape');

  // MISSION 5 — DER VERTRAG (boss)
  await travel(p, 'kanzlei');
  await settle(p, log, (s) => s.location === 'kanzlei' && !!s.flags.k_arrived, 'reception');
  await p.click('[data-testid=hotspot-meeting]');
  await settle(p, log, (s) => !!s.flags.briefed, 'briefing');
  await p.click('[data-testid=hotspot-desk]');
  await settle(p, log, (s) => !!s.flags.email_sent, 'desk work');
  await p.click('[data-testid=hotspot-meeting]');
  await settle(p, log, (s) => s.missions.m_contract?.status === 'completed', 'contract');
  const mid = await state(p);
  expect(mid.flags.found_pl7 && mid.flags.found_pl9_1 && mid.flags.found_pl9_2).toBe(true);

  // profile changed
  await p.click('[data-testid=open-profile]');
  await expect(p.getByTestId('dossier')).toBeVisible();
  await expect(p.getByTestId('skill-writing')).toBeVisible();
  await p.click('[data-testid=close]');

  // MISSION 6 — ABENDESSEN UM 20:00 (boss)
  await travel(p, 'restaurant');
  await settle(p, log, (s) => s.missions.m_dinner?.status === 'completed' && !!s.flags.night_call_done, 'dinner + night call');
  expect((await state(p)).location).toBe('spree');
  expect((await state(p)).flags.dinner_amendment).toBe(true);
  await p.click('[data-testid=hotspot-home]');
  await settle(p, log, (s) => s.location === 'wohnung', 'home');
  await p.click('[data-testid=hotspot-bed]');
  await settle(p, log, (s) => s.day === 2, 'sleep → day 2');

  // TAG 2 — DAS AMT (consequence of asking for the Wohnungsgeberbestätigung)
  await travel(p, 'amt');
  await p.click('[data-testid=hotspot-counter]');
  await settle(p, log, (s) => s.missions.m_amt?.status === 'completed', 'amt');

  const final = await state(p);
  expect(final.xp).toBeGreaterThan(500);
  expect(['m_platform', 'm_key', 'm_cafe', 'm_call', 'm_contract', 'm_dinner', 'm_amt'].every((m) => final.missions[m]?.status === 'completed')).toBe(true);

  // model answers should be graded at least "correct" everywhere
  const bad = log.filter((l) => /:(incorrect|understandable)$/.test(l));
  expect(bad, log.join('\n')).toEqual([]);
  expect(log.filter((l) => l === 'debrief').length).toBeGreaterThanOrEqual(7);

  // CLOSE → REOPEN → CONTINUE
  await p.reload();
  await expect(p.getByTestId('continue-game')).toBeVisible();
  await expect(p.getByTestId('continue-game')).toContainText('Tag 2');
  await p.click('[data-testid=continue-game]');
  const after = await state(p);
  expect(after.day).toBe(2);
  expect(after.xp).toBe(final.xp);
  expect(after.missions.m_contract.status).toBe('completed');
  await expect(p.getByTestId('clock')).toBeVisible();

  expect(errors).toEqual([]);
  console.log(log.join('\n'));
});
