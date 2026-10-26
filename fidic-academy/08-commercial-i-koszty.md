# 08 — Commercial & Cost Management

**Poziom:** L3 · **Czas:** ~4 tygodnie

## Cel i efekty uczenia
- rozumiesz budowę ceny ofertowej i ryzyka w niej ukryte;
- prowadzisz CVR (cost-value reconciliation), prognozujesz wynik kontraktu i cash flow;
- znasz instrumenty zabezpieczeń (gwarancje, retention, PCG) i ubezpieczeń (CAR/EAR, DSU, OC);
- przygotowujesz i negocjujesz final account;
- rozumiesz waloryzację (indeksację) cen i jej znaczenie po kryzysie inflacyjnym 2021–2023.

---

## Lekcja 8.1 — Budowa ceny (estimating & tendering)
```
Koszty bezpośrednie (robocizna, materiały, sprzęt, podwykonawcy)
+ Koszty ogólne budowy (preliminaries / site overheads, zwykle 8–15%)
+ Koszty zarządu (HO overheads, 3–8%)
+ Ryzyko (contingency – wycenione ryzyka z rejestru)
+ Zysk (margin)
+ Koszty finansowania, gwarancji, ubezpieczeń
= Cena ofertowa
```
**Risk pricing:** rejestr ryzyk z prawdopodobieństwem i wpływem → Expected Monetary Value (EMV = P × wpływ) lub analiza Monte Carlo (P50, P80). Ryzyka nie do wyceny → deviation/qualification w ofercie (jeśli przetarg na to pozwala) lub decyzja „no bid”.

**Tender review (Bid/No Bid) – rola CM:** przegląd umowy, lista ryzyk kontraktowych z oceną finansową, propozycje odstępstw, pytania do zamawiającego (clarifications), warunki gwarancji i ubezpieczeń, analiza back-to-back z dostawcami.

## Lekcja 8.2 — Cost vs Value; CVR
- **Value** – to, co możesz zafakturować/uznać jako przychód (wykonane roboty wg stawek kontraktowych + uznane zmiany + oszacowana wartość roszczeń z odpowiednią ostrożnością).
- **Cost** – to, co faktycznie wydałeś (+ rezerwy na koszty poniesione, ale niezafakturowane – accruals).
- **CVR** (miesięcznie): Value – Cost = wynik na dziś; porównanie z budżetem; prognoza na koniec (Forecast Final Cost / Forecast Final Value / Forecast Margin).
- Typowe korekty: over/under-measurement, roboty wykonane niezafakturowane (WIP), przyszłe straty (provision for loss), ryzyka i szanse (risks & opportunities).

**Rewizja wartości roszczeń w CVR:** zasada ostrożności (w MSSF 15 – zmienne wynagrodzenie ujmowane tylko w zakresie wysoko prawdopodobnym). Contract Manager dostarcza ocenę prawdopodobieństwa i kwoty – musi być realistyczna, nie optymistyczna.

## Lekcja 8.3 — Cash flow
- Krzywa S przychodów vs kosztów; luka finansowa w pierwszych miesiącach (mobilizacja) – finansowana zaliczką (advance payment).
- Terminy: Statement → IPC (28 d) → płatność (56 d) = do ~3 miesięcy od wykonania robót do zapłaty.
- **Narzędzia poprawy cash flow:** zaliczka, front-loading (ostrożnie – Engineer może zakwestionować), płatność za materiały na placu (14.5), harmonogram płatności kamieniami milowymi, terminy płatności wobec podwykonawców dłuższe niż od Employera (ograniczone prawem – np. w PL 30 dni w Pzp, ustawa o przeciwdziałaniu nadmiernym opóźnieniom).
- **Ochrona przed niewypłacalnością Employera:** 2.4 (dowód finansowania), 16.1 (zawieszenie), gwarancja zapłaty (PL art. 649¹ KC; DE § 650f BGB).

## Lekcja 8.4 — Zabezpieczenia

| Instrument | Kto daje | Komu | Typowo | Uwagi |
|---|---|---|---|---|
| Bid bond (wadium) | Oferent | Zamawiający | 1–3% | |
| Performance security | Wykonawca | Employer | 5–10% (FIDIC 4.2) | On-demand vs conditional |
| Advance payment guarantee | Wykonawca | Employer | = kwota zaliczki, malejąca | |
| Retention / retention bond | (zatrzymanie) | Employer | 5% IPC, limit 5% ceny | Można zastąpić gwarancją |
| Warranty / defects liability bond | Wykonawca | Employer | 2–5% po TOC | |
| Parent Company Guarantee (PCG) | Spółka matka | Employer | Do pełnej odpowiedzialności | Gdy wykonawca to SPV/spółka zależna |
| Payment guarantee | Employer | Wykonawca | PL 649¹ KC; DE 650f BGB | Rzadko w FIDIC; częściej LC u dostawców |
| Letter of Credit (LC) | Bank kupującego | Dostawca | Dostawy urządzeń | Standby LC |

**On-demand (na pierwsze żądanie) vs conditional (akcesoryjne):** gwarancja na żądanie płatna bez badania zasadności – ochrona tylko przy oczywistym nadużyciu (fraud exception; w PL nadużycie prawa podmiotowego, zabezpieczenie roszczenia o zaniechanie wezwania; w DE einstweilige Verfügung bei Rechtsmissbrauch). **URDG 758** – jednolite reguły ICC dla gwarancji na żądanie; FIDIC załącza wzory zgodne z URDG.

## Lekcja 8.5 — Ubezpieczenia
| Polisa | Zakres | Uwagi |
|---|---|---|
| **CAR** (Contractors' All Risks) | Szkody w robotach w trakcie budowy | Budowlane |
| **EAR** (Erection All Risks) | Montaż urządzeń | Energetyka, przemysł |
| **TPL** (Third Party Liability) | Szkody wobec osób trzecich | Często w jednej polisie z CAR |
| **DSU / ALOP** (Delay in Start-Up / Advance Loss of Profit) | Utracone przychody Ownera wskutek szkody objętej CAR/EAR | Kluczowe w project finance |
| **Marine Cargo** | Transport (także morski) urządzeń | Turbiny, transformatory |
| **PI** (Professional Indemnity) | Błędy projektowe (reasonable skill and care) | Luka wobec fitness for purpose |
| **OCIP / CCIP** (owner/contractor controlled insurance programme) | Jedna polisa na cały projekt | Offshore, duże projekty multi-contract |

**LEG clauses (London Engineering Group):** określają zakres ochrony wad (defects): LEG 1 (wyłączenie całkowite), LEG 2 (pokrywa szkody wynikłe z wady, poza kosztem, który by poniesiono na poprawienie), LEG 3 (pokrywa również naprawę wady, poza kosztem ulepszenia). Kontraktowo: kto ponosi udział własny (deductible) i ryzyka nieubezpieczalne.

## Lekcja 8.6 — Waloryzacja i ryzyko cenowe
- FIDIC 13.7 + Schedule of cost indexation – formuła: Pn = a + b·(Ln/Lo) + c·(En/Eo) + d·(Mn/Mo)… gdzie a – część stała (nieindeksowana), b, c, d – udziały kosztów (robocizna, sprzęt, materiały), indeksy z oficjalnych źródeł (GUS, Destatis).
- **PL:** art. 439 Pzp – obowiązkowa klauzula waloryzacyjna w umowach na roboty budowlane i usługi > 6 mies. (od 2022 r.); ustawowe minimum, maksymalna wartość zmiany w umowie; zmiana cen po stronie wykonawcy → obowiązek waloryzacji wobec podwykonawców (art. 439 ust. 5).
- **DE:** Stoffpreisgleitklauseln (np. wg formularzy VHB Bund 225), § 313 BGB (Störung der Geschäftsgrundlage) jako ostateczność.
- **Rebus sic stantibus PL:** art. 357¹ KC – nadzwyczajna zmiana stosunków; trudna do wykazania, ale stosowana w czasie pandemii/wojny.
- Hedging materiałów (stal, miedź) – narzędzia finansowe w dużych EPC.

## Lekcja 8.7 — Rozliczenie końcowe (Final Account)
1. Zestawienie: Accepted Contract Amount ± zmiany ± obmiar ± waloryzacja ± roszczenia ± Delay Damages ± potrącenia.
2. Uzgodnienie każdej pozycji z Engineerem/Employerem (agreed, disputed, outstanding).
3. Negocjacje globalne (settlement) – pakiet z wzajemnymi ustępstwami; dokumentacja porozumienia (Settlement Agreement), rozważenie skutków dla podwykonawców (back-to-back settlement).
4. **Final Statement i Discharge (14.11–14.12)** – uważaj, by nie zrzec się roszczeń niewymienionych.
5. Zwolnienie zabezpieczeń, zamknięcie polis, archiwizacja.

## Lekcja 8.8 — Zarządzanie podwykonawcami (commercial)
- Wybór (pre-qualification), umowa back-to-back, wyceny zmian u podwykonawców (żeby nie dać więcej niż dostaniesz od Employera), płatności, rozliczenie końcowe.
- **PL:** solidarna odpowiedzialność inwestora za zapłatę podwykonawcom (art. 647¹ KC), w Pzp – bezpośrednia zapłata (art. 465), obowiązek przedkładania umów podwykonawczych (art. 464).
- Kontra-roszczenia wobec podwykonawców (contra charges) – wymagają podstawy i notice w umowie podwykonawczej.

---

## Praktyka
1. **Model CVR** (Excel) dla kontraktu 120 mln PLN: 12 miesięcy danych, prognoza marży, wpływ 3 roszczeń o różnym prawdopodobieństwie.
2. **Cash flow:** krzywa S dla kontraktu z zaliczką 10% i retention 5%; wyznacz szczyt zapotrzebowania na finansowanie.
3. **Waloryzacja:** policz korektę ceny wg formuły dla 3 okresów (dane GUS – produkcja budowlano-montażowa, ceny stali).
4. **Case study:** Employer wzywa do zapłaty z gwarancji on-demand bez uprzedzenia; przygotuj strategię (PL i DE) dla wykonawcy.

## Pytania kontrolne
1. Czym różni się cost od value?
2. Co to jest DSU i kto jest zwykle jego beneficjentem?
3. Dlaczego gwarancja on-demand jest groźna dla wykonawcy?
4. Kiedy w PL obowiązkowa jest klauzula waloryzacyjna w zamówieniach publicznych?
5. Co ryzykujesz, składając Final Statement z Discharge?

<details><summary>Odpowiedzi</summary>

1. Value – przychód należny z kontraktu za wykonane prace; cost – faktycznie poniesione koszty.
2. Ubezpieczenie utraconego zysku/przychodu z powodu opóźnienia uruchomienia wskutek szkody materialnej; beneficjent – Owner (i jego banki).
3. Bank płaci bez badania zasadności; wykonawca musi później dochodzić zwrotu; obrona tylko przy nadużyciu.
4. Art. 439 Pzp – umowy na roboty budowlane lub usługi zawarte na okres dłuższy niż 6 miesięcy.
5. Zrzeczenie się roszczeń, które nie zostały ujęte w Final Statement (z wyjątkami w 14.12/14.14).
</details>

## Lektury
- RICS, *Cost reporting* / NRM 1–3 (zarys).
- ICC URDG 758; ICC ISP98 (standby LCs) – przegląd.
- Polskie: ustawa Pzp art. 439, 464–465; KC art. 647¹, 649¹–649⁵, 357¹.
- Niemieckie: § 650f BGB; VOB/B § 17 (Sicherheitsleistung).

## Słownictwo
cost-value reconciliation – uzgodnienie kosztów i wartości – Soll-Ist-Vergleich / Arbeitskalkulation · contingency – rezerwa na ryzyko – Wagnis / Risikozuschlag · preliminaries – koszty ogólne budowy – Baustellengemeinkosten (BGK) · head office overheads – koszty zarządu – Allgemeine Geschäftskosten (AGK) · on-demand guarantee – gwarancja na pierwsze żądanie – Bürgschaft/Garantie auf erstes Anfordern · retention – kaucja/zatrzymanie – Sicherheitseinbehalt · price adjustment – waloryzacja – Preisgleitung · final account – rozliczenie końcowe – Schlussrechnung.
