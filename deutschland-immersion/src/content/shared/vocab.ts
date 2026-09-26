import type { CEFR, VocabEntry } from '../../engine/types';
import { norm } from '../../engine/text';

/**
 * Context vocabulary: every word here is clickable in dialogue (a lookup =
 * recognition support, logged). Production credit only when the player uses it.
 * Format: id | display | Polish | level | extra surface forms | domain
 */
const RAW = `
gleis|das Gleis|tor, peron (tor)|B1|gleise,gleisen|reise
bahnsteig|der Bahnsteig|peron|B1|bahnsteige|reise
richtung|die Richtung|kierunek|B1|richtungen|reise
abfahren|abfahren|odjeżdżać|B1|fährt,fahrt,abfahrt,abgefahren|reise
umsteigen|umsteigen|przesiadać się|B1|steigst,steige,umgestiegen,übergang|reise
aussteigen|aussteigen|wysiadać|B1|ausgestiegen|reise
einsteigen|einsteigen|wsiadać|B1|eingestiegen|reise
fahrkarte|die Fahrkarte|bilet|B1|fahrkarten,fahrschein,fahrscheine,einzelfahrschein|reise
bauarbeiten|die Bauarbeiten (Pl.)|prace budowlane|B1||reise
durchsage|die Durchsage|komunikat|B1|durchsagen,ansage,ansagen|reise
wiederholen|wiederholen|powtarzać|B1|wiederhole,wiederholt|alltag
ausnahmsweise|ausnahmsweise|wyjątkowo|B2||alltag
beeilen|sich beeilen|pospieszyć się|B1|beeilen|alltag
automat|der Automat|automat|B1|automaten|alltag
gültig|gültig|ważny|B1|gültigen,gültiger|reise
befoerderungsentgelt|das erhöhte Beförderungsentgelt|opłata dodatkowa (za jazdę bez biletu)|C1|beförderungsentgelt|verwaltung
fällig|fällig|wymagalny, do zapłaty|B2||recht
pünktlich|pünktlich|punktualny|B1|pünktlich|alltag
spät|spät dran sein|być spóźnionym|B1|spät|alltag
erwarten|erwarten|oczekiwać|B1|erwartet,erwarte,erwarten|alltag
mieter|der Mieter / die Mieterin|najemca|B1|mieterin,mietpartei|wohnen
vermieterin|die Vermieterin|wynajmująca|B1|vermieter|wohnen
hausordnung|die Hausordnung|regulamin domu|B1||wohnen
trennen|trennen|segregować, rozdzielać|B1|getrennt|wohnen
verpackung|die Verpackung|opakowanie|B1|verpackungen|wohnen
tonne|die Tonne|pojemnik na śmieci|B1|tonnen|wohnen
bioabfall|der Bioabfall|odpady bio|B1||wohnen
ruhezeiten|die Ruhezeiten (Pl.)|cisza nocna, godziny ciszy|B1|ruhezeit|wohnen
ganztägig|den ganzen Tag|cały dzień|B1|ganztägig|alltag
kaution|die Kaution|kaucja|B1||wohnen
monatsmiete|die Monatsmiete|czynsz miesięczny|B1|monatsmieten,miete|wohnen
überweisen|überweisen|przelać|B1|überweisen,überwiesen|alltag
aufpassen|aufpassen|uważać|B1|aufgepasst|alltag
gehören|gehören (in/zu)|należeć, trafiać (gdzieś)|B1|gehört|alltag
schlüssel|der Schlüssel|klucz|B1||wohnen
wohnungsgeberbestaetigung|die Wohnungsgeberbestätigung|zaświadczenie od wynajmującego|B2|wohnungsgeberbestätigung|verwaltung
ausstellen|ausstellen|wystawić (dokument)|B2|ausgestellt|verwaltung
anmeldung|die Anmeldung|zameldowanie|B1|anmelden|verwaltung
anmelden|sich anmelden|zameldować się|B1||verwaltung
wohnsitz|der Wohnsitz|miejsce zamieszkania|B2||verwaltung
selbstverständlich|selbstverständlich|oczywiście|B1||alltag
vorbereiten|vorbereiten|przygotować|B1|vorbereitet,bereite|alltag
informiert|gut informiert|dobrze poinformowany|B1||alltag
bestellen|bestellen|zamawiać|B1|bestellt|gastro
mitnehmen|zum Mitnehmen|na wynos|B1|mitnehmen|gastro
kartenlesegerät|das Kartenlesegerät|terminal płatniczy|B2||gastro
spinnen|spinnen (ugs.)|wariować (o urządzeniu)|B2|spinnt|alltag
bar|bar bezahlen|płacić gotówką|B1|bargeld|gastro
geldautomat|der Geldautomat|bankomat|B1|geldautomaten|alltag
vertrauen|vertrauen|ufać|B1|vertrau,vertraue,vertraut|alltag
kiez|der Kiez (Berlin)|okolica, dzielnica|B2||alltag
krass|krass (ugs.)|mocne, niesamowite|B2||alltag
kanzlei|die Kanzlei|kancelaria|B1||arbeit
mandant|der Mandant / die Mandantin|klient (kancelarii)|B2|mandanten,mandantin|recht
offiziell|offiziell|oficjalnie|B1||arbeit
unterschreiben|unterschreiben|podpisać|B1|unterschreibt,unterschrieben,unterschrift|recht
prüfen|prüfen|sprawdzać, badać|B1|geprüft,prüfe,prüfen|arbeit
übersetzung|die Übersetzung|tłumaczenie|B1|übersetzungen,arbeitsübersetzung|recht
abweichen|abweichen (von)|odbiegać, różnić się|B2|weicht,abweicht,abweichung,abweichungen|recht
fassung|die Fassung|wersja, redakcja (tekstu)|B2|fassungen|recht
offenbar|offenbar|najwyraźniej|B2||alltag
ausweis|der Ausweis|dowód tożsamości|B1|personalausweis|verwaltung
empfang|der Empfang|recepcja|B1||arbeit
apparat|am Apparat|przy telefonie|B1||arbeit
vorstellungsgespräch|das Vorstellungsgespräch|rozmowa kwalifikacyjna|B1||arbeit
verstärkung|die Verstärkung|wsparcie, wzmocnienie|B2||arbeit
duzen|duzen|mówić sobie na „ty”|B1||alltag
besprechungsraum|der Besprechungsraum|sala konferencyjna|B1|besprechung|arbeit
innenverteidiger|der Innenverteidiger|środkowy obrońca|B2||fussball
wechseln|wechseln (zu)|przechodzić (do klubu)|B1|wechselt|fussball
verbindlich|verbindlich|wiążący|B2||recht
vergleichen|vergleichen|porównywać|B1|vergleichen,verglichen|arbeit
insbesondere|insbesondere|w szczególności|B2||arbeit
zusammenfassung|die Zusammenfassung|podsumowanie|B1||arbeit
sportdirektor|der Sportdirektor|dyrektor sportowy|B2||fussball
vertragsstrafe|die Vertragsstrafe|kara umowna|C1||recht
vertragsbeendigung|die Vertragsbeendigung|rozwiązanie umowy|C1||recht
kündigung|die Kündigung|wypowiedzenie|B2|kündigen|recht
außerordentlich|außerordentlich|nadzwyczajny|C1|außerordentlichen|recht
unberührt|unberührt bleiben|pozostawać nienaruszonym|C1||recht
verstoßen|verstoßen gegen|naruszać|C1|verstößt|recht
schuldhaft|schuldhaft|zawiniony|C1||recht
ablösesumme|die Ablösesumme|kwota odstępnego / transferowa|C1||fussball
vorzeitig|vorzeitig|przedterminowy|B2||recht
sofern|sofern|o ile|C1||recht
maßgeblich|maßgeblich|wiążący, decydujący|C1||recht
ausschließlich|ausschließlich|wyłącznie|B2||recht
vergütung|die Vergütung|wynagrodzenie|B2|grundgehalt|recht
entwurf|der Entwurf|projekt, szkic|B2||recht
einschätzen|einschätzen|ocenić|B2|einschätzen|arbeit
kritisch|kritisch|krytyczny|B1||arbeit
übernehmen|übernehmen|przejąć|B1|übernehme,übernimmt|arbeit
gründlich|gründlich|gruntownie|B1||arbeit
zusatzvereinbarung|die Zusatzvereinbarung|aneks, porozumienie dodatkowe|C1|zusatzvereinbarungen|recht
kleinreden|etw. kleinreden|bagatelizować|C1|kleinzureden|alltag
sachlich|sachlich|rzeczowy|B2||arbeit
zeichen|das Zeichen|znak|B1||alltag
geheimwaffe|die Geheimwaffe|tajna broń|B2||alltag
hausaufgaben|seine Hausaufgaben machen|odrobić lekcje (być przygotowanym)|B2||alltag
transferfenster|das Transferfenster|okno transferowe|B2||fussball
hinauswollen|worauf wollen Sie hinaus?|do czego Pan/Pani zmierza?|C1|hinauswollen|alltag
erheblich|erheblich|znaczny, istotny|B2||recht
verschieben|verschieben|przełożyć|B1|verschieben|arbeit
einverstanden|einverstanden|zgoda|B1||alltag
festhalten|festhalten|zapisać, utrwalić (w dokumencie)|B2|festhalten|recht
dazwischenschieben|jdn. dazwischenschieben|wcisnąć kogoś (w terminarz)|C1||verwaltung
nachreichen|nachreichen|dosłać, dostarczyć później|C1||verwaltung
durchführen|durchführen|przeprowadzić|B2|durchgeführt|verwaltung
religionsgemeinschaft|die Religionsgemeinschaft|wspólnota religijna|B2||verwaltung
kirchensteuer|die Kirchensteuer|podatek kościelny|B2||verwaltung
lohnsteuer|die Lohnsteuer|podatek od wynagrodzenia|B2||verwaltung
erheben|erheben (Steuer)|pobierać (podatek)|C1|erhebt|verwaltung
übermitteln|übermitteln|przekazywać|B2|übermittelt|verwaltung
meldebescheinigung|die Meldebescheinigung|zaświadczenie o zameldowaniu|B2||verwaltung
zuschicken|zuschicken|przesłać|B1|zugeschickt|verwaltung
identifikationsnummer|die steuerliche Identifikationsnummer|numer identyfikacji podatkowej|B2|steuer-id|verwaltung
melderegister|das Melderegister|rejestr meldunkowy|C1||verwaltung
schriftsatz|der Schriftsatz|pismo procesowe|C1|schriftsätze|recht
nachrichten|die Nachrichten|wiadomości|B1||alltag
journalist|der Journalist|dziennikarz|B1||alltag
dabei|dabei sein|wchodzić w coś, być w grze|B1||alltag
stark|stark (ugs.)|super, mocne|B1||alltag
preußisch|preußisch|pruski (tu: pedantyczny)|C1||alltag
verpflichten|sich verpflichten|zobowiązać się|B2|verpflichtet|recht
tätig|tätig werden|działać, świadczyć usługi|C1||recht
anfangen|anfangen|zaczynać|B1|fange,fängt,angefangen|arbeit
mitbringen|mitbringen|przynieść ze sobą|B1|bringen,bringe,mitgebracht|alltag
unterzeichnung|die Unterzeichnung|podpisanie|B2|unterzeichnen,unterzeichnet|recht
aufnehmend|der aufnehmende Verein|klub przyjmujący|C1|aufnehmender|fussball
`;

export const VOCAB: VocabEntry[] = RAW.trim()
  .split('\n')
  .map((line) => {
    const [id, de, pl, level, forms, domain] = line.split('|');
    return { id, de, pl, level: level as CEFR, forms: forms ? forms.split(',') : [], domain: domain as VocabEntry['domain'] };
  });

/** normalised surface form → vocab id */
export const FORM_INDEX: Map<string, string> = (() => {
  const m = new Map<string, string>();
  for (const v of VOCAB) {
    m.set(norm(v.id), v.id);
    const bare = v.de.replace(/^(der|die|das|sich)\s+/i, '').split(/[\s(/]/)[0];
    m.set(norm(bare), v.id);
    for (const f of v.forms ?? []) m.set(norm(f), v.id);
  }
  return m;
})();

export const VOCAB_BY_ID: Record<string, VocabEntry> = Object.fromEntries(VOCAB.map((v) => [v.id, v]));

export function lookupWord(token: string): VocabEntry | null {
  const id = FORM_INDEX.get(norm(token.replace(/[^\p{L}-]/gu, '')));
  return id ? VOCAB_BY_ID[id] : null;
}
