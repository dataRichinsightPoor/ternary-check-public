# Ternary Check

A browser workbench for asking what a degrader result actually establishes. Version 0.2.4 combines structural measurements, inspectable models, your article examples and source-linked E3 evidence without turning them into an unsupported efficacy score.

## Open the app

Open the [public browser tool](https://datarichinsightpoor.github.io/ternary-check-public/), or download **Ternary-Check-v0.2.4.html** from the [GitHub release](https://github.com/dataRichinsightPoor/ternary-check-public/releases/tag/v0.2.4) and open it in a current desktop browser, preferably Chrome or Edge. The download is a self-contained application, not a source-code fragment, and needs no installation or local server.

The molecular viewer, example coordinates, calculations and article library are embedded. No third-party interaction database is bundled. Internet access is needed for optional RCSB/UniProt lookups, source links and external fonts; local PDB files are not uploaded.

## A useful first pass

- **Examples:** Search a compound, target or recruiter. Each case separates its evidence from what it does not establish and offers an explicitly hypothetical calculation.
- **E3 evidence:** Use component guidance and live reviewed-human UniProt annotations immediately. For interaction records, open the official UbiBrowser download, obtain the known E3 TSV under its applicable terms, and import it locally. Then search by component or substrate, filter species and inspect original references.
- **Structure audit:** Begin with the bundled BRD4–MZ1–VHL complex, select chains, change the sampling or contact rule and inspect how the result changes.
- **Mechanism lab:** Vary E3 abundance, cooperativity, turnover, productive clearance and free intracellular exposure. Read the equations before assigning meaning to the curves.
- **Compare and Export:** Save assumption snapshots, export evidence or a case note, and save session JSON before closing the tab. Session files include coordinates, so review them before sharing.

## Article coverage

The current library contains 88 case records across 14 retrieved articles, posts and archive drafts. It includes degraders, relevant controls, mechanistic comparators and marked primary-paper extensions; some records group several named compounds. It is not a claim that every installment of Data-Rich, Insight-Poor has been recovered.

Examples span the [degradability-landscape article](https://www.linkedin.com/pulse/from-degradation-curves-degradability-landscapes-making-damko-qwkue), [SuFEx glue discovery](https://www.linkedin.com/pulse/high-throughput-sufex-glues-hard-part-turning-screens-ermelinda-damko-6epwe), [KAT2A recruitment](https://www.linkedin.com/pulse/beyond-degron-how-non-canonical-crbn-recruitment-could-damko-bh0se), [SMARCA2/4 ligase switching](https://www.linkedin.com/pulse/programming-ligase-choice-smarca24-molecular-glues-ermelinda-damko-9lzpe), [heme–BACH1 compartment biology](https://www.linkedin.com/pulse/when-molecular-glues-learn-geography-heme-bach1-aml-ermelinda-damko-i3rbe), and [EndoTag routing](https://www.linkedin.com/pulse/endotags-new-design-logic-extracellular-degradation-ermelinda-damko-fhs5e). The in-app coverage panel identifies the complete retrieved set and flags archive-only entries.

## Database connection

The app connects to UbiBrowser through its [official known-interaction download](http://ubibrowser.bio-it.cn/ubibrowser_v3/Public/download/literature/literature.E3.txt) and a browser-local importer rather than redistributing the provider's database. No database loaded is different from no matching records. Imported records receive a SHA-256 fingerprint and stay in memory until the tab closes or reloads; reimport to resume.

The live annotation lookup uses [UniProt](https://www.uniprot.org/uniprotkb/Q96SW2/entry). Annotation and curated interaction evidence do not establish cellular abundance, accessible ligase pools, degrader compatibility or comparative efficacy.

## Scientific boundary

This edition is a structural audit and conditional model, not a trained degradation predictor. It does not infer cellular DC50, linker entropy, ubiquitination competence, or an E3 ranking from an uploaded structure, and its starting kinetic values are illustrative rather than measured compound parameters.

The 5T35 pair is a useful structural reference, but not a complete E2–ubiquitin–cullin machinery model ([RCSB 5T35](https://www.rcsb.org/structure/5T35)). Surface-exposed lysines and close contacts should therefore be treated as measurements under stated rules, not proof of productive ubiquitination.

## Verification

The versioned release includes its own numerical, browser and independent surface/kinetics-check receipts. Database tests use explicitly synthetic software-test records, not experimental evidence; neither successful tests nor numerical agreement establish biological predictive accuracy.

Original project material is MIT licensed; third-party material retains its own terms. Use the standalone HTML or hosted tool. The [public source repository](https://github.com/dataRichinsightPoor/ternary-check-public) has fresh history and excludes the old private database snapshot. The [illustrated companion article](https://ternary-check-ccxxxix.pplx.app) includes the model equations, figures, video and a practical walkthrough.
