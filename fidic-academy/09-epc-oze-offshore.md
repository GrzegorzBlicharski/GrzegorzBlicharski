# 09 — EPC, OZE i offshore: kontrakty dla energetyki

**Poziom:** L3 · **Czas:** ~6 tygodni

## Cel i efekty uczenia
- rozumiesz strukturę kontraktową projektów energetycznych finansowanych w formule project finance;
- negocjujesz kluczowe klauzule EPC: LDs, caps, gwarancje, testy, wyłączenia;
- zarządzasz interfejsami w multi-contracting (onshore i offshore);
- znasz NEC4 i LOGIC na poziomie pozwalającym pracować z nimi w zespołach międzynarodowych.

---

## Lekcja 9.1 — Project finance i bankowalność

**Struktura:** SPV (spółka celowa) → Sponsors (equity) + Lenders (dług, 70–80%) → kontrakty: EPC/TSA/BOP, O&M/SMA, PPA/CfD, umowa przyłączeniowa, dzierżawy, ubezpieczenia.

**Bankowalny kontrakt EPC (bankability) – czego chcą banki:**
| Wymóg | Dlaczego |
|---|---|
| Jeden odpowiedzialny wykonawca (single point responsibility) lub szczelny wrap | Ryzyko interfejsów nie zostaje w SPV |
| Stała cena, stała data | Model finansowy |
| Delay LDs ≥ koszt obsługi długu + stałe koszty w okresie opóźnienia | Pokrycie debt service |
| Performance LDs = NPV utraconych przychodów | Pokrycie spadku wydajności |
| Odpowiednie caps (typowo: delay LDs 10–20%, performance LDs 10–20%, łącznie 20–30%, całość 100% ceny) | Kompromis z wykonawcą |
| Zabezpieczenia: performance bond, PCG, warranty bond | Kredyt wykonawcy |
| Direct Agreements (step-in rights banków) | Banki mogą przejąć kontrakt przy upadku SPV |
| Assignment kontraktu na rzecz banków (security) | |
| Ograniczone podstawy EoT i zmian ceny | Pewność |
| LTA (Lenders' Technical Advisor) – przegląd i certyfikacja kamieni milowych | Kontrola banków |

**Wrap:** gdy Owner kontraktuje osobno (multi-contract), banki mogą wymagać, by jeden podmiot „opakował” (wrap) odpowiedzialność innych – kosztowne; alternatywa: silny zespół Ownera + contingency + interface agreement.

## Lekcja 9.2 — Kluczowe klauzule EPC

**Liquidated Damages:**
- **Delay LDs** – stawka dzienna/tygodniowa; często etapowe (per WTG, per MW); wyłączny środek za opóźnienie (exclusive remedy) – wykonawca chce, by LDs były jedynym środkiem; Owner chce prawa do termination po osiągnięciu capu.
- **Performance LDs** – za każdy % braku mocy/sprawności; **minimum performance level** – poniżej Owner może odrzucić.
- **Charakter prawny:** w common law LDs muszą być „genuine pre-estimate” lub chronić uzasadniony interes (*Cavendish v Makdessi* [2015] UKSC 67 – test „legitimate interest”, nie „penalty”). W PL – kara umowna (art. 483–484 KC), miarkowanie (484 §2); brak szkody nie zwalnia z kary (uchwała SN III CZP 61/03), ale może prowadzić do miarkowania. W DE – Vertragsstrafe (§§ 339 ff. BGB), w AGB limit ok. 5% ceny łącznie i ok. 0,2–0,3% dziennie (orzecznictwo BGH).

**Limitation of liability:** cap łączny (np. 100% ceny), wyłączenie consequential loss (definicja kluczowa! – w Anglii *Hadley v Baxendale* druga gałąź; precyzyjnie wymieniaj: loss of profit, loss of revenue, loss of use…), wyjątki od capu (fraud, wilful misconduct, gross negligence, third-party IP indemnity, ubezpieczone straty).

**Testy i odbiory w EPC energetycznym:**
```
Mechanical Completion → Commissioning → Reliability Run (np. 72–720 h) → Performance Tests
→ Provisional Acceptance (PAC) / Taking Over → Warranty Period (2–5 lat) → Final Acceptance (FAC)
```

**Change in law, permits, grid:** kto ryzykuje zmiany kodeksu sieci, wymogów środowiskowych, opóźnienia OSP/OSD.

**Suspension/termination:** termination for convenience Ownera (koszty + rozsądny zysk), termination for cause, cap LDs reached → termination.

**Warranties:** okres gwarancyjny 2–5 lat, serial defect clause (wada seryjna – np. w ≥ 20% komponentów jednego typu → wymiana prewencyjna we wszystkich), latent defects.

## Lekcja 9.3 — Wiatr onshore: TSA + BOP

| Kontrakt | Kluczowe kwestie |
|---|---|
| **TSA** (Turbine Supply Agreement) | Cena za MW, harmonogram dostaw, LDs za opóźnienie per WTG, power curve guarantee, noise, certyfikaty typu (IEC 61400-22/IECRE), wymagania wobec fundamentów i dróg (interface specs), prawa do dostępu, przejście ryzyka (Incoterms DAP/DDP), Taking Over per WTG |
| **SMA / LTSA** | Availability guarantee (czasowa lub energetyczna), bonus/malus, wyłączenia (siła wyższa, sieć, oblodzenie), części zamienne, zakończenie i przekazanie |
| **BOP** (FIDIC Yellow lub bespoke) | Projekt i budowa dróg, placów, fundamentów (wg specyfikacji obciążeń od dostawcy WTG), kable SN, GPZ; interfejsy z TSA |

**Interfejsy TSA–BOP (do Interface Matrix):** gotowość fundamentu (Foundation Ready Date), nośność dróg i placów (Access Ready Date), dostępność zasilania (Energization Date), dane od dostawcy turbin do projektu fundamentu (Load Specification), koordynacja HSE na placu, kolejność montażu.

## Lekcja 9.4 — Wiatr offshore: multi-contracting

**Typowe pakiety:** (1) WTG Supply & Installation; (2) Foundations – fabrication; (3) Foundations – T&I; (4) Inter-array cables supply & installation; (5) Export cables; (6) OSS – topside & jacket; (7) Onshore substation; (8) Port, logistics; (9) Surveys, UXO clearance; (10) O&M.

**Wzory umów:** bespoke na bazie FIDIC Yellow/Silver; **LOGIC** (UK, offshore oil & gas – często adaptowany: marine construction); **BIMCO SUPPLYTIME/WINDTIME** (czartery statków); **IMCA**.

**Knock-for-knock (mutual hold harmless):** każda strona odpowiada za własne mienie i ludzi niezależnie od winy – standard offshore (LOGIC, BIMCO). Przy wielu wykonawcach – **Mutual Indemnity Agreement / Deed** między wszystkimi wykonawcami na projekcie.

**Ryzyka specyficzne:**
| Ryzyko | Typowa alokacja / mechanizm |
|---|---|
| Weather downtime | Próg (np. statystyki P50/P75 z metocean study); powyżej – Owner płaci stawkę dzienną (weather standby rate) |
| Warunki gruntowe dna | Owner dostarcza dane; GBR lub podział ryzyka; pile refusal procedure |
| UXO | Owner – survey i clearance; wykonawca – procedura przy odkryciu |
| Dostępność statku | Wykonawca; LDs; zastępczy statek |
| Opóźnienie pakietu poprzedzającego | Owner wobec następnego wykonawcy (standby + EoT) |
| Uszkodzenie kabli | Ubezpieczenie CAR (z LEG), knock-for-knock, odpowiedzialność za kable innych wykonawców |
| Środowisko (hałas przy palowaniu, okresy ochronne) | Wymagania pozwoleń – jako Employer's Requirements |
| Local content | Wymogi zamawiającego (w PL – element CfD / polityki) |

**Owner jako integrator:** zespół Ownera zarządza interface register, master schedule (integracja harmonogramów wszystkich pakietów), SIMOPS, wspólnymi zasobami (port, statki serwisowe), koordynacją HSE i Marine Coordination Centre.

## Lekcja 9.5 — Przemysł i instalacje technologiczne
- **Licencja technologiczna (licensor)** + **EPC** – gwarancje procesowe od licencjodawcy vs wykonania od EPC; luka gwarancyjna (kto odpowiada, gdy instalacja nie osiąga parametrów: proces czy wykonanie?).
- **Open book / OBE (open book estimate) → conversion to lump sum** – faza FEED na koszt plus, następnie przejście na ryczałt.
- **Reimbursable EPC** z target cost i incentive fee.
- **Owner Furnished Equipment (OFE)** – urządzenia dostarczane przez Ownera; ryzyko opóźnień i wad OFE.

## Lekcja 9.6 — NEC4 Engineering and Construction Contract (ECC) – dla porównania
| Element | NEC4 | FIDIC |
|---|---|---|
| Filozofia | Zarządzanie projektem, współpraca („mutual trust and co-operation”) | Alokacja ryzyka i procedury |
| Administrator | Project Manager (działa za Clienta), Supervisor | Engineer |
| Zmiany i roszczenia | **Compensation Events (CE)** – jedna procedura; Notice w 8 tyg. (time bar) | Variations + Claims |
| Wycena CE | Prospektywna: wpływ na Defined Cost + Fee, z ryzykiem | Retrospektywna/prospektywna |
| Programme | **Accepted Programme** – centralne narzędzie, odrzucenie = CE | 8.3 |
| Early Warning | Rozbudowane, Early Warning Register | 8.4 |
| Opcje płatności | A (lump sum activity schedule), B (BoQ), C (target, activity schedule), D (target, BoQ), E (cost reimbursable), F (management) | Red/Yellow/Silver |
| Spory | W zależności od opcji: Adjudicator (UK – ustawowa adjudication) / Dispute Avoidance Board | DAAB |

W UK, w części projektów offshore i u niektórych inwestorów (np. sieci) NEC4 jest standardem – warto znać.

## Lekcja 9.7 — Interface Management
**Interface Register / Matrix:** ID | pakiet A | pakiet B | opis (fizyczny/funkcjonalny/organizacyjny) | wymagany termin (Need Date) | odpowiedzialny | status | dokumenty (ICD – Interface Control Document).

**Kontraktowe zakotwiczenie:** obowiązki współpracy w każdym kontrakcie, terminy dostarczenia informacji, procedura sporu interfejsowego, Need Dates jako kamienie milowe Ownera (opóźnienie = EoT dla wykonawcy B), prawo Ownera do przeniesienia kosztu na wykonawcę A (back-charge).

---

## Praktyka
1. **Mapa interfejsów** dla farmy offshore (10 pakietów): min. 30 interfejsów z Need Dates.
2. **Negocjacje EPC:** dostaniesz term sheet EPC (BESS 100 MW / 200 MWh). Przygotuj markup jako (a) doradca Ownera, (b) doradca wykonawcy; lista kompromisów.
3. **LDs:** wylicz stawkę delay LDs z modelu finansowego (przychody dzienne, odsetki, koszty stałe) i oceń cap.
4. **Case:** monopile refusal na 12 lokalizacjach – kto ponosi koszty dodatkowego drilling? Analiza na podstawie wzorcowych klauzul.

## Pytania kontrolne
1. Co oznacza „bankowalny” kontrakt EPC?
2. Na czym polega knock-for-knock?
3. Dlaczego w multi-contracting Owner ponosi ryzyko interfejsów?
4. Czym różni się Compensation Event w NEC4 od claimu w FIDIC?
5. Dlaczego definicja consequential loss jest kluczowa?

<details><summary>Odpowiedzi</summary>

1. Akceptowalny dla banków finansujących: pewność ceny i terminu, LDs pokrywające debt service, odpowiednie zabezpieczenia, single point responsibility, direct agreements i step-in rights.
2. Każda strona ponosi szkody własnego mienia i personelu niezależnie od winy i zwalnia (indemnifies) drugą; upraszcza ubezpieczenia i eliminuje spory o winę.
3. Owner zobowiązuje się wobec każdego wykonawcy do dostarczenia danych/dostępu/gotowości poprzedzających pakietów; opóźnienie A powoduje roszczenia B wobec Ownera.
4. CE to jedna procedura zmian i zdarzeń ryzyka Clienta, wyceniana prospektywnie; FIDIC rozdziela Variations i Claims oraz częściej wycenia retrospektywnie.
5. Wyłączenie consequential loss bez definicji może (np. w Anglii) nie objąć bezpośrednio wynikających utraconych przychodów – a to największe ryzyko w energetyce.
</details>

## Lektury
- E. R. Yescombe, *Principles of Project Finance*; S. L. Hoffman, *The Law and Business of International Project Finance* – rozdziały o EPC.
- NEC4 ECC – Core Clauses 1–9 (lektura porównawcza).
- LOGIC Marine Construction (wersja 2) – Section I.
- *Cavendish Square v Makdessi* [2015] UKSC 67; *MT Højgaard v E.ON* [2017] UKSC 59.
- WindEurope / RenewableUK – raporty o modelach kontraktowania offshore.

## Słownictwo
project finance – finansowanie projektowe – Projektfinanzierung · special purpose vehicle – spółka celowa – Projektgesellschaft · step-in rights – prawo wstąpienia – Eintrittsrechte · liquidated damages – zryczałtowane odszkodowanie / kary umowne – pauschalierter Schadensersatz / Vertragsstrafe · performance guarantee – gwarancja parametrów – Leistungsgarantie · interface – interfejs / styk – Schnittstelle · knock-for-knock – wzajemne zwolnienie z odpowiedzialności – wechselseitige Haftungsfreistellung · serial defect – wada seryjna – Serienschaden / Serienmangel.
