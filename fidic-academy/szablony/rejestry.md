# Rejestry administracji kontraktu – specyfikacja kolumn (do Excela / SharePoint)

Każdy rejestr: jeden arkusz, tabela z filtrami, kolumna statusu z formatowaniem warunkowym, data deadline liczona formułą.

## 1. Notice Register
| Kolumna | Opis / formuła |
|---|---|
| Notice No. | NOC-001 … |
| Sub-Clause | 20.2.1 / 4.12 / 18.2 / 8.4 / 3.5 … |
| Event description | krótko |
| Event date | |
| Awareness date | kiedy strona dowiedziała się lub powinna była |
| Deadline | `=AwarenessDate+28` (20.2.1) / `+14` (18.2) |
| Date sent | |
| Days remaining | `=Deadline-TODAY()` |
| Status | Draft / Sent / Late / Acknowledged |
| Engineer's 14-day response deadline | `=DateSent+14` |
| Linked Claim No. | |

## 2. Claims Register
| Kolumna | Opis |
|---|---|
| Claim No., Title | |
| Notice ref., date | |
| Fully detailed Claim deadline | `=AwarenessDate+84` |
| FDC submitted (date) | |
| EoT claimed (days) / awarded | |
| Amount claimed / determined / agreed | |
| 3.7 agreement deadline | `=FDCdate+42` |
| Determination deadline | `=FDCdate+84` |
| NOD deadline | `=DeterminationDate+28` |
| DAAB referral deadline | `=NODdate+42` |
| Probability (%) / expected value | do CVR |
| Status | |

## 3. Variation Register
Nr | Źródło (instrukcja/RfP/VE) | Data | Opis | Wycena złożona | Wycena uzgodniona | EoT | Wpływ na gwarancje | Status | Kod kosztowy

## 4. RFI Register
Nr | Data | Temat | Pytanie | Wymagana odpowiedź do | Odpowiedź (data, ref.) | Wpływ (czas/koszt) | Notice potrzebne? (1.9)

## 5. Instruction Register
Nr | Data | Od kogo | Treść | Pisemna? | Potwierdzenie (CVI) | Czy Variation? | Notice 3.5 wysłane | Status

## 6. Correspondence Register
Ref. | Data | Od / Do | Temat | Typ (Notice / letter / e-mail) | Wymaga odpowiedzi do | Odpowiedź ref. | Plik

## 7. Payment Register
Statement No. | Okres | Data złożenia | Kwota wnioskowana | IPC deadline (`+28`) | IPC data / kwota | Payment deadline (`Statement+56`) | Data zapłaty | Dni opóźnienia | Financing charges (14.8)

## 8. Contract Deadlines Calendar
Wydarzenie | Klauzula | Data bazowa | Liczba dni | Termin | Odpowiedzialny | Przypomnienie (−7 d)
Przykłady: Performance Security (LoA +28), DAAB (LoA +28), Programme (Commencement +28), Statement at Completion (TOC +84), Draft Final Statement (PC +56).

## 9. Risk & Early Warning Register
ID | Ryzyko | Kategoria | Prawdopodobieństwo (1–5) | Wpływ (1–5) | Ocena | EMV | Właściciel | Działania | Advance Warning (8.4) wysłane | Status

## 10. Interface Register (multi-contract)
ID | Pakiet A | Pakiet B | Typ (fizyczny/funkcjonalny/informacyjny) | Opis | Need Date | Odpowiedzialny | ICD ref. | Status | Ryzyko roszczenia
