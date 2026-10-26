# 07 — Analiza opóźnień i zakłóceń (Delay & Disruption)

**Poziom:** L2 → L3 · **Czas:** ~5 tygodni

## Cel i efekty uczenia
- znasz zasady SCL Delay and Disruption Protocol i klasyfikację metod AACE RP 29R-03;
- wybierasz metodę analizy opóźnień stosownie do dostępnych danych i etapu projektu;
- przeprowadzasz uproszczoną Time Impact Analysis i Windows Analysis;
- rozumiesz concurrent delay, prevention principle, ownership of float, acceleration;
- wyliczasz prolongation costs i disruption (measured mile), krytycznie oceniasz formuły HO overheads.

---

## Lekcja 7.1 — Klasyfikacja opóźnień

| Rodzaj | Kto odpowiada | EoT | Pieniądze |
|---|---|---|---|
| **Excusable & compensable** (ryzyko Employera) | Employer | Tak | Tak (Cost / Cost Plus Profit) |
| **Excusable & non-compensable** (ryzyko neutralne: pogoda, Exceptional Events, organy) | Nikt | Tak | Nie |
| **Non-excusable** (ryzyko wykonawcy) | Wykonawca | Nie | Delay Damages dla Employera |
| **Concurrent** | Obie strony równocześnie | Zależy od kontraktu i prawa | Zwykle brak kosztów |

**Critical vs non-critical:** tylko opóźnienie na ścieżce krytycznej (do daty ukończenia) daje EoT. Opóźnienie non-critical może dać koszty (np. przestój sprzętu), ale nie czas.

## Lekcja 7.2 — SCL Delay and Disruption Protocol (2nd ed. 2017) – najważniejsze zasady
Protokół zawiera 22 Core Principles. Najważniejsze dla praktyki:
- **Programme i records** – strony uzgadniają harmonogram bazowy, regularnie go aktualizują i prowadzą dokumentację.
- **EoT ustalane prospektywnie**, możliwie blisko zdarzenia (nie „wait and see” do końca projektu).
- Wniosek o EoT składany jak najszybciej, nawet przy niepełnej informacji.
- EoT przysługuje, gdy zdarzenie z ryzyka Employera opóźnia ukończenie.
- **Mitigation** – obowiązek wykonawcy, ale nie oznacza przyspieszenia na własny koszt.
- **Float** – jeśli kontrakt nie stanowi inaczej: EoT tylko, gdy opóźnienie Employera ma skutek na datę ukończenia po wykorzystaniu floatu (float „należy do projektu”).
- **Concurrent delay a czas:** gdy opóźnienie Employera i wykonawcy są rzeczywiście równoczesne i oba krytyczne – wykonawca dostaje EoT za okres concurrency.
- **Concurrent delay a pieniądze:** wykonawca nie odzyskuje kosztów za okres, w którym i tak poniósłby je z własnej winy.
- Analiza retrospektywna – metoda dobrana do dostępnych dowodów.
- Kompensacja: prolongation, disruption, przyspieszenie, HO overheads, odsetki; ostrożnie z global claims.

**Prawdziwa równoczesność (true concurrency)** jest rzadka: dwa zdarzenia o równoczesnym skutku na ścieżce krytycznej. Częściej mamy „concurrent effect” zdarzeń w różnym czasie.

**Orzecznictwo (Anglia – wpływowe w arbitrażu międzynarodowym):**
- *Henry Boot v Malmaison* (1999) – „Malmaison approach”: przy concurrency EoT dla wykonawcy, bez kosztów.
- *City Inn v Shepherd* (Szkocja, 2010) – apportionment (podział), nieprzyjęte w Anglii.
- *North Midland Building v Cyden Homes* [2018] EWCA Civ 1744 – klauzula wyłączająca EoT przy concurrency jest skuteczna.
- *Peak v McKinney* (1970) – **prevention principle:** Employer nie może egzekwować kar za opóźnienie, które sam spowodował; jeśli brak mechanizmu EoT – czas „staje się otwarty” (time at large).
- *Multiplex v Honeywell* [2007] – prevention principle a time bar: dobrze sformułowany mechanizm EoT z warunkiem notice może być skuteczny.

**FIDIC 2017 Cl. 8.5:** concurrency – wg zasad i procedur w Special Provisions (jeśli brak – według prawa właściwego i odpowiednich protokołów).

## Lekcja 7.3 — Metody analizy opóźnień

| Metoda (SCL / AACE) | Opis | Kiedy | Plusy | Minusy |
|---|---|---|---|---|
| **As-Planned vs As-Built** (AACE MIP 3.1/3.2 – observational) | Porównanie planu z faktycznym przebiegiem, identyfikacja przyczyn odchyleń | Słabe harmonogramy, proste projekty | Prosta, intuicyjna | Nie dowodzi ścieżki krytycznej w zmiennych warunkach |
| **Impacted As-Planned** (MIP 3.6 – modelled, additive, single base) | Wstawienie zdarzeń Employera do planu bazowego | Prospektywnie; gdy brak aktualizacji | Szybka | Ignoruje faktyczny przebieg i opóźnienia wykonawcy – teoretyczna |
| **Time Impact Analysis (TIA)** (MIP 3.7 – modelled, additive, multiple base) | Dla każdego zdarzenia: aktualizacja harmonogramu na datę tuż przed zdarzeniem + wstawienie fragnetu → różnica daty ukończenia | Prospektywnie (preferowana w SCL) i retrospektywnie | Uwzględnia postęp i stan projektu w chwili zdarzenia | Pracochłonna, zależy od jakości aktualizacji |
| **Windows / Time Slice Analysis** (MIP 3.3/3.4 – observational, dynamic) | Projekt dzielony na okna (np. miesięczne); w każdym analiza zmian ścieżki krytycznej i daty ukończenia | Retrospektywnie, gdy są regularne aktualizacje | Odzwierciedla rzeczywisty przebieg ścieżki krytycznej | Wymaga dobrych aktualizacji |
| **Collapsed As-Built / But-For** (MIP 3.8/3.9 – modelled, subtractive) | Budowa harmonogramu as-built, usunięcie zdarzeń Employera → „data ukończenia, gdyby nie…” | Retrospektywnie, gdy brak dobrego baseline | Oparta na faktach | Subiektywna logika as-built |

**Wybór metody (SCL Protocol):** zależy od: postanowień kontraktu, natury zdarzeń, wartości sporu, czasu, dostępnych dowodów i harmonogramów, skali projektu. Na egzaminie i w rozmowie rekrutacyjnej – zawsze uzasadnij wybór.

## Lekcja 7.4 — TIA krok po kroku (ćwiczenie)
1. Weź ostatnią aktualizację harmonogramu przed zdarzeniem (data date tuż przed zdarzeniem). Zanotuj prognozowaną datę ukończenia (np. 30.06).
2. Zbuduj **fragnet** – sieć czynności reprezentujących zdarzenie (np. „Oczekiwanie na rewizję projektu fundamentów 21 d” → „Rewizja zbrojenia 10 d”) i połącz logicznie z dotkniętymi czynnościami.
3. Przelicz harmonogram. Nowa data ukończenia (np. 25.07) → wpływ = 25 dni.
4. Sprawdź, czy w tym samym oknie wykonawca nie miał własnych opóźnień (concurrency).
5. Udokumentuj: plik przed/po, lista fragnetu, założenia, dowody czasów trwania.
6. Wniosek: EoT = 25 dni (lub mniej, jeśli concurrency / float).

## Lekcja 7.5 — Acceleration
- **Directed acceleration** – Employer polecił przyspieszenie (Variation 13.3.1 w 2017) → koszty przyspieszenia.
- **Constructive acceleration** – Engineer odmawia uzasadnionego EoT, wykonawca przyspiesza, by uniknąć Delay Damages. Przesłanki (orzecznictwo US, przyjmowane szerzej): (1) opóźnienie usprawiedliwione, (2) wniosek o EoT, (3) odmowa lub brak decyzji, (4) faktyczne żądanie ukończenia w pierwotnym terminie, (5) faktyczne przyspieszenie i koszty. Wykonawca powinien wyraźnie zawiadomić, że przyspiesza „under protest”.
- **Mitigation vs acceleration:** rozsądne działania ograniczające (przesunięcie zasobów) – w ramach mitigation, bez dodatkowej zapłaty; dodatkowe zasoby i nadgodziny – acceleration.

## Lekcja 7.6 — Quantum: koszty opóźnienia (prolongation)

**Prolongation costs** – koszty zależne od czasu za okres EoT (compensable):
- Koszty ogólne budowy (site overheads / preliminaries): personel kierowniczy, zaplecze, ubezpieczenia, sprzęt stały, media, ochrona, BHP.
- Wydłużone gwarancje i ubezpieczenia.
- Wpływ inflacji na roboty przesunięte w czasie (jeśli brak waloryzacji).
- **Koszty zarządu (Head Office Overheads, HOOH)** i utracony zysk – kontrowersyjne:

| Formuła | Wzór (uproszczony) | Uwagi |
|---|---|---|
| **Hudson** | (HO % z oferty / 100) × (cena kontraktu / czas kontraktu) × okres opóźnienia | Opiera się na % z oferty – krytykowana |
| **Emden** | (HO % rzeczywisty firmy z obrotów / 100) × (cena / czas) × okres | Rzeczywisty % z sprawozdań finansowych |
| **Eichleay** (US) | Alokacja rzeczywistych kosztów zarządu do kontraktu proporcjonalnie do obrotu, następnie na dzień | Standard w USA (federal) |

Warunek: wykonawca musi wykazać, że **utracił możliwość** pozyskania innej pracy (opportunity) – formuły nie zastępują dowodu (SCL Protocol).

**Uwaga na okres:** wycenia się koszty **w okresie, gdy wystąpiło opóźnienie** (np. gdy zespół był na budowie w czasie wstrzymania), a nie na końcu projektu („extended period” vs „period of delay”) – SCL rekomenduje okres faktycznego wystąpienia.

## Lekcja 7.7 — Disruption (zakłócenie)
Utrata wydajności (loss of productivity) bez konieczności opóźnienia ukończenia.

| Metoda | Opis | Wartość dowodowa |
|---|---|---|
| **Measured mile** | Porównanie wydajności w okresie niezakłóconym i zakłóconym dla tej samej pracy | Najwyższa (preferowana w SCL) |
| Earned value analysis | Godziny planowane vs rzeczywiste na jednostkę wykonanej pracy | Średnia |
| Studia branżowe (MCAA, Leonard) | Współczynniki spadku wydajności przy nadgodzinach, zatłoczeniu itp. | Niska – pomocniczo |
| Total cost / modified total cost | Różnica między kosztem rzeczywistym a ofertowym | Ostateczność |

## Lekcja 7.8 — Global claims
Roszczenie, w którym wykonawca nie przypisuje poszczególnych kosztów do zdarzeń, tylko twierdzi, że łączny wpływ wielu zdarzeń spowodował łączną stratę. Ryzykowne: jeśli choć część straty wynika z przyczyn wykonawcy, całe roszczenie może upaść. *Walter Lilly v Mackay* [2012] EWHC 1773 (TCC) – global claim dopuszczalny, jeśli wykonawca udowodni, że straty nie wynikają z jego własnych przyczyn (lub przyczyn, za które odpowiada); sąd może przyznać część. Wniosek: zawsze próbuj przypisać koszty do zdarzeń (dlatego kody kosztowe!).

## Lekcja 7.9 — Narzędzia
- **Primavera P6:** import XER, baselines, „Schedule” (F9), porównanie ścieżek, filtr Longest Path, raport Claim Digger (porównanie wersji).
- **Excel:** tabele okien, wykres daty ukończenia w czasie (completion date drift chart).
- Wizualizacja: wykres Gantta z zaznaczonymi zdarzeniami, wykres S-krzywej, wykres „critical path drift”.

---

## Praktyka
1. **Ćwiczenie CPM+:** sieć 15 czynności, 3 zdarzenia Employera, 1 zdarzenie wykonawcy – policz EoT metodą Impacted As-Planned i TIA, porównaj wyniki i wyjaśnij różnicę.
2. **Windows analysis** na 4 aktualizacjach harmonogramu (dane od mentora).
3. **Quantum:** wylicz prolongation costs za 45 dni EoT (dane: koszty ogólne budowy z ewidencji) i HOOH formułą Hudson i Emden; skomentuj słabości.
4. **Egzamin L2 – produkt:** pełny EoT + cost claim (~25 stron) dla case study „Opóźnione przyłączenie GPZ i błąd w projekcie fundamentów” (farma wiatrowa onshore, Yellow Book).

## Pytania kontrolne
1. Czym różni się TIA od Impacted As-Planned?
2. Co to jest prevention principle i jak FIDIC go „neutralizuje”?
3. Kto „posiada” float według SCL Protocol?
4. Kiedy wykonawca ma prawo do EoT, ale nie do kosztów?
5. Dlaczego formuła Hudson jest krytykowana?
6. Jakie warunki należy spełnić, aby skutecznie dochodzić constructive acceleration?

<details><summary>Odpowiedzi</summary>

1. TIA wstawia zdarzenie do aktualnego (zaktualizowanego o postęp) harmonogramu na datę zdarzenia; Impacted As-Planned – do planu bazowego, ignorując postęp i opóźnienia wykonawcy.
2. Employer nie może korzystać z kar za opóźnienie, które sam spowodował. FIDIC zawiera mechanizm EoT obejmujący działania Employera (8.5), co pozwala utrzymać termin i kary – pod warunkiem, że wykonawca zgłasza roszczenie (Notice).
3. Projekt (jeśli kontrakt nie stanowi inaczej) – kto pierwszy, ten lepszy.
4. Ryzyka neutralne: wyjątkowa pogoda, organy władzy (8.6), większość Exceptional Events, concurrency.
5. Używa procentu z oferty zamiast rzeczywistych kosztów, zakłada, że wykonawca mógł pozyskać inny zysk/obrót, może prowadzić do nadmiernego odszkodowania.
6. Usprawiedliwione opóźnienie, prawidłowo zgłoszone; odmowa lub brak decyzji o EoT; żądanie ukończenia w terminie (wprost lub dorozumiane, np. groźba kar); faktyczne przyspieszenie z dodatkowymi kosztami; zawiadomienie, że przyspieszenie następuje pod protestem.
</details>

## Lektury
- SCL Delay and Disruption Protocol 2nd ed. – lektura całości (obowiązkowa).
- AACE RP 29R-03 Forensic Schedule Analysis – rozdziały 1–3.
- Keith Pickavance, *Delay and Disruption in Construction Contracts* – wybrane rozdziały.
- Orzeczenia: *Henry Boot v Malmaison*; *North Midland v Cyden*; *Walter Lilly v Mackay*; *Peak v McKinney*.

## Słownictwo
delay – opóźnienie – Verzögerung/Bauzeitverzögerung · disruption – zakłócenie – Behinderung/Störung · extension of time – przedłużenie czasu na ukończenie – Bauzeitverlängerung · concurrent delay – opóźnienie równoczesne – parallele/überlagernde Verzögerung · acceleration – przyspieszenie – Beschleunigung · prolongation costs – koszty wydłużenia – Mehrkosten der Bauzeitverlängerung · head office overheads – koszty zarządu – Allgemeine Geschäftskosten (AGK) · productivity loss – utrata wydajności – Produktivitätsverlust.
