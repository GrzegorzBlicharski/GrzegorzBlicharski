# 03 — Dokumentacja projektowa i planowanie

**Poziom:** L1 · **Czas:** ~2 tygodnie

## Cel i efekty uczenia
- czytasz rysunek techniczny na poziomie „co, gdzie, jaka rewizja”;
- rozumiesz relację: specyfikacja ↔ rysunki ↔ przedmiar ↔ cena;
- czytasz harmonogram CPM, rozumiesz ścieżkę krytyczną, float, baseline i aktualizacje;
- liczysz podstawowe wskaźniki Earned Value;
- przeglądasz harmonogram wykonawcy pod kątem wymagań FIDIC Cl. 8.3.

---

## Lekcja 3.1 — Rysunki techniczne

| Pojęcie | Znaczenie |
|---|---|
| Rzut (plan) | Widok z góry |
| Przekrój (section) | Widok „po przecięciu” |
| Elewacja / widok (elevation) | Widok z boku |
| Detal (detail) | Powiększenie fragmentu |
| Skala | 1:100, 1:50, 1:20 – rysunki nie są do mierzenia linijką, liczą się wymiary |
| Tabliczka rysunkowa (title block) | Numer, tytuł, autor, data, **rewizja**, status |
| Status | For Information / For Approval / For Construction (IFC) / As-Built |
| Rewizja | A, B, C… lub 0, 1, 2 – zmiana rewizji po podpisaniu kontraktu może oznaczać variation |

**Kontraktowo najważniejsze:** która rewizja jest „kontraktowa” (stan z dnia Base Date / oferty), a która została wydana później. Porównanie rewizji („delta”) = podstawa wyceny zmian. W Red Book Engineer wydaje dodatkowe rysunki i instrukcje (Cl. 1.9 – opóźnione rysunki to podstawa roszczenia). W Yellow wykonawca sam projektuje i przedkłada Contractor's Documents do przeglądu (Cl. 5.2).

**BIM:** model 3D z informacjami (IFC, Revit). Kontrakty coraz częściej mają BIM Execution Plan; kolizje wykryte w modelu = wczesne ostrzeżenie zamiast claimu.

## Lekcja 3.2 — Specyfikacje i przedmiary

| Dokument | PL | DE | Rola |
|---|---|---|---|
| Specification | Specyfikacja techniczna (STWiORB – Specyfikacja Techniczna Wykonania i Odbioru Robót Budowlanych) | Leistungsbeschreibung, Baubeschreibung | Jak ma być wykonane, jakie materiały i normy |
| Employer's Requirements | Program funkcjonalno-użytkowy (PFU) | funktionale Leistungsbeschreibung | Co ma być osiągnięte (D&B/EPC) |
| Bill of Quantities | Przedmiar robót; po wycenie: kosztorys ofertowy | Leistungsverzeichnis (LV) | Pozycje × ilości × stawki |
| Method of Measurement | Zasady obmiaru (KNR, ST) | VOB/C, Aufmaßregeln | Jak liczyć ilości |

**Pułapki:**
- Przedmiar w kontrakcie ryczałtowym zwykle **nie jest** kontraktowy (informacyjny) – błędy w ilościach to ryzyko wykonawcy (chyba że umowa stanowi inaczej).
- W Red Book ilości w BoQ są **szacunkowe** (Cl. 14.1); płaci się za zmierzone ilości. Duża zmiana ilości może uzasadniać zmianę stawki (Cl. 12.3 – progi: >10% zmiany ilości + inne warunki).
- Pozycje „provisional sum” (Cl. 13.4) i „daywork” (Cl. 13.5).

## Lekcja 3.3 — Harmonogram (Programme): CPM

**Podstawy:**
- **Activity** (czynność) – czas trwania, zasoby.
- **Logic links**: FS (Finish-to-Start), SS (Start-to-Start), FF, SF; **lag/lead** (opóźnienie/wyprzedzenie).
- **Forward pass** – najwcześniejsze terminy (ES, EF). **Backward pass** – najpóźniejsze (LS, LF).
- **Total Float (TF)** = LS – ES – o ile czynność może się opóźnić bez opóźnienia ukończenia projektu.
- **Free Float (FF)** – o ile może się opóźnić bez wpływu na następniki.
- **Critical path** – najdłuższa ścieżka, czynności z TF = 0 (lub najniższym). Opóźnienie na niej = opóźnienie projektu.
- **Near-critical** – TF niski (np. < 10 dni) – obserwuj.
- **Milestone** – kamień milowy (czas 0).
- **Constraint** – sztywna data (np. „not earlier than”) – nadmiar ograniczeń fałszuje ścieżkę krytyczną.
- **Baseline** – zatwierdzony plan bazowy. **Update** – aktualizacja z postępem na **data date**.
- **Gantt** – wykres paskowy; **S-curve** – krzywa skumulowanego postępu/kosztów.

**Ćwiczenie liczbowe:**
```
A (10 d) → B (5 d) → D (8 d) → END
A (10 d) → C (12 d) → D
```
Ścieżka A–C–D = 30 d (krytyczna); A–B–D = 23 d → B ma TF = 7 d. Jeśli Employer opóźni B o 5 dni → brak wpływu na Time for Completion (float pochłania). Jeśli o 9 dni → opóźnienie projektu 2 dni.

**Kto jest właścicielem floatu?** Kluczowy spór. FIDIC milczy; SCL Protocol: jeśli kontrakt nie stanowi inaczej, float należy do projektu – EoT tylko gdy opóźnienie Employera zmniejszy float poniżej zera na ścieżce do daty ukończenia.

**Narzędzia:** Primavera P6 (standard w dużych projektach i w analizach opóźnień), MS Project, Asta Powerproject (UK), Tilos (liniowe – drogi, kable). Naucz się P6 przynajmniej na poziomie: otwieranie XER, filtrowanie ścieżki krytycznej, porównanie baseline vs update.

## Lekcja 3.4 — Programme w FIDIC 2017 (Cl. 8.3)
- Wykonawca przedkłada initial programme w ciągu 28 dni od Commencement Date.
- Wymagana treść: m.in. kolejność robót, terminy przeglądów dokumentów, inspekcje i testy, **logic links, floats, critical path**, okresy dla Employera (np. dostęp do placu), pakiety podwykonawców, zasoby.
- Engineer ma 21 dni na uwagi (Notice) – brak uwag = programme staje się „Programme”.
- Aktualizacja: gdy programme przestaje odpowiadać rzeczywistości.
- Programme nie zmienia kontraktu, ale jest podstawą do oceny EoT (Cl. 8.5).

**Checklist przeglądu harmonogramu (DCMA 14-point – uproszczony):**
1. Brak logiki (otwarte końce – open ends) < 5%.
2. Leads (ujemne lagi) – brak.
3. Lags – ograniczone.
4. Relacje FS dominują (≥ 90%).
5. Twarde ograniczenia (hard constraints) < 5%.
6. Duży float (> 44 d) – sprawdź.
7. Ujemny float – wyjaśnij.
8. Długie czynności (> 44 d) – rozbij.
9. Daty niemożliwe (postęp w przyszłości, brak postępu w przeszłości).
10. Zasoby przypisane.
11. Spójność ścieżki krytycznej (test: wydłuż czynność krytyczną – czy data końcowa się przesuwa?).
12. Zgodność z kamieniami milowymi kontraktu i okresami dostępu.

## Lekcja 3.5 — Earned Value Management (EVM)

| Wskaźnik | Wzór | Znaczenie |
|---|---|---|
| PV (Planned Value) | wartość planowana do daty | Ile miało być zrobione |
| EV (Earned Value) | wartość wykonanych robót wg budżetu | Ile zrobiono |
| AC (Actual Cost) | koszt rzeczywisty | Ile wydano |
| SV = EV – PV | | < 0 = opóźnienie |
| CV = EV – AC | | < 0 = przekroczenie kosztów |
| SPI = EV/PV | | < 1 = za wolno |
| CPI = EV/AC | | < 1 = za drogo |
| EAC = BAC/CPI | | Prognoza kosztu końcowego |

Przykład: BAC = 100 mln, PV = 40, EV = 32, AC = 38 → SPI = 0,80, CPI = 0,84, EAC ≈ 119 mln.

## Lekcja 3.6 — Odbiory i rozliczenia (przegląd)
- **Odbiory częściowe i końcowe** (PL: art. 654 KC – częściowe płatności; protokół odbioru), **Taking Over** (FIDIC Cl. 10), **Abnahme** (BGB § 640).
- **Płatności okresowe** wg postępu/kamieni milowych → zatrzymanie (retention) → rozliczenie końcowe.
- **Milestone payment schedule** w EPC: płatności za zdarzenia (np. dostawa turbin na plac 30%, montaż 30%, uruchomienie 20%, odbiór 10%, PAC/FAC 10%).

---

## Praktyka
1. Ściągnij przykładowy projekt w P6 lub MS Project (dostępne darmowe przykłady / wersja trial) i zidentyfikuj ścieżkę krytyczną.
2. Policz ES/EF/LS/LF/TF dla sieci 8 czynności (zadanie od mentora).
3. **Produkt:** Programme Review Report – 10 uwag do przykładowego harmonogramu wykonawcy w formie pisma Engineera do Contractora (Notice under Sub-Clause 8.3).

## Pytania kontrolne
1. Czym różni się total float od free float?
2. Dlaczego nadmiar „constraints” w harmonogramie jest problemem w analizie opóźnień?
3. Czy przedmiar w kontrakcie ryczałtowym wiąże strony?
4. SPI = 0,9, CPI = 1,1 – co to oznacza?
5. Co się stanie, jeśli Engineer nie zgłosi uwag do harmonogramu w terminie (FIDIC 2017)?

<details><summary>Odpowiedzi</summary>

1. TF – zapas względem daty ukończenia projektu; FF – zapas względem najwcześniejszego startu następnika.
2. Ograniczenia blokują naturalną propagację opóźnień w logice sieci – harmonogram nie pokazuje rzeczywistego wpływu zdarzeń, ścieżka krytyczna jest sztuczna.
3. Zasadniczo nie – ryzyko ilości ponosi wykonawca; chyba że umowa przewiduje inaczej lub przedmiar ma charakter kontraktowy.
4. Projekt jest opóźniony (wykonano 90% planowanego zakresu), ale tańszy niż budżet dla wykonanego zakresu.
5. Po 21 dniach od otrzymania harmonogram uznaje się za Programme (Cl. 8.3).
</details>

## Lektury
- SCL Delay and Disruption Protocol 2nd ed. – Core Principles o harmonogramie, aktualizacjach i floacie.
- PMI, *Practice Standard for Scheduling* (fragmenty).
- DCMA 14-Point Assessment – opisy dostępne online.

## Słownictwo
drawing – rysunek – Zeichnung/Plan · revision – rewizja – Revision/Planstand · Bill of Quantities – przedmiar/kosztorys – Leistungsverzeichnis · programme/schedule – harmonogram – Terminplan/Bauzeitenplan · critical path – ścieżka krytyczna – kritischer Weg · float – zapas czasu – Puffer · milestone – kamień milowy – Meilenstein · baseline – harmonogram bazowy – Basisterminplan · as-built – powykonawczy – Bestand / Ist-Ablauf.
