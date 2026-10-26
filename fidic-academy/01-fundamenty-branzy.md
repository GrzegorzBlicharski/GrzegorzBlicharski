# 01 — Fundamenty branży budowlanej

**Poziom:** L1 · **Czas:** ~2 tygodnie

## Cel i efekty uczenia
Po module:
- opisujesz projekt budowlany od pomysłu do rozliczenia końcowego i wiesz, jakie dokumenty powstają na każdym etapie;
- rozróżniasz role i interesy stron;
- dobierasz model realizacji (DBB, D&B, EPC, EPCM, Turnkey, multi-contract) do profilu projektu i wiesz, jak każdy z nich rozkłada ryzyko;
- rozumiesz, gdzie w tym łańcuchu siedzi Contract Administrator / Manager i za co odpowiada.

---

## Lekcja 1.1 — Uczestnicy projektu

| Rola | PL | DE | Interes / odpowiedzialność |
|---|---|---|---|
| **Employer / Owner / Client** | Zamawiający, Inwestor | Auftraggeber (AG), Bauherr | Płaci, ponosi ryzyko inwestycyjne, definiuje wymagania |
| **Contractor** | Wykonawca (generalny) | Auftragnehmer (AN), Generalunternehmer (GU) | Wykonuje roboty (i ew. projekt) za cenę i w czasie |
| **Subcontractor** | Podwykonawca | Nachunternehmer (NU), Subunternehmer | Wykonuje część zakresu dla wykonawcy |
| **Supplier / Vendor** | Dostawca | Lieferant | Dostarcza urządzenia (turbiny, transformatory) |
| **Engineer** (FIDIC Red/Yellow) | Inżynier Kontraktu | Ingenieur, Bauüberwachung | Administruje kontraktem, certyfikuje płatności, wydaje determinacje |
| **Employer's Representative** (Silver) | Przedstawiciel Zamawiającego | Vertreter des AG | Działa w imieniu Employera (nie jest neutralny jak Engineer) |
| **Designer** | Projektant | Planer, Architekt/Fachplaner | Projekt; w DBB zatrudniony przez Employera, w D&B przez Contractora |
| **Owner's Engineer / PMC** | Inżynier Inwestora, PMC | Projektsteuerer | Doradza Employerowi technicznie i kontraktowo |
| **Lenders / LTA** | Banki, doradca techniczny banków | Kreditgeber, technischer Berater | Finansują; wymagają bankowalnego kontraktu |
| **Authorities** | Organy (nadzór budowlany, URE, OSD/OSP) | Behörden, Netzbetreiber | Pozwolenia, przyłączenie do sieci |
| **Insurer, Surety** | Ubezpieczyciel, gwarant | Versicherer, Bürge | Polisy CAR/EAR, gwarancje bankowe |
| **Kierownik budowy / Inspektor nadzoru** | (PL – funkcje ustawowe) | Bauleiter / Bauüberwacher | Funkcje z Prawa budowlanego, niezależne od ról kontraktowych |

**Kluczowa obserwacja dla prawnika:** w Polsce „Inżynier Kontraktu” z FIDIC często łączy funkcję kontraktową (Cl. 3) z ustawowym inspektorem nadzoru inwestorskiego. To dwa różne źródła uprawnień – kontraktowe i publicznoprawne.

## Lekcja 1.2 — Cykl życia inwestycji

```
Koncepcja → Studium wykonalności → Pozwolenia i projekt → Przetarg → Kontrakt
→ Mobilizacja → Projekt wykonawczy → Zakupy/produkcja → Budowa → Testy/rozruch
→ Odbiór (Taking Over) → Okres zgłaszania wad (DNP) → Performance Certificate → Final Account
```

| Faza | Dokumenty | Rola Contract Managera |
|---|---|---|
| Feasibility, FEED | Studium, FEED (Front-End Engineering Design), budżet, analiza ryzyk | Wybór modelu realizacji, strategia zakupowa |
| Pozwolenia | Decyzja środowiskowa, MPZP/WZ, pozwolenie na budowę; w DE: BImSchG-Genehmigung (dla wiatraków), Planfeststellung | Warunki pozwoleń przenoszone do kontraktu jako obowiązki |
| Przetarg (tender) | SWZ/ITT, Employer's Requirements, BoQ, projekt umowy | Przegląd projektu umowy, pytania, clarifications, qualification/deviation list |
| Kontrakt | Letter of Acceptance, Contract Agreement, PC, GC | Kontrola kompletności, Contract Data, kalendarz terminów |
| Realizacja | Programme, raporty, instrukcje, zmiany, IPC, notices | Administracja, zmiany, roszczenia, płatności |
| Odbiór | Tests on Completion, punch list, Taking-Over Certificate | Dokumentacja odbiorowa, LDs, zwolnienie zabezpieczeń |
| Po odbiorze | DNP, Performance Certificate, Final Statement | Rozliczenie końcowe, zamknięcie roszczeń |

## Lekcja 1.3 — Modele realizacji

| Model | Kto projektuje | Cena | Ryzyko projektowe | FIDIC | Typowe zastosowanie |
|---|---|---|---|---|---|
| **DBB** (Design-Bid-Build), tradycyjny | Employer (projektant) | Obmiarowa (remeasurement) | Employer | Red | Drogi, kolej, budownictwo publiczne w PL |
| **D&B** (Design & Build) | Contractor na bazie Employer's Requirements | Ryczałt + zmiany | Contractor (fitness for purpose) | Yellow | Obiekty przemysłowe, stacje, mosty |
| **EPC / Turnkey** | Contractor, „pod klucz” | Ryczałt, wysoka pewność | Contractor (prawie całość, łącznie z gruntem) | Silver | Elektrownie, projekty finansowane project finance |
| **EPCM** | Contractor EPCM jako usługa (projekt, zakupy, zarządzanie); Owner zawiera kontrakty z wykonawcami | Fee (wynagrodzenie usługowe) | Owner | White + kontrakty pakietowe | Górnictwo, chemia, duże zakłady |
| **Multi-contract** | Owner dzieli projekt na pakiety | Różnie | Owner (ryzyko interfejsów!) | Mix (Yellow/Silver/bespoke) | Offshore wind, duże OZE |
| **DBO** | Contractor projektuje, buduje i eksploatuje | Ryczałt + opłata za eksploatację | Contractor przez cały cykl | Gold | Oczyszczalnie, zakłady wodne |
| **Alliancing / partnering** | Wspólnie | Target cost, pain/gain | Dzielone | NEC4 Option C/E, umowy alliance | UK, Australia, rzadko w PL |

**Zasada alokacji ryzyka (Abrahamson):** ryzyko powinna ponosić strona, która (1) ma nad nim kontrolę, (2) może je najtaniej ubezpieczyć lub zarządzić nim, (3) czerpie korzyść z jego podjęcia. FIDIC Golden Principles: GP4 – zrównoważona alokacja ryzyka.

**Ceny:**
- **Remeasurement / Admeasurement** – płacisz za faktycznie zmierzone ilości × stawki z BoQ (Red Book Cl. 12).
- **Lump sum** – stała cena za zdefiniowany zakres; zmiany tylko przez variations (Yellow/Silver Cl. 14.1).
- **Cost reimbursable / cost-plus** – koszty + marża/fee.
- **Target cost** – koszt docelowy z podziałem oszczędności i przekroczeń (pain/gain share).
- **Unit price** – stawki jednostkowe (np. framework).

## Lekcja 1.4 — Kontrakt jako system zarządzania

Kontrakt budowlany to nie tylko alokacja ryzyka (jak umowa handlowa), ale **instrukcja operacyjna** na lata. Co odróżnia go od umów, które znasz:
- **Długi czas trwania** i nieuniknione zmiany → mechanizmy zmian (variations) zamiast renegocjacji.
- **Trzecia strona-administrator** (Engineer) z uprawnieniami decyzyjnymi.
- **Procedury czasowe** (time bars) – brak notice w terminie = utrata roszczenia.
- **Wielostopniowe rozwiązywanie sporów** w trakcie realizacji (DAAB), żeby budowa się nie zatrzymała.
- **Dokumentacja bieżąca** (contemporary records) decyduje o wygranej w sporze.

## Lekcja 1.5 — Kim jest Contract Administrator / Manager

| Stanowisko | Zadania | Typowe pytanie rekrutacyjne |
|---|---|---|
| Contract Administrator | Rejestry, korespondencja, monitorowanie terminów, przygotowanie notices, wsparcie IPC | „Jak zapewnisz, że nie przegapimy terminu na notice?” |
| Contract Engineer | Analiza zmian i roszczeń, przygotowanie variation proposals, przegląd umów podwykonawczych | „Jak wycenisz zmianę, dla której brak stawki w BoQ?” |
| Contract Manager | Strategia kontraktowa, negocjacje, odpowiedzialność za pozycję handlową, zespół | „Jak przygotujesz projekt do potencjalnego sporu?” |
| Commercial Manager / QS | Wycena, CVR, rozliczenia, cash flow, podwykonawcy | „Wyjaśnij różnicę między cost a value.” |
| Claims Consultant | Analiza opóźnień i kosztów, raporty roszczeniowe, wsparcie w DAAB/arbitrażu | „Jaką metodę analizy opóźnień wybierzesz i dlaczego?” |

---

## Praktyka
1. **Mapa ról:** dla farmy wiatrowej onshore 50 MW (EPC BOP + osobny kontrakt dostawy turbin) narysuj strony, umowy i przepływ dokumentów (instrukcje, płatności, notices).
2. **Wybór modelu:** dla trzech projektów (droga ekspresowa GDDKiA; farma offshore 1 GW; zakład chemiczny) wskaż model realizacji i wzór FIDIC + uzasadnienie w 5 zdaniach.
3. **Produkt:** „Project Lifecycle Map” – tabela fazy × dokumenty × ryzyka × rola CM.

## Pytania kontrolne
1. Dlaczego w EPC cena jest wyższa niż w DBB dla tego samego zakresu?
2. Jakie ryzyko jest największe dla Ownera w modelu multi-contract?
3. Kto odpowiada za błąd w projekcie w DBB, a kto w D&B?
4. Czym różni się Engineer od Employer's Representative?
5. Czym różni się EPC od EPCM?

<details><summary>Odpowiedzi</summary>

1. Wykonawca przejmuje więcej ryzyka (projekt, warunki gruntowe, pewność ceny i terminu) i wycenia je jako contingency + marżę za ryzyko.
2. Ryzyko interfejsów: opóźnienie lub wada jednego pakietu blokuje inny, a Owner odpowiada wobec każdego wykonawcy za dostęp i dane od pozostałych.
3. DBB – Employer (wobec wykonawcy; regres do projektanta). D&B – Contractor (z wyjątkiem danych/wymagań, za które odpowiada Employer, np. Yellow 1.9/5.1).
4. Engineer (Red/Yellow) działa w imieniu Employera, ale przy Cl. 3.7 musi działać neutralnie. Employer's Representative (Silver) jest po prostu przedstawicielem Employera; jego determinacje (Silver Cl. 3.5) nie dają tej samej gwarancji niezależności, dlatego w Silver większą rolę odgrywa DAAB. Zawsze sprawdź Particular Conditions.
5. EPC – wykonawca wykonuje i odpowiada za rezultat za cenę ryczałtową. EPCM – wykonawca świadczy usługę zarządzania i projektowania; ryzyko wykonania i koszty robót pozostają u Ownera.
</details>

## Lektury
- FIDIC Golden Principles (2019).
- FIDIC Contracts Guide 2nd ed. – rozdział wstępny o wyborze wzoru.
- Abrahamson M., *Engineering Law and the I.C.E. Contracts* – fragmenty o alokacji ryzyka.

## Słownictwo
Employer – Zamawiający – Auftraggeber · Contractor – Wykonawca – Auftragnehmer · Subcontractor – Podwykonawca – Nachunternehmer · lump sum – ryczałt – Pauschalpreis · remeasurement – rozliczenie obmiarowe – Einheitspreisvertrag · tender – przetarg – Ausschreibung · Taking Over – przejęcie / odbiór – Abnahme · Defects Notification Period – okres zgłaszania wad – Mängelhaftungsfrist / Gewährleistungsfrist.
