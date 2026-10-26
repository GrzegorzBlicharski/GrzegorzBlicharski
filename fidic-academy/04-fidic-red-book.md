# 04 — FIDIC: architektura i Red Book 2017 klauzula po klauzuli

**Poziom:** L1 → L2 · **Czas:** ~5 tygodni (najważniejszy moduł programu)

## Cel i efekty uczenia
- znasz strukturę każdego kontraktu FIDIC i wiesz, gdzie czego szukać;
- dla każdej z 21 klauzul Red Book 2017 umiesz powiedzieć: co reguluje, kto ma jakie prawa, jakie są terminy i skutki ich niedotrzymania;
- znasz kluczowe różnice 1999 vs 2017 (w Polsce nadal dominuje 1999);
- przeprowadzasz zdarzenie przez całą ścieżkę: Notice → Claim → 3.7 → NOD → DAAB → arbitraż.

> Czytaj z otwartym tekstem kontraktu. Numery i terminy poniżej dotyczą **Red Book 2017 (reprint 2022)**, chyba że zaznaczono inaczej. Zawsze sprawdzaj Particular Conditions – zamawiający często zmieniają terminy.

---

## Lekcja 4.1 — Architektura dokumentów FIDIC

| Część | Zawartość |
|---|---|
| **Contract Agreement** | Umowa właściwa, lista dokumentów |
| **Letter of Acceptance** | Przyjęcie oferty, Accepted Contract Amount |
| **Letter of Tender** | Oferta wykonawcy |
| **Particular Conditions Part A – Contract Data** | Dane: strony, Engineer, Time for Completion, Delay Damages, limity, waluty, ubezpieczenia, DAAB, prawo właściwe |
| **Particular Conditions Part B – Special Provisions** | Zmiany do warunków ogólnych |
| **General Conditions** | Standardowy tekst FIDIC (nie modyfikuje się go bezpośrednio) |
| **Specification, Drawings** (Red) / **Employer's Requirements** (Yellow/Silver) | Zakres techniczny |
| **Schedules** | BoQ, Daywork, dane wymagane od wykonawcy |
| **Proposal / Tender** | (Yellow/Silver) propozycja techniczna wykonawcy |
| **JV Undertaking**, inne | |

**Hierarchia (Cl. 1.5):** Contract Agreement → Letter of Acceptance → Letter of Tender → Particular Conditions A → Particular Conditions B → General Conditions → Specification → Drawings → Schedules → JV undertaking → pozostałe. Rozbieżność: Engineer wydaje instrukcję wyjaśniającą.

**FIDIC Golden Principles (5 zasad, których PC nie powinny naruszać):**
1. Obowiązki, prawa, role i odpowiedzialności stron i Engineera muszą wynikać z GC i być zgodne z wymaganiami projektu.
2. PC muszą być sformułowane jasno i jednoznacznie.
3. PC nie mogą zmieniać zrównoważonego charakteru alokacji ryzyka GC.
4. Wszystkie terminy na wykonanie obowiązków muszą być rozsądne.
5. Spory muszą trafiać do DAAB (o ile nie ustalono inaczej), zanim pójdą do arbitrażu.

## Lekcja 4.2 — Kluczowe definicje (Cl. 1.1)
Zapamiętaj precyzyjnie – w sporach liczy się każde słowo:
- **Base Date** – 28 dni przed terminem składania ofert. Punkt odniesienia dla zmian prawa, warunków gruntowych („unforeseeable”), cen.
- **Commencement Date** – data z Notice Engineera (Cl. 8.1), od niej biegnie Time for Completion.
- **Time for Completion** – czas na ukończenie (z Contract Data) + EoT.
- **Cost** – koszty faktycznie poniesione, **bez zysku**. **Cost Plus Profit** – Cost + procent zysku (domyślnie 5%, jeśli Contract Data nie określa).
- **Unforeseeable** – niemożliwe do przewidzenia przez doświadczonego wykonawcę na Base Date.
- **Notice** – pisemne zawiadomienie oznaczone jako Notice (Cl. 1.3).
- **Claim** – żądanie uprawnienia lub zwolnienia jednej strony wobec drugiej na podstawie kontraktu (szersze niż tylko pieniądze i czas).
- **Dispute** – jedna strona zgłasza roszczenie, druga je odrzuca (lub Engineer/strona nie odpowiada), i strona daje NOD lub kieruje sprawę dalej – definicja z elementami proceduralnymi.
- **Exceptional Event** – dawniej Force Majeure (Cl. 18).
- **Key Personnel**, **Contractor's Documents**, **Plant**, **Materials**, **Temporary Works**, **Permanent Works**.

## Lekcja 4.3 — Cl. 1–3: postanowienia ogólne, Employer, Engineer

| Sub-Clause | Treść | Kluczowe dla praktyki |
|---|---|---|
| 1.3 Notices and Other Communications | Na piśmie, właściwy adres, oznaczone jako „Notice” | Pismo nie oznaczone jako Notice może nie być skutecznym notice! |
| 1.5 Priority of Documents | Hierarchia | Patrz wyżej |
| 1.9 Delayed Drawings or Instructions (Red) | Wykonawca zawiadamia o potrzebie rysunku/instrukcji; opóźnienie → Cl. 20.2 | Klasyczne źródło roszczeń w DBB |
| 1.13 Compliance with Laws | Kto uzyskuje jakie pozwolenia | Employer – pozwolenie na budowę; Contractor – pozostałe wg specyfikacji |
| 1.14 Joint and Several Liability | Konsorcjum (JV) odpowiada solidarnie | |
| 1.15 Limitation of Liability | Wyłączenie utraconych korzyści i szkód pośrednich + limit łączny (Contract Data lub Accepted Contract Amount) | Wyjątki: fraud, gross negligence, deliberate default, reckless misconduct; Cl. 8.8 Delay Damages, 13.3.1 itp. – sprawdź listę w tekście |
| 2.1 Right of Access to the Site | Employer daje dostęp w terminie | Brak dostępu → EoT + Cost Plus Profit |
| 2.4 Employer's Financial Arrangements | Employer pokazuje, że ma środki | Brak → prawo do zawieszenia (16.1) |
| 2.5 Site Data and Items of Reference | Employer udostępnia dane o placu | Powiązane z 4.10 i 4.12 |
| 3.1–3.2 Engineer, Duties and Authority | Engineer działa w imieniu Employera, chyba że kontrakt stanowi inaczej | Ograniczenia uprawnień Engineera w PC (np. zgoda Employera na zmiany) |
| 3.5 Engineer's Instructions | Instrukcje na piśmie; jeśli wykonawca uważa, że instrukcja to Variation – Notice przed wykonaniem | Nowość 2017: procedura dla „instrukcji ukrytych zmian” |
| **3.7 Agreement or Determination** | Patrz niżej | Najważniejszy mechanizm w trakcie realizacji |
| 3.8 Meetings | Spotkania zarządcze | Minutes = contemporary records |

### Cl. 3.7 Agreement or Determination (FIDIC 2017) — mechanizm krok po kroku
```
Claim / sprawa → Engineer konsultuje strony, by osiągnąć porozumienie (3.7.1)
   │ Time limit for agreement: 42 dni (od otrzymania fully detailed Claim, Cl. 3.7.3)
   ├── porozumienie → Notice of Agreement → wiążące
   └── brak → Engineer wydaje determinację (3.7.2) – neutralnie, uzasadnioną
                 w ciągu 42 dni od upływu terminu na porozumienie
                 │ brak determinacji w terminie = uznanie claimu za odrzucony (Cl. 3.7.3)
                 ▼
          Strona niezadowolona → Notice of Dissatisfaction (NOD) w ciągu 28 dni (3.7.5)
                 │ brak NOD → determinacja final and binding
                 ▼
          Determinacja wiąże tymczasowo; spór → DAAB (Cl. 21.4) w ciągu 42 dni od NOD
```
**Neutralność:** Engineer przy 3.7 „shall act neutrally between the Parties and shall not be deemed to act for the Employer” – kluczowa zmiana w 2017.

## Lekcja 4.4 — Cl. 4: Contractor

| Sub-Clause | Treść | Uwagi |
|---|---|---|
| 4.1 General Obligations | Wykonać zgodnie z kontraktem; w Red – projekt tylko w zakresie wskazanym (wtedy fitness for purpose dla tej części) | |
| 4.2 Performance Security | Gwarancja należytego wykonania (Contract Data, zwykle 10%) w 28 dni | Wezwanie przez Employera tylko w przypadkach wymienionych w 4.2.2 |
| 4.3 Contractor's Representative | Osoba reprezentująca | |
| 4.4 Contractor's Documents | Dokumenty wykonawcy, as-built, instrukcje O&M | |
| 4.7 Setting Out | Wytyczenie; błędy w punktach odniesienia Employera → claim | |
| 4.9 Quality Management and Compliance Verification Systems | System jakości | |
| 4.10 Use of Site Data | Wykonawca odpowiada za interpretację danych | |
| 4.11 Sufficiency of the Accepted Contract Amount | Wykonawca uznaje cenę za wystarczającą | Podstawa obrony przed roszczeniami „za tanio wyceniłem” |
| **4.12 Unforeseeable Physical Conditions** | Warunki fizyczne (grunt, woda, przeszkody), nieprzewidywalne na Base Date → Notice „as soon as practicable” → EoT + Cost (bez zysku) | Test: co przewidziałby doświadczony wykonawca. Engineer może uwzględnić warunki korzystniejsze niż przewidywane (obniżenie). |
| 4.20 Progress Reports | Raporty miesięczne – treść szczegółowo opisana | |
| 4.21 Security of the Site, 4.22 Contractor's Operations on Site | | |

## Lekcja 4.5 — Cl. 5–7: podwykonawcy, personel, jakość
- **Cl. 5 Subcontracting (Red):** wykonawca odpowiada za podwykonawców; limit podwykonawstwa w Contract Data; **nominated subcontractors** (5.2) – wybrani przez Employera; wykonawca może zgłosić zastrzeżenia (objection) z uzasadnionych przyczyn.
- **Cl. 6 Staff and Labour:** warunki pracy, BHP, godziny pracy, Key Personnel (6.12).
- **Cl. 7 Plant, Materials and Workmanship:** inspekcje (7.3), testy (7.4), **Defects and Rejection (7.5)**, **Remedial Work (7.6)** – Engineer może nakazać usunięcie/ponowne wykonanie; własność materiałów (7.7); royalties (7.8).

## Lekcja 4.6 — Cl. 8: czas
| Sub-Clause | Treść | Terminy |
|---|---|---|
| 8.1 Commencement of Works | Engineer daje Notice z Commencement Date | Min. 14 dni wcześniej; w ciągu 42 dni od Letter of Acceptance (domyślnie) |
| 8.2 Time for Completion | Ukończyć całość i Sections w czasie | |
| 8.3 Programme | Patrz moduł 03 | 28 dni / 21 dni |
| 8.4 Advance Warning | Każda strona ostrzega o zdarzeniach mogących wpłynąć negatywnie (nowość 2017) | Brak ostrzeżenia może wpłynąć na ocenę roszczenia (np. mitigation) |
| **8.5 Extension of Time for Completion** | Podstawy EoT: Variation; przyczyna uprawniająca do EoT pod innym Sub-Clause; exceptionally adverse climatic conditions; Unforeseeable shortages (epidemia, działania rządu); opóźnienie lub przeszkoda ze strony Employera/jego personelu/innych wykonawców | **Concurrent delay** – wg PC (2017 odsyła do zasad w Special Provisions) |
| 8.6 Delays Caused by Authorities | Opóźnienia organów publicznych, których doświadczony wykonawca nie mógł przewidzieć | EoT, bez kosztów |
| 8.7 Rate of Progress | Postęp za wolny → Engineer żąda revised programme; przyspieszenie na koszt wykonawcy | |
| **8.8 Delay Damages** | Kary za opóźnienie wg stawki dziennej z Contract Data, do limitu | Jedyne odszkodowanie za opóźnienie (poza termination przed ukończeniem i fraud/gross negligence itd.) |
| 8.9–8.13 Suspension | Zawieszenie przez Engineera; koszty dla wykonawcy (8.10), płatność za Plant (8.11), przedłużone zawieszenie > 84 dni → prawo do omission/termination (8.12) | |

**Acceleration:** FIDIC 2017 przewiduje przyspieszenie jako Variation (13.3.1), jeśli Employer go żąda. „Constructive acceleration” (wykonawca przyspiesza, bo Engineer odmawia uzasadnionego EoT) – trudniejsze do udowodnienia; ważny temat w module 07.

## Lekcja 4.7 — Cl. 9–11: testy, odbiór, wady
- **Cl. 9 Tests on Completion:** wykonawca zawiadamia o gotowości (21 dni wcześniej); opóźnianie testów przez Employera (9.2); powtórne testy (9.3); niezaliczenie → Employer może odrzucić, nakazać powtórzenie albo przejąć z obniżoną ceną (9.4).
- **Cl. 10 Employer's Taking Over:**
  - 10.1 – wniosek o Taking-Over Certificate (TOC) nie wcześniej niż 14 dni przed spodziewanym ukończeniem; Engineer w 28 dni wydaje TOC lub odrzuca z uzasadnieniem; brak reakcji = deemed TOC.
  - Drobne prace pozostałe i wady nie blokują TOC, jeśli nie wpływają istotnie na użytkowanie.
  - 10.2 – przejęcie części; 10.3 – przeszkody w testach.
  - **Skutki TOC:** ryzyko i opieka przechodzą na Employera; kończą się Delay Damages; zwolnienie połowy retention; start DNP.
- **Cl. 11 Defects after Taking Over:** Defects Notification Period (zwykle 365 dni); obowiązek usuwania wad; przedłużenie DNP (11.3) do maks. 2 lat; **Performance Certificate (11.9)** – w 28 dni po ostatnim DNP; dopiero on oznacza „acceptance of the Works”. Po PC strony odpowiadają tylko za niewykonane zobowiązania (11.10). Odpowiedzialność ustawowa (rękojmia/latent defects) – wg prawa właściwego.

## Lekcja 4.8 — Cl. 12–14: obmiar, zmiany, płatności

**Cl. 12 Measurement and Valuation (Red):**
- 12.1 – obmiar wspólny (Engineer + wykonawca); 12.2 – metoda obmiaru; **12.3 Valuation of the Works** – stawki z BoQ; nowa stawka gdy: (a) brak pozycji, (b) zmiana ilości o > 10% przy spełnieniu dodatkowych progów, (c) pozycja nieadekwatna ze względu na charakter pracy; budowa nowej stawki: „reasonable Cost of executing the work + profit”, z uwzględnieniem stawek podobnych.
- 12.4 – omissions (pominięcie zakresu – zwrot kosztów nieodzyskanych).

**Cl. 13 Variations and Adjustments:**
- 13.1 Right to Vary – Engineer może zlecić zmianę do TOC; wykonawca może odmówić tylko w wąskich przypadkach (nieosiągalne zasoby, wpływ na bezpieczeństwo, na osiągnięcie gwarancji).
- 13.2 Value Engineering – propozycja wykonawcy; korzyść dzielona (Yellow/Silver).
- **13.3 Variation Procedure:** 13.3.1 Variation by Instruction (wykonawca przedstawia szczegóły w 28 dni: opis, zmiana harmonogramu, wycena – i dostaje 3.7); 13.3.2 Variation by Request for Proposal.
- 13.4 Provisional Sums; 13.5 Daywork.
- **13.6 Adjustments for Changes in Laws** – zmiana prawa po Base Date → EoT i/lub Cost.
- **13.7 Adjustments for Changes in Cost** – formuła waloryzacyjna (Schedule of cost indexation); jeśli Contract Data nie zawiera tabeli → brak waloryzacji.

**Cl. 14 Contract Price and Payment:**
| Sub-Clause | Treść | Termin |
|---|---|---|
| 14.2 Advance Payment | Zaliczka przeciw gwarancji zaliczkowej, spłacana z IPC | |
| 14.3 Application for IPC | Statement miesięczny (jeśli nie ustalono inaczej) | Po zakończeniu okresu |
| 14.4 Schedule of Payments | Harmonogram płatności (zamiast obmiaru) | |
| 14.5 Plant and Materials intended for the Works | Płatność za materiały przed wbudowaniem | |
| 14.6 Issue of IPC | Engineer wydaje IPC w 28 dni od Statement; może potrącić kwoty nienależne; nie może wstrzymać z powodu drobnych niezgodności | |
| 14.7 Payment | Employer płaci w 56 dni od otrzymania przez Engineera Statement (IPC); zaliczka 21 dni; Final Payment 56 dni od FPC | |
| 14.8 Delayed Payment | Financing charges: stopa wg Contract Data lub stopa banku centralnego + 3% | Bez notice! |
| 14.9 Release of Retention Money | ½ przy TOC, ½ po ostatnim DNP | |
| 14.10 Statement at Completion | 84 dni po TOC | |
| 14.11 Final Statement | Projekt 56 dni po Performance Certificate | |
| 14.12 Discharge | Oświadczenie o zrzeczeniu się (z wyjątkami) | |
| 14.13 Final Payment Certificate | 28 dni | |
| 14.14 Cessation of Employer's Liability | Po FPC Employer nie odpowiada, chyba że roszczenie było w Final Statement | |

## Lekcja 4.9 — Cl. 15–19: termination, ryzyko, ubezpieczenia

**Cl. 15 Termination by Employer:**
- 15.1 Notice to Correct – wezwanie do naprawienia uchybienia w rozsądnym terminie.
- 15.2 Termination for Contractor's Default: 15.2.1 Notice of intention (14 dni) w przypadkach jak: niezastosowanie się do Notice to Correct, porzucenie robót, brak uzasadnionej przyczyny do kontynuacji, maksymalne Delay Damages przekroczone, podwykonawstwo całości, korupcja – a w niektórych przypadkach (upadłość, korupcja) natychmiast.
- 15.3–15.4 Wycena na dzień termination, płatność (Employer może dochodzić dodatkowych kosztów ukończenia).
- **15.5 Termination for Employer's Convenience** – Notice; nie można w celu wykonania robót samodzielnie lub przez innego wykonawcę; wykonawca dostaje zapłatę + utracone korzyści (wg 15.6).

**Cl. 16 Suspension and Termination by Contractor:**
- 16.1 – prawo do zawieszenia (21 dni Notice) przy braku płatności, braku dowodu finansowania (2.4), niewydaniu IPC, nieprzestrzeganiu decyzji DAAB/porozumienia/determinacji.
- 16.2 – termination (14 dni Notice; w niektórych przypadkach natychmiast), m.in.: brak płatności w 42 dni po terminie, przedłużone zawieszenie, istotne naruszenie.
- 16.3–16.4 – demobilizacja, płatność (z utraconymi korzyściami).

**Cl. 17 Care of the Works and Indemnities:** wykonawca odpowiada za opiekę nad robotami od Commencement do TOC; ryzyka wyłączone (17.2): ingerencja Employera, błędy projektu Employera, siły natury, których nie mógł przewidzieć doświadczony wykonawca, itd. – wtedy EoT/Cost. Indemnities (17.4 Contractor, 17.5 Employer, 17.6 Shared Indemnities – proporcjonalnie przy przyczynieniu).

**Cl. 18 Exceptional Events:**
- Definicja: zdarzenie (i) poza kontrolą strony, (ii) którego strona nie mogła rozsądnie przewidzieć przy zawarciu, (iii) którego nie mogła uniknąć lub przezwyciężyć, (iv) nie przypisywalne drugiej stronie. Przykładowa lista: wojna, terroryzm, rozruchy, strajki (nie personelu wykonawcy), materiały radioaktywne, katastrofy naturalne.
- 18.2 – Notice w 14 dni od momentu, gdy strona dowiedziała się lub powinna była się dowiedzieć.
- 18.4 – wykonawca: EoT; Cost tylko dla niektórych zdarzeń (np. wojna, rozruchy w kraju projektu).
- 18.5 – Optional Termination: przeszkoda trwająca 84 dni nieprzerwanie lub łącznie > 140 dni.
- 18.6 – Release from Performance under the Law (frustration).

**Cl. 19 Insurance:** CAR (ubezpieczenie robót) – wykonawca na wspólne nazwiska; sprzęt; OC wobec osób trzecich; pracownicy; inne wymagane prawem. Szczegóły w Contract Data.

## Lekcja 4.10 — Cl. 20: Claims (rdzeń zawodu)

**Trzy kategorie claimów (20.1):**
1. (a) Employer → pieniądze lub przedłużenie DNP;
2. (b) Contractor → pieniądze i/lub EoT;
3. (c) inne uprawnienia (np. interpretacja, zwolnienie z obowiązku) – idą wprost do 3.7, bez procedury 20.2.

**Procedura 20.2 – terminy, które musisz znać na pamięć:**
```
Zdarzenie (strona dowiaduje się lub powinna była się dowiedzieć)
   │ 28 dni → NOTICE OF CLAIM (20.2.1)  ⟵ TIME BAR
   │           brak w terminie = utrata prawa do roszczenia
   │ Engineer: 14 dni na Notice, jeśli uważa Notice za spóźnione (20.2.2)
   │           brak takiej Notice Engineera = Notice of Claim uznane za skuteczne
   │           (druga strona może to zakwestionować w fully detailed Claim / 3.7)
   │ Contemporary records – prowadzone na bieżąco (20.2.3); Engineer może je kontrolować
   │ 84 dni → FULLY DETAILED CLAIM (20.2.4):
   │           (a) opis zdarzenia, (b) podstawa umowna/prawna, (c) contemporary records,
   │           (d) szczegółowe dowody wysokości (kwota i/lub EoT)
   │           brak (b) w terminie → Notice of Claim traci ważność (2017)
   │ Engineer → 3.7 (42 dni na porozumienie + 42 dni na determinację)
   │ Claim o charakterze ciągłym (20.2.6): interim fully detailed Claims co miesiąc,
   │           final – w 28 dni po zakończeniu skutków zdarzenia
   ▼
   NOD 28 dni → DAAB
```
**Uchylenie time bar:** FIDIC 2017 pozwala DAAB/arbitrażowi uznać spóźnione Notice, jeśli opóźnienie jest uzasadnione w okolicznościach (20.2.5 w związku z 3.7) – czynniki: czy druga strona była świadoma zdarzenia, czy poniosła szkodę z powodu opóźnienia, itp. Ale nie licz na to – przestrzegaj terminów.

**1999 dla porównania (Cl. 20.1):** Notice 28 dni (time bar), fully detailed claim 42 dni, Engineer odpowiada w 42 dni. Employer's claims – Cl. 2.5 (bez sztywnego time bar, „as soon as practicable”).

## Lekcja 4.11 — Cl. 21: Disputes and Arbitration
| Krok | Sub-Clause | Termin |
|---|---|---|
| Ustanowienie DAAB (standing – stały, od początku) | 21.1 | W 28 dni od otrzymania Letter of Acceptance przez wykonawcę (lub data z Contract Data) |
| Avoidance of Disputes – nieformalna pomoc DAAB | 21.3 | Na wspólny wniosek |
| Skierowanie sporu do DAAB | 21.4.1 | Jeśli spór dotyczy determinacji: w 42 dni od NOD, inaczej NOD wygasa |
| Decyzja DAAB | 21.4.3 | 84 dni od skierowania (lub inny uzgodniony termin) |
| NOD wobec decyzji DAAB | 21.4.4 | 28 dni od otrzymania decyzji; brak → decyzja final and binding |
| Amicable Settlement | 21.5 | 28 dni prób polubownych przed arbitrażem |
| Arbitraż (ICC, 3 arbitrów) | 21.6 | |
| Failure to Comply with DAAB's Decision | 21.7 | Niezastosowanie się do decyzji można od razu skierować do arbitrażu (bez DAAB i 21.5) |
| No DAAB in Place | 21.8 | Spór idzie wprost do arbitrażu |

**Decyzja DAAB jest wiążąca natychmiast** (binding), nawet jeśli zostanie złożone NOD – strony muszą ją wykonać. Problem egzekucji niewiążących-ostatecznie decyzji: sprawa *Persero* (Singapur) – stąd 21.7 w 2017.

## Lekcja 4.12 — 1999 vs 2017: tabela różnic

| Temat | 1999 | 2017 |
|---|---|---|
| Liczba stron GC | ~70 | ~110 |
| Claims wykonawcy | 20.1 (Notice 28 d, claim 42 d) | 20.2 (Notice 28 d, claim 84 d) |
| Claims Employera | 2.5 – bez time bar | 20.2 – symetrycznie, z time bar |
| Determinacja | 3.5 – „fair determination” | 3.7 – neutralność, terminy, deemed rejection |
| Spory | DAB (20.2–20.8), często ad hoc w Yellow/Silver | DAAB standing we wszystkich wzorach, avoidance of disputes |
| Siła wyższa | Cl. 19 Force Majeure | Cl. 18 Exceptional Events |
| Wczesne ostrzeganie | brak | 8.4 Advance Warning |
| Programme | 8.3 – ogólnie | 8.3 – szczegółowe wymogi (critical path, float) |
| Limitation of liability | 17.6 | 1.15 |
| Termination for convenience | 15.5 | 15.5 + utracone korzyści dla wykonawcy |
| Konsekwencje braku reakcji Engineera | rzadko | wiele „deemed” mechanizmów |
| Quality management | 4.9 | 4.9 rozbudowane (compliance verification) |

**Kontekst PL:** GDDKiA i PKP PLK historycznie stosowały FIDIC 1999 (Red/Yellow) z obszernymi Warunkami Szczególnymi; po 2020 przepisy Pzp (np. art. 433, 436, 439) wymusiły modyfikacje. Zawsze czytaj Warunki Szczególne – często zmieniają time bary, rolę Inżyniera (wymóg zgody Zamawiającego) i DAB.

---

## Praktyka (5 tygodni)
1. **Tydzień 4:** Flowchart Cl. 3.7 + Cl. 20.2 + Cl. 21 na jednej stronie A3 z terminami.
2. **Tydzień 5:** Kalendarz kontraktu: z przykładowego Contract Data wygeneruj w Excelu listę wszystkich terminów (Commencement +28 dni programme itd.).
3. **Tydzień 6:** IPC – przygotuj Statement (roboty wykonane, zmiany, materiały, zaliczka, retention, potrącenia).
4. **Tydzień 7, case study „Grunt”:** Na budowie GPZ 110/30 kV wykonawca natrafia na nieopisany w raporcie geotechnicznym pokład torfu. Napisz: (a) Notice of Claim (20.2.1 + 4.12), (b) szkic fully detailed Claim, (c) odpowiedź Engineera, (d) determinację 3.7.
5. **Clause drills:** 30 krótkich stanów faktycznych (od mentora) – odpowiedź: klauzula, termin, skutek.

## Pytania kontrolne
1. Wykonawca złożył Notice of Claim 30 dni po zdarzeniu. Engineer nie odpowiedział. Co dalej?
2. Engineer nie wydał determinacji w terminie. Jaki jest skutek?
3. Czy Employer może potrącić kary za opóźnienie bez claimu?
4. Kiedy wykonawca może zawiesić roboty?
5. Jakie są skutki wydania Taking-Over Certificate?
6. Czym różni się Cost od Cost Plus Profit i kiedy wykonawca dostaje który?
7. Decyzja DAAB została wydana, Employer złożył NOD i nie płaci. Co może zrobić wykonawca?
8. Co to jest Base Date i do czego służy?

<details><summary>Odpowiedzi</summary>

1. Notice jest spóźnione (> 28 dni). Brak Notice Engineera w 14 dni oznacza, że Notice uważa się za skuteczne (20.2.2), ale Employer może to zakwestionować; ostatecznie rozstrzyga 3.7/DAAB z uwzględnieniem okoliczności usprawiedliwiających.
2. Claim uważa się za odrzucony (deemed rejection, 3.7.3), co otwiera drogę do NOD i DAAB.
3. W 2017 – nie: Employer musi przejść przez 20.2 (Notice, claim, 3.7). Potrącenie bez procedury jest niedopuszczalne (Cl. 2.5 1999 i 20.2 2017 – symetria).
4. Brak płatności w terminie, brak dowodu finansowania, niewydanie IPC, niewykonanie decyzji DAAB/porozumienia/determinacji – po 21-dniowym Notice (16.1).
5. Przejście opieki i ryzyka na Employera, koniec biegu Delay Damages, zwolnienie 1/2 retention, początek DNP.
6. Cost – faktyczne koszty bez zysku (np. 4.12, 8.6 nie daje Cost w ogóle); Cost Plus Profit – gdy przyczyna leży po stronie Employera (np. 1.9, 2.1, 7.4 opóźnione testy, 10.3).
7. Decyzja wiąże mimo NOD; wykonawca może skierować niewykonanie bezpośrednio do arbitrażu (21.7) oraz zawiesić roboty (16.1).
8. 28 dni przed terminem złożenia ofert; punkt odniesienia dla zmian prawa (13.6), cen (13.7) i „nieprzewidywalności” (4.12).
</details>

## Lektury
- FIDIC Red Book 2017 – lektura całości (2 razy: raz szybko, raz z notatkami).
- FIDIC Contracts Guide 2nd ed. – komentarz do Cl. 3, 8, 13, 14, 20, 21.
- Glover/Hughes, *Understanding the FIDIC Red and Yellow Books*.
- Case law (streszczenia): *Obrascon Huarte Lain v Gibraltar* [2014] EWHC 1028 (TCC); *Persero v CRW Joint Operation* [2015] SGCA 30; *Peak Construction v McKinney Foundations* (1970); *Multiplex v Honeywell* [2007] EWHC 447 (TCC).

## Słownictwo
Particular Conditions – Warunki Szczególne – Besondere Vertragsbedingungen · Notice – zawiadomienie / powiadomienie – Anzeige, Mitteilung · determination – określenie / ustalenie – Festlegung · time bar – termin zawity / prekluzyjny – Ausschlussfrist · Delay Damages – kary/odszkodowanie za opóźnienie – Verzugsschadensersatz / Vertragsstrafe · Performance Security – zabezpieczenie należytego wykonania – Vertragserfüllungssicherheit · retention – kwota zatrzymana – Sicherheitseinbehalt · Taking-Over Certificate – Świadectwo Przejęcia – Übernahmebescheinigung / Abnahmeprotokoll · Performance Certificate – Świadectwo Wykonania – Leistungsbescheinigung.
