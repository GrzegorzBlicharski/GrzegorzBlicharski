# THE FIRM — Learning Architecture

**Target profile:** an exceptionally strong practical lawyer — Polish-German commercial law, contracts, employment law, negotiation, sports & football — who can eventually **build, run and grow a specialist boutique firm**.

Every design decision answers one question: *does this materially contribute to that profile?* If yes, go deep. If no, teach only what broad professional competence needs.

> Status: **Chapters I and II are playable.** Everything else below is the designed roadmap. The data model lives in `js/curriculum.js` (tracks, tiers, stages, chapters, practice notes) so new chapters plug into the same system.

---

## 1. Depth follows the career target

| Tier | Tracks | Depth |
|---|---|---|
| **S — deepest mastery** | Contract law & drafting · Commercial / business law · Employment law · Negotiation · Polish-German cross-border practice · Sports law · Football law & business · Client advisory · Firm business development · Legal German as a working language | Recurs in almost every chapter; escalates to elite difficulty |
| **A — strong competence** | Civil law · civil procedure · company law · governance · compliance · competition · data protection · IP · real estate · construction · EU law · litigation strategy | Appears where a Tier-S matter needs it |
| **B — general competence** | Administrative law & procedure · constitutional law · criminal law & procedure | Occasional, contextual (e.g. a compliance scare, a regulator letter) |

Gameplay time is **not** split evenly across fields.

## 2. Teaching principles

1. **Advise, don't define.** The player is always acting for someone — employer or employee, buyer or seller, club or player. No quizzes of definitions.
2. **Contract architecture over clauses.** Risk must emerge from *interactions*: definitions × warranties × disclosure × caps × indemnities × termination × governing law. (Chapter I: §7.4 warranty × general disclosure × 5% cap.)
3. **Compare, don't memorise twice.** Polish approach vs German approach, side by side, in real matters.
4. **Consequences, not scores.** Mistakes surface later in the story (an epilogue, a client who stops calling, a claim that fails). Practice notes at chapter end name what was trained and what was missed — no permanent meters.
5. **Language and law reinforce each other.** German documents, German clients, German counsel. Assistance (glossaries, glosses) fades out chapter by chapter; from Berlin onward there is none.
6. **Pressure is part of the curriculum.** Time limits, partial information, a client who wants to sign, travel that interrupts review.

## 3. Source policy — never fabricate law

Every legal proposition shipped in the game must be traceable to a current authoritative source and re-checked before release:
- **Poland:** ISAP (Dziennik Ustaw consolidated texts) — KC, KSH, Kodeks pracy, KPC; Supreme Court / appellate case law where cited.
- **Germany:** gesetze-im-internet.de — BGB, HGB, GmbHG, KSchG, BetrVG, ArbZG, BUrlG, AGG, ArbGG; BAG / BGH decisions where cited.
- **EU / private international law:** EUR-Lex — Rome I, Brussels I bis, posting of workers.
- **Sport:** official FIFA, UEFA and PZPN regulations in their current editions (e.g. FIFA RSTP). Regulations are quoted or paraphrased only from the official text; the game never invents a rule.
- Fictional content is limited to **facts**: people, companies, clubs, deals, documents. Where a document is fictional (a lease, minutes), the legal mechanism it relies on must be real.
- Each chapter ships with a source sheet and a review checklist (statute, article, version date, reviewer).

## 4. Career stages

1. Legal foundations → 2. Junior commercial lawyer → 3. Contract / employment lawyer → 4. Polish-German cross-border lawyer → 5. Senior commercial negotiator → 6. Sports law specialist → 7. Football law & business specialist → 8. Counsel / head of practice → 9. Client originator / rainmaker → 10. **Founder of your own specialist firm.**

Stage changes are shown through the world, not a level-up screen: who calls you, which room you sit in, whether you follow the partner into a negotiation or lead it.

## 5. The tracks in detail

### Polish commercial law master track (Tier S)
B2B contracts, NDA, MSA, framework, service, supply, distribution, agency, licensing, SaaS where relevant, procurement, lease, shareholder matters, transaction documentation, M&A fundamentals, joint ventures, commercial disputes. Always taught as architecture: definitions, obligations, payment, acceptance, warranties, indemnities, liability & caps, exclusions, confidentiality, IP, term & termination, change control, force majeure, governing law, dispute resolution, boilerplate, schedules, side letters.

### Employment law (Tier S) — Poland first, then Germany
Poland: employment relationship and contract types, pay, working time, leave, duties, work regulations, remote work, equal treatment and discrimination, mobbing, discipline, termination and dismissal, protected employees, collective redundancies, managerial contracts, non-competes, confidentiality, employee IP, collective issues, disputes, evidence, litigation strategy.
Germany: Arbeitsvertrag, Arbeitszeit, Vergütung, Urlaub, Krankheit, Abmahnung, Kündigung and Kündigungsschutz, Betriebsrat, discrimination, representation, Arbeitsgericht practice.
Matters: dismissing an executive · discrimination claim · 80-position restructuring · confidentiality breach · key employee to a competitor · German company entering Poland · a club terminating its coach · a player employment dispute.

### German law — Deutsches-Recht track (Tier S via PL–DE)
BGB AT (Rechtsgeschäft, Willenserklärung, Vertrag, Vollmacht, Fristen, Verjährung), Schuldrecht (Leistungsstörungen, Schadensersatz, AGB), Kaufrecht, Dienst- and Werkvertrag; HGB (Kaufmann, Handelsgeschäfte, commercial representation); GmbH law (Geschäftsführer, Gesellschafter, decisions, representation); employment law as above.

### Poland ↔ Germany cross-border (signature system)
Every cross-border matter forces five questions: **Which law applies? Which court or tribunal? What does the contract actually say? What does EU law change? What differs in practice?** The player writes the comparison.

### Legal German
Mandantengespräch · Vertragsentwurf · Vertragsprüfung · Stellungnahme · rechtliche Analyse · Verhandlung · E-Mail · Telefonat · Besprechung. The goal is not to understand German but to **work as a lawyer in German**.

### Sports & football (Tier S)
Sports law as contract + employment + commercial + company + competition + IP + dispute resolution applied to sport, then specialised regulation. Football: player and coach contracts, transfers and loans, agents, image rights, sponsorship and naming rights, broadcasting, licensing, disciplinary matters, governance, dispute resolution. Later: a **multi-party negotiation engine** — player, agent, buying and selling club, sporting director, coach, legal, finance, sponsor — mixing law, money, sporting interest, personality and time pressure.

### Founder track (unlocks after substantial competence)
Client acquisition and retention, positioning and specialisation, networking and referrals, pricing (hourly, fixed, retainers, success fees only where permissible), engagement letters, conflict checks, intake, scope control, billing and collections, profitability, delegation, hiring, supervision, quality control, knowledge management, risk, professional responsibility, reputation.
**Economics** (revenue, cost, utilisation, realisation, margin, WIP, collections, client concentration, pipeline) appear as *decisions*, never as an accounting sim — e.g. *a client worth 30% of revenue demands another discount: keep them?*
**Endgame — found your firm:** name, positioning, practice areas, client profile, pricing, team, office, market. Fictional clients judge you on expertise, trust, price, speed, reputation and relationship. Not every client is good business.

## 6. Chapter roadmap

| # | Chapter | Where | Stage | Core tracks |
|---|---|---|---|---|
| I | **The Carbo Deal** *(playable)* | Gliwice → Wrocław | 1→2 | contracts, M&A fundamentals, football business, negotiation, PL–DE, legal German |
| II | **The Line Stops** *(playable)* | Gliwice ↔ Stuttgart | 2 | supply contract, quality dispute, applicable law & forum, German law, Vertragsprüfung |
| III | Eighty Positions | Gliwice · winter | 3 | Polish employment: restructuring, executive dismissal, protected employees |
| IV | Oder Crossing | Szczecin ↔ Berlin | 3 | cross-border employment, applicable law for employment contracts |
| V | Fair Trade | Poznań ↔ Berlin | 4 | distribution vs agency, termination, compensation |
| VI | No Translation | Berlin | 4 | working in German; GmbH; data |
| VII | Fog Terminal | Gdańsk ↔ Hamburg | 5 | logistics contracts, force majeure, termination under pressure |
| VIII | Rights Holder | Köln | 6 | media rights, sponsorship, image rights |
| IX | The Coach | Gliwice | 6 | coach termination: employment law meets football regulation |
| X | Transfer Window | Gliwice · Hamburg · München | 7 | multi-party transfer negotiation |
| XI | Midnight Signing | Frankfurt ↔ Bad Homburg | 8 | €240m deal, liability language, board advice |
| XII | Defend It | Heidelberg | 8 | oral defence of a position in German |
| XIII | Altitude | München → Garmisch-Partenkirchen | 9 | sports executive mandate, origination |
| XIV | Your Name on the Door | Gliwice | 10 | founding and running the boutique |

## 7. What Chapter I trains (implemented)
- Contract architecture: warranty × general disclosure × liability cap (§7.4 / Disclosure Letter / §9.1).
- Locked box and permitted leakage to related parties (§3.4).
- MAC clauses for sports assets — relegation and licensing (§1.1).
- Change of control in a municipal lease; condition precedent vs post-signing risk (§6.3 / lease §14.2).
- Reading Polish corporate records: supervisory board minutes, art. 377 KSH conflict of interest, KRS extract.
- Remedies in negotiation: specific indemnity, escrow, CP, price reduction, walk-away.
- Legal German: first written advice to a German in-house lawyer (register + substance); German client in negotiation.
- Forum choice in a PL–DE deal (German vs Polish arbitration institution).

## 8. What Chapter II trains (implemented)
- **Which law?** A choice of “German law” between two CISG states brings in the CISG unless expressly excluded (art. 6); BGB/HGB fill gaps.
- **Which court?** Conflicting forum clauses in both sides’ standard terms → likely no art. 25 agreement; Brussels I bis art. 4 (defendant’s domicile) and art. 7(1)(b) (place of delivery, fixed by FCA Gliwice; CJEU Car Trim C-381/08, Electrosteel C-87/10).
- **What does the contract say?** The QSV narrows incoming inspection, so the “late notice” defence is a trap; comparison of CISG arts. 38–39, HGB §377 and art. 563 §2 KC.
- **Liability architecture:** strict CISG liability (art. 79 exemption only) × contractual cap (§307 BGB check if a standard term; gross negligence carve-out) × the buyer’s own causal contribution (art. 80) × foreseeability of the OEM penalty (art. 74).
- **Engineering change control:** an ECN that waives re-sampling against a written warning.
- **Client advisory:** revenue concentration (41%) decides the strategy; never commit client money without instructions; no early reassurance.
- **Legal German, oral:** presenting a position to German opposing counsel; register (Frau Kollegin, kollegiale Grüße); arguments are only available if the supporting document was found.
- **Work product:** a Stellungnahme answering five questions, each cited to a document; the partner debriefs every miss on the flight.
