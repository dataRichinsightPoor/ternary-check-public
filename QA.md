# QA inventory

## Numerical tests

Unit tests cover analytic isolated and overlapping sphere SASA, translation invariance, first-model parsing, alternate locations, zero occupancy, invalid input, real PDB parsing, chain rejection, cutoff monotonicity, exact equilibrium protein mass conservation, mass action, absent drug/E3/kpr, high-dose hook behavior, analytical washout recovery, E3/turnover sensitivity, bounded steady states and independence of the competing-clock diagnostic.

## Browser acceptance inventory

- Initial desktop view: loaded 5T35, visible 3D structure, real computed metrics, evidence limitations and usable controls.
- Structure inputs: example reload, four-character PDB validation, genuine remote fetch, local file upload, file drop, malformed and one-chain rejection.
- Analysis: alternate chain pair; same-chain rejection; cutoff, probe, threshold and sampling changes; worker loading and completed states.
- Viewer: cartoon/sticks cycle; lysine and ligand visibility cycles; reset; residue focus; camera download.
- Results: all/exposed filter; lysine, contact and sensitivity tabs; CSV download.
- Mechanism: default model; all scenario presets; edited valid inputs; invalid washout; save scenario; reset; heatmap inspection.
- Comparison: save structural snapshots; save mechanism scenarios; load scenario; remove; empty state.
- Exports: Markdown dossier, JSON session, structure CSV, kinetic CSV, snapshot PNG; JSON reimport recomputation; malformed JSON rejection.
- Navigation: all six pages; methods anchors; export dialog open/close; theme switch and return.
- Desktop and mobile visual checks: initial structure, mechanism, comparisons and methods, no unexpected horizontal viewport overflow.
- Privacy: inspect network requests; no structure upload endpoint; no analytics or browser storage.
- Article library: 88 unique case records and 14 source groups; keyword, mechanism and article filters; empty state; selection updates with filtering; 5 distinct illustrative calculators and their limiting cases; source links; expandable coverage; case and whole-library downloads; navigation into matching recruiter evidence; MZ1 shortcut reloads 5T35.
- E3 evidence: initial no-database state, disabled empty export and actionable import guidance; no request for a removed snapshot; live annotation without any import; synthetic fixture import and label; imported hash/counts; query, role and species filters; every component shortcut; forward/back pagination; no-match state; JSON export matches filter; live UniProt and invalid-query/no-result/network-failure states; valid TSV replacement and invalid/empty TSV rejection.
- New-page visual checks: desktop and 375px mobile examples and E3 evidence, dark/light, selected-case and expanded-annotation states. No unintended horizontal overflow or unreadable content.
- Adversarial checks: TSV HTML stripped and escaped; unusual species labels wrap; entering a query expression in live lookup is rejected before a network request.

## Explicit exclusions

No trained model accuracy, wet-lab validation, complete ubiquitination geometry, chemical bond/interaction classification, mmCIF parser, standalone PK prediction, molecular-glue or LOCKTAC model, or deployed production-public URL is claimed.

## Verification receipt · v0.2.0

Historical receipt below, not the v0.2.1 signoff. Current exact outcomes are in the versioned verification JSON. The v0.2.1 release adds four browser checks per edition, replaces copied database records with synthetic fixtures, and adds distribution and exact-commit checks. Visual review includes the new empty state at desktop and 375px mobile, then the populated synthetic-import state.

- 29 Node tests passed: numerical identities/limits, structure parsing, source-map integrity, database checksum and validation, query scope, and illustrative functions.
- 32 baseline Playwright checks passed: structure, mechanism, comparisons, local exports/reimport, genuine RCSB retrieval and responsive layouts.
- 162 article/database Playwright checks passed: all 88 case views, all article filters, component shortcuts, live UniProt annotation, error/no-match handling, valid/invalid database imports, evidence exports and 375px layouts.
- The same two browser suites passed with the self-contained HTML opened directly using `file://`; no install or local server was used.
- Independent Biopython surface check: 344.280 Å² from this implementation versus 345.713 Å² with Biopython at 960 points, matching selected atoms and radii. Relative difference 0.414%; tolerance 2%.
- Desktop dark/light and mobile screenshots were inspected. No unintended horizontal overflow, unreadable overlapping panels, or unhandled browser errors were found in the exercised states.
- Recorded application requests were GET only. Structure contents were not sent to external services; live lookups transmitted the requested PDB identifier or gene/accession.
- The hosted preview tool did not return a deployment result during this run. A tested self-contained HTML edition is available as the delivery fallback; no hosted URL is claimed.

Screenshots and machine-readable browser receipts are generated under `qa/`. Visual screenshots may show an intentionally triggered error toast from an immediately preceding negative test; this is not an unresolved error.
