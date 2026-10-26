# 06 — Zmiany i roszczenia w praktyce (Variations & Claims Management)

**Poziom:** L2 · **Czas:** ~4 tygodnie

## Cel i efekty uczenia
- prowadzisz system zarządzania zmianami i roszczeniami na projekcie (rejestry, procedury, odpowiedzialności);
- piszesz Notice, Variation Proposal, fully detailed Claim i odpowiedzi na nie;
- wiesz, jakie dowody (contemporary records) zbierać i jak;
- wyceniasz zmiany i roszczenia kosztowe na podstawie stawek, kosztów i zysku;
- rozumiesz perspektywę Employera/Engineera (obrona przed roszczeniem).

---

## Lekcja 6.1 — Anatomia roszczenia

Każdy claim musi odpowiedzieć na 4 pytania:
1. **Fakty** – co się stało, kiedy, kto, dowody.
2. **Podstawa (entitlement)** – która klauzula / przepis daje prawo (kontraktowe: 1.9, 2.1, 4.12, 8.5, 13.3…; pozakontraktowe: odszkodowanie za naruszenie umowy, jeśli prawo właściwe pozwala).
3. **Przyczynowość (causation)** – jak zdarzenie spowodowało opóźnienie / koszt (moduł 07).
4. **Wysokość (quantum)** – ile dni, ile pieniędzy, wyliczone i udokumentowane.

Plus warunki formalne: **Notice w terminie, właściwy adresat, właściwa forma** (Cl. 1.3).

**Źródła roszczeń – najczęstsze kategorie:**
| Kategoria | Klauzule FIDIC 2017 (Red) | Zwykle |
|---|---|---|
| Zmiana zakresu (Variation) | 13.1, 13.3 | Wycena wg 12.3 + EoT |
| Opóźnione rysunki/instrukcje | 1.9 | EoT + Cost Plus Profit |
| Brak dostępu do placu | 2.1 | EoT + Cost Plus Profit |
| Nieprzewidywalne warunki fizyczne | 4.12 | EoT + Cost |
| Błędy w punktach odniesienia | 4.7 | EoT + Cost Plus Profit |
| Wykopaliska, znaleziska | 4.23 | EoT + Cost |
| Opóźnione testy przez Employera | 7.4, 10.3 | EoT + Cost Plus Profit |
| Wyjątkowo niekorzystna pogoda | 8.5 | EoT |
| Opóźnienia organów | 8.6 | EoT |
| Zawieszenie | 8.9–8.10 | EoT + Cost Plus Profit |
| Zmiana prawa | 13.6 | EoT + Cost |
| Ryzyka Employera (szkody w robotach) | 17.2 | EoT + Cost (lub Plus Profit) |
| Exceptional Events | 18.4 | EoT (+ Cost dla części zdarzeń) |
| Opóźnione płatności | 14.8 | Financing charges (bez notice) |

## Lekcja 6.2 — Notice: jak pisać

**Zasady:**
- Tytuł: „NOTICE OF CLAIM under Sub-Clause 20.2.1 [and Sub-Clause 4.12]” – oznaczenie jako Notice (1.3).
- Opis zdarzenia i data, kiedy strona się dowiedziała (lub powinna była).
- Wskazanie, że strona uważa się za uprawnioną do dodatkowej płatności i/lub EoT.
- **Nie musisz** podawać kwoty ani podstawy prawnej w Notice (w 2017 – podstawa w fully detailed Claim), ale warto ją wskazać.
- Bez emocji, bez przyznań („z naszej winy”), bez rezygnacji z praw.
- Wysyłka zgodnie z 1.3 (adres, sposób – często system CDE/Aconex), dowód doręczenia.
- **Lepiej za wcześnie niż za późno.** Przy wątpliwości – wysyłasz Notice „protective”.

Wzory: [szablony/](szablony/).

## Lekcja 6.3 — Contemporary records

Dowody prowadzone **w czasie zdarzenia**, nie odtwarzane później. Według wartości dowodowej:
1. Dzienniki budowy (site diaries), dziennik budowy (PL – ustawowy), Bautagebuch (DE).
2. Raporty dzienne: personel, sprzęt (w tym przestoje), pogoda, roboty wykonane.
3. Zdjęcia i filmy z datą i lokalizacją (geotag), drony.
4. Protokoły spotkań (minutes) – zatwierdzone przez strony.
5. Korespondencja (listy, e-maile, RFI, instrukcje).
6. Harmonogramy: baseline i aktualizacje (natywne pliki XER/MPP, nie PDF!).
7. Koszty: timesheets, faktury, raporty kosztowe, rejestr sprzętu.
8. Raporty z badań i testów, NCR.

**Zasada:** jeśli to nie zostało zapisane, to się nie wydarzyło. Twoja rola jako CA: zaprojektować system, w którym te dane powstają automatycznie (formularze dzienne, struktura folderów, konwencja nazewnicza, kody kosztowe per zdarzenie).

**Kod kosztowy dla zdarzenia (event cost code):** gdy tylko pojawia się zdarzenie – otwórz osobny kod kosztowy, żeby koszty zbierały się oddzielnie (np. „CE-014 Torf GPZ”). Bez tego quantum rozmywa się w kosztach ogólnych.

## Lekcja 6.4 — Rejestry (system zarządzania kontraktem)

| Rejestr | Kolumny (minimum) |
|---|---|
| Correspondence register | Nr, data, od/do, temat, typ (Notice/letter), odpowiedź wymagana do, status |
| Notice register | Nr, Sub-Clause, zdarzenie, data zdarzenia, data świadomości, termin (deadline), data wysłania, status |
| RFI register | Nr, pytanie, data, odpowiedź wymagana do, odpowiedź, wpływ na koszty/czas |
| Instruction register | Nr instrukcji, treść, czy Variation? (3.5), Notice wysłane? |
| Variation register | Nr, opis, źródło (instrukcja/propozycja), wycena złożona, wycena uzgodniona, EoT, status |
| Claims register | Nr, zdarzenie, Notice, termin fully detailed Claim, kwota, EoT, status 3.7, NOD, DAAB |
| Early warning / Risk register | Ryzyko, prawdopodobieństwo, wpływ, właściciel, działania |
| Payment register | Statement, data, kwota wnioskowana, IPC, kwota certyfikowana, płatność, opóźnienie |
| Contract deadlines calendar | Wszystkie terminy kontraktowe z alertami |

## Lekcja 6.5 — Wycena zmian (Variation valuation)

**Hierarchia metod (Red 12.3 / praktyka):**
1. Stawki z BoQ dla tej samej pracy w podobnych warunkach.
2. Stawki z BoQ jako podstawa (pro rata) dla podobnej pracy.
3. Nowa stawka: Cost + profit (rozsądny).
4. Daywork (13.5) – gdy nie da się zmierzyć.

**Budowa stawki (rate build-up):**
```
Robocizna (godziny × stawka z narzutami)
+ Sprzęt (godziny pracy × stawka; przestój – stawka obniżona)
+ Materiały (ilość × cena + odpady + transport)
+ Podwykonawcy
= Koszty bezpośrednie
+ Koszty ogólne budowy (site overheads) – % lub wyliczone czasowo
+ Koszty zarządu (head office overheads) – %
+ Zysk – %
+ Ryzyko (jeśli przewidziane)
= Stawka
```
**Wpływ na czas:** zmiana to nie tylko koszt robót – może wydłużyć projekt → koszty czasowe (prolongation, moduł 07). Zawsze wyceniaj **pełny wpływ** (full and final effect) albo wyraźnie zastrzeż prawo do roszczeń o skutki pośrednie (reservation of rights).

**Skutki zakłóceń (disruption):** zmiana może obniżyć wydajność pracy na innych robotach – osobny claim (moduł 07).

## Lekcja 6.6 — Fully detailed Claim: struktura dokumentu
1. Executive Summary (zdarzenie, podstawa, żądanie – 1 strona).
2. Wprowadzenie i opis kontraktu (dane, klauzule).
3. Chronologia faktów z odwołaniami do dowodów (appendix numbers).
4. Podstawa umowna (entitlement) – analiza klauzul, warunki formalne (Notice w terminie).
5. Analiza opóźnień (delay analysis) – metoda, wynik, EoT żądane.
6. Quantum – metoda, wyliczenia, dowody kosztów.
7. Podsumowanie żądań.
8. Załączniki: korespondencja, raporty dzienne, harmonogramy, zdjęcia, faktury, obliczenia.

**Styl:** rzeczowo, chronologicznie, każdy fakt z przypisem do dowodu; claim czyta Engineer, potem DAAB, potem arbiter – pisz dla arbitra.

## Lekcja 6.7 — Perspektywa Employera / Engineera: obrona
Checklist oceny roszczenia:
1. Czy Notice złożono w terminie i prawidłowo (1.3, 20.2.1)? Czy fully detailed Claim w 84 dni z podstawą prawną?
2. Czy zdarzenie mieści się w podstawie umownej (np. czy warunki gruntowe naprawdę były „Unforeseeable”)?
3. Czy zdarzenie spowodowało opóźnienie na ścieżce krytycznej? Czy był float? Czy było concurrent delay wykonawcy?
4. Czy koszty są faktycznie poniesione, rozsądne i spowodowane zdarzeniem? Podwójne liczenie (np. koszty ogólne w stawce zmiany i w prolongation)?
5. Czy wykonawca ograniczał szkodę (mitigation)? Czy dał Advance Warning (8.4)?
6. Kontr-roszczenia: Delay Damages, koszty usunięcia wad, potrącenia.

## Lekcja 6.8 — Zarządzanie zmianami „miękko”
- **Instrukcje ustne** – potwierdź na piśmie (Confirmation of Verbal Instruction); w FIDIC 2017 instrukcja musi być pisemna (3.5).
- **Ukryte zmiany** (instrukcja nie nazwana Variation, ale zmieniająca zakres) – 3.5: wykonawca niezwłocznie (przed rozpoczęciem pracy) daje Notice z uzasadnieniem; Engineer w 7 dni potwierdza, zmienia lub odwołuje instrukcję – brak reakcji = instrukcja odwołana.
- **Odmowa wykonania zmiany** – zwykle niedopuszczalna; wykonaj i zgłoś claim (zasada „comply and claim”).
- **Global settlement** – na koniec projektu strony często zamykają wszystkie roszczenia pakietem; Twoja siła negocjacyjna zależy od jakości dokumentacji każdego roszczenia.

---

## Praktyka
1. **Produkt:** Komplet rejestrów (Excel) – z formułami terminów (np. deadline = data świadomości + 28).
2. **Drafting:** 3 Notices of Claim (4.12 grunt; 2.1 brak dostępu; 8.5 pogoda) i 1 Variation Proposal (13.3.2).
3. **Case study „Kable SN” (6 stron):** Employer zmienił trasę kabli SN na farmie onshore (nowe przewierty HDD pod rzeką). Przygotuj fully detailed Claim: entitlement, wycena, uproszczona analiza czasu.
4. **Rola odwrócona:** jako Engineer oceń claim kolegi (lub przykładowy od mentora) i wydaj determinację 3.7.

## Pytania kontrolne
1. Jakie 4 elementy musi wykazać każdy claim?
2. Engineer ustnie polecił dodatkowe zbrojenie. Co robisz?
3. Dlaczego otwiera się osobny kod kosztowy dla zdarzenia?
4. Czym jest „double recovery” i gdzie najczęściej występuje?
5. Wykonawca uważa, że instrukcja Engineera jest w istocie Variation. Jaka jest procedura w FIDIC 2017?

<details><summary>Odpowiedzi</summary>

1. Fakty, podstawa (entitlement), przyczynowość, wysokość (+ spełnienie wymogów formalnych).
2. Pisemne potwierdzenie (Confirmation of Verbal Instruction) z prośbą o pisemną instrukcję; jeśli to zmiana – Notice wg 3.5 i/lub 20.2.1; dokumentacja kosztów pod osobnym kodem.
3. Żeby wykazać faktyczne koszty spowodowane zdarzeniem, oddzielone od kosztów bazowych.
4. Odzyskanie tych samych kosztów dwa razy, np. koszty ogólne budowy w stawce zmiany i w roszczeniu o prolongation za ten sam okres.
5. 3.5: Notice do Engineera niezwłocznie, przed rozpoczęciem pracy, z uzasadnieniem; Engineer w 7 dni potwierdza, zmienia lub odwołuje; brak odpowiedzi = odwołanie instrukcji. Jeśli potwierdzona i wykonawca nadal uważa, że to zmiana – claim.
</details>

## Lektury
- FIDIC 2017 Cl. 3.5, 12, 13, 20 (ponownie, szczegółowo).
- SCL Protocol – Core Principles o dokumentacji i harmonogramie.
- Kapellmann/Schiffers (DE) – rozdziały o Nachträge (dla porównania).

## Słownictwo
variation – zmiana – Nachtrag / Leistungsänderung · claim – roszczenie – Anspruch / Nachtragsforderung · contemporary records – dokumentacja bieżąca – zeitnahe Dokumentation · site diary – dziennik budowy – Bautagebuch · quantum – wysokość roszczenia – Anspruchshöhe · entitlement – podstawa roszczenia – Anspruchsgrundlage · reservation of rights – zastrzeżenie praw – Vorbehalt · mitigation – ograniczanie szkody – Schadensminderung.
