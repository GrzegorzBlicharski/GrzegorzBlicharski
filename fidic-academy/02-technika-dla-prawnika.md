# 02 — Technika dla prawnika kontraktowego

**Poziom:** L1 · **Czas:** ~2 tygodnie (+1 h tygodniowo przez cały program)

## Cel i efekty uczenia
Nie zostaniesz inżynierem, ale musisz:
- rozumieć, **co** jest budowane i **w jakiej kolejności** (bo kolejność = harmonogram = opóźnienia = roszczenia);
- rozmawiać z kierownikiem budowy i projektantem bez tłumacza;
- rozpoznawać, które zdarzenia techniczne mają skutki kontraktowe;
- czytać raport z postępu i protokół z testów.

---

## Lekcja 2.1 — Budownictwo ogólne: sekwencja robót

```
Badania gruntu → Roboty przygotowawcze (wycinka, niwelacja, drogi tymczasowe, zaplecze)
→ Roboty ziemne (wykopy, nasypy, odwodnienie) → Fundamenty (płytowe, ławy, pale)
→ Konstrukcja (żelbet, stal, prefabrykacja) → Obudowa i dach → Instalacje (MEP)
→ Wykończenie → Zagospodarowanie terenu → Testy i odbiory
```

| Element | Co warto wiedzieć | Typowy problem kontraktowy |
|---|---|---|
| **Grunt** (geotechnika) | Badania: odwierty, CPT, raport geotechniczny; nośność, woda gruntowa | Unforeseeable physical conditions (FIDIC 4.12) – kto ponosi ryzyko gruntu |
| **Fundamenty** | Płyta, stopa, pale (wiercone, wbijane); pod turbinę: fundament grawitacyjny ok. 600–1000 m³ betonu lub palowy | Dodatkowe pale / wymiana gruntu = variation lub claim |
| **Beton** | Klasa (np. C30/37), czas dojrzewania ~28 dni, pielęgnacja, zimowe warunki | Przerwy technologiczne w harmonogramie, testy kostek, odrzucenie elementu |
| **Stal** | Konstrukcje, zbrojenie, spoiny, zabezpieczenie antykorozyjne | Ceny stali → waloryzacja |
| **MEP** | Mechanical, Electrical, Plumbing – instalacje | Kolizje projektowe, koordynacja branż |
| **Drogi i place** | Podbudowa, nośność dla dźwigów (place montażowe pod wiatraki) | Nienośność placów → przestój dźwigu (bardzo kosztowny) |

**Pogoda:** w FIDIC zwykłe warunki pogodowe to ryzyko wykonawcy; EoT tylko za „exceptionally adverse climatic conditions” (Cl. 8.5 – 2017). Trzeba porównać z danymi historycznymi (np. IMGW, DWD).

## Lekcja 2.2 — Energetyka: sieć i stacje

**Poziomy napięć (PL):** nn (niskie, do 1 kV), SN (średnie, 15–30 kV), WN (wysokie, 110 kV), NN (najwyższe, 220/400 kV).
**Operatorzy:** PL – PSE (OSP/TSO), OSD (Tauron, PGE Dystrybucja, Enea, Energa, Stoen). DE – ÜNB/TSO: TenneT, 50Hertz, Amprion, TransnetBW; VNB/DSO.

| Element | Funkcja | Kontraktowo |
|---|---|---|
| **GPZ / stacja transformatorowa (substation)** | Podnosi napięcie z farmy (np. 33 kV) do sieci (110/220/400 kV) | Często osobny pakiet; ścieżka krytyczna przyłączenia |
| **Transformator mocy** | Kluczowe urządzenie, czas dostawy 18–36 mies. (2023–2026) | Long-lead item – zamawiany przed NTP, ryzyko opóźnień dostawcy |
| **Rozdzielnica (switchgear)** AIS / GIS | Łączenie i zabezpieczanie obwodów | FAT u producenta, SAT na budowie |
| **Zabezpieczenia, SCADA, telekomunikacja** | Sterowanie, monitoring, wymiana danych z operatorem | Testy z operatorem sieci = zależność od strony trzeciej |
| **Linie kablowe / napowietrzne** | Przesył | Służebności, kolizje, przewierty HDD |
| **Przyłączenie (grid connection)** | Warunki przyłączenia, umowa przyłączeniowa, testy zgodności z NC RfG | Opóźnienie operatora = „Delays caused by Authorities” (Cl. 8.6) lub ryzyko Ownera |
| **BESS** | Magazyn energii (baterie) | Gwarancje pojemności, degradacja, bezpieczeństwo pożarowe |

**Testy:** FAT (Factory Acceptance Test) → dostawa → montaż → SAT (Site Acceptance Test) → testy przedrozruchowe → energizacja (pierwsze podanie napięcia) → testy zgodności z kodeksem sieci → przejęcie.

## Lekcja 2.3 — Wiatr onshore

**Turbina (WTG – Wind Turbine Generator):** fundament → wieża (stalowa w sekcjach lub hybrydowa) → gondola (nacelle: generator, przekładnia lub direct-drive) → piasta (hub) → łopaty (blades, 60–90 m). Moc dziś typowo 4–7 MW onshore.

**Pakiety kontraktowe farmy onshore:**
1. **TSA (Turbine Supply Agreement)** – dostawa, montaż, uruchomienie turbin (Vestas, Siemens Gamesa, Nordex, GE, Enercon).
2. **SA / SMA (Service and Maintenance Agreement)** – serwis 10–30 lat, gwarancja dostępności (availability guarantee, np. 97%).
3. **BOP (Balance of Plant)** – drogi, place montażowe, fundamenty, kable SN, GPZ; często podzielony na BOP civil i BOP electrical.
4. **Przyłączenie** – umowa z OSD/OSP.

**Sekwencja i zależności (interfejsy!):**
```
BOP: drogi + place → fundamenty (dojrzewanie betonu) → [przekazanie fundamentu dostawcy WTG]
WTG: transport → montaż dźwigiem (wiatr! limit ok. 10–12 m/s) → uruchomienie mechaniczne
BOP electrical: kable SN + GPZ → energizacja → [uruchomienie turbin wymaga sieci]
→ testy, reliability run (np. 240 h) → Taking Over → test krzywej mocy (IEC 61400-12)
```
Każda strzałka między pakietami to potencjalne roszczenie Ownera wobec jednego wykonawcy i roszczenie drugiego wykonawcy wobec Ownera.

**Gwarancje typowe:** power curve guarantee, availability guarantee, noise guarantee; LDs za opóźnienie i za niedotrzymanie parametrów.

## Lekcja 2.4 — Wiatr offshore

| Element | Opis | Ryzyko kontraktowe |
|---|---|---|
| **Badania dna** | Geofizyka, geotechnika, UXO (niewybuchy – na Bałtyku istotne) | Unforeseeable ground conditions, odkrycie UXO → przestój floty |
| **Fundamenty** | Monopile (+ transition piece), jacket, suction bucket; floating (pływające) | Problemy z wbijaniem (pile refusal), hałas (ograniczenia środowiskowe) |
| **Turbiny** | 12–15+ MW | Dostępność statków instalacyjnych |
| **Kable** | Inter-array (66 kV), eksportowe (220 kV HVAC lub HVDC) | Uszkodzenie kabli – największa kategoria szkód ubezpieczeniowych offshore |
| **OSS (Offshore Substation)** | Stacja na morzu | Ciężki montaż (heavy lift) |
| **Onshore substation** | Przyłączenie do sieci lądowej | Interfejs z operatorem sieci |
| **Statki** | Jack-up (WTIV), heavy lift, cable lay vessel | Charter = koszty dzienne rzędu setek tys. EUR; weather downtime |
| **Port** | Port instalacyjny, port serwisowy | Dostępność nabrzeża, harmonogram portu |

**Pojęcia:** weather window, weather downtime (kto płaci za postój z powodu pogody – ustalane progami w kontrakcie, np. „weather risk sharing”), Marine Warranty Surveyor (MWS – zatwierdza operacje morskie dla ubezpieczyciela), SIMOPS (jednoczesne operacje różnych wykonawców), T&I (Transport & Installation).

**Projekty PL (orientacyjnie):** Baltic Power (Orlen/Northland), Bałtyk II i III (Equinor/Polenergia), Baltica 2 (PGE/Ørsted). **DE:** liczne projekty na Morzu Północnym i Bałtyku (RWE, EnBW, Ørsted, Vattenfall); przyłączenia realizują TenneT i 50Hertz.

## Lekcja 2.5 — Przemysł i instalacje technologiczne

**Dokumentacja procesowa:** PFD (Process Flow Diagram), P&ID (Piping & Instrumentation Diagram), datasheets urządzeń, listy linii, izometrie rurociągów.

**Sekwencja zakończenia (completion):**
```
Mechanical Completion (MC) → Pre-commissioning (testy na zimno, płukanie, testy ciśnieniowe, loop checks)
→ Commissioning (testy na gorąco, z mediami) → Start-up → Performance Tests (gwarantowane parametry)
→ Reliability / trial run → Provisional Acceptance → Final Acceptance
```
**Punch list:** kategoria A (blokuje MC/odbiór), B (do usunięcia po odbiorze), C (uwagi).

**Gwarancje wykonawcze EPC:** wydajność, zużycie energii/mediów, emisje, dostępność. **Performance LDs** – za każdy % niedotrzymania; często z „minimum performance” – poniżej Owner może odrzucić instalację.

## Lekcja 2.6 — Jak czytać raport z postępu (Progress Report, FIDIC 4.20)
Szukaj: % postępu planowany vs rzeczywisty, ścieżka krytyczna i zmiana daty ukończenia, zdarzenia opóźniające, zasoby (ludzie, sprzęt), dostawy long-lead, BHP (HSE), jakość (NCR – non-conformance reports), zmiany i roszczenia w toku, pogoda.
Każde zdarzenie w raporcie, które nie jest ryzykiem Twojej strony, to sygnał do notice.

---

## Praktyka
1. Obejrzyj 3 filmy: budowa fundamentu turbiny, montaż turbiny onshore, instalacja monopile offshore. Spisz sekwencję i wskaż 5 punktów, w których może powstać opóźnienie po stronie Ownera.
2. **Produkt:** „Jak powstaje farma wiatrowa” – 2 strony własnymi słowami + diagram pakietów i interfejsów.
3. Zadanie: transformator dla GPZ będzie 6 miesięcy później niż planowano. Opisz skutki techniczne (co nie może ruszyć) i kontraktowe (kto może komu co zgłosić).

## Pytania kontrolne
1. Co to jest long-lead item i dlaczego jest ważny kontraktowo?
2. Dlaczego energizacja jest często na ścieżce krytycznej farmy wiatrowej?
3. Czym różni się FAT od SAT?
4. Kto ponosi ryzyko weather downtime offshore?
5. Czym różni się Mechanical Completion od Taking Over?

<details><summary>Odpowiedzi</summary>

1. Urządzenie o długim czasie dostawy (transformator, turbina, kabel eksportowy). Musi być zamówione wcześnie; jego opóźnienie przesuwa całą ścieżkę krytyczną. Kontraktowo: zaliczki, gwarancje, prawo własności, płatności za materiały nie dostarczone na plac (Plant and Materials intended for the Works, Cl. 14.5).
2. Bez sieci nie można uruchomić turbin ani przeprowadzić testów, a przyłączenie zależy od operatora sieci (strona trzecia) i ukończenia GPZ.
3. FAT – test w fabryce przed wysyłką; SAT – test po montażu na miejscu.
4. Zależy od kontraktu: zwykle wykonawca do ustalonego progu (np. przy założonych statystykach pogodowych P50/P75), powyżej – Owner lub podział.
5. MC to stan techniczny (zmontowane zgodnie z projektem, bez testów z mediami); Taking Over to akt kontraktowy przenoszący ryzyko i opiekę na Ownera i zatrzymujący LDs za opóźnienie.
</details>

## Lektury
- Materiały techniczne producentów turbin (broszury produktowe Vestas, Siemens Gamesa, Nordex).
- WindEurope, *Wind energy in Europe* – raporty roczne.
- DNV standardy (przegląd), IEC 61400 (seria – tylko spis treści i zakres).
- PSE: „Instrukcja Ruchu i Eksploatacji Sieci Przesyłowej” – rozdział o przyłączaniu (przegląd).

## Słownictwo
foundation – fundament – Fundament · pile – pal – Pfahl · crane – dźwig – Kran · substation – stacja elektroenergetyczna / GPZ – Umspannwerk · transformer – transformator – Transformator · cable – kabel – Kabel · grid connection – przyłączenie do sieci – Netzanschluss · commissioning – rozruch – Inbetriebnahme · punch list – lista usterek – Restmängelliste · weather downtime – przestój pogodowy – wetterbedingte Ausfallzeit.
