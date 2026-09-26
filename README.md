# Ternary Check

A local-first structural audit, article case library and conditional mechanism workbench for targeted protein degradation. Version 0.2.4 turns questions from Data-Rich, Insight-Poor into inspectable calculations, without claiming that a static structure predicts cellular efficacy.

## What is implemented

- Browser-local PDB parsing, public RCSB fetching and a bundled 5T35 example.
- Interactive 3Dmol.js molecular viewer, target lysine display, residue focus and PNG snapshots.
- Worker-based Shrake–Rupley-style SASA, protein-pair interface burial, terminal lysine nitrogen exposure, residue proximity pairs, overlap flags and distance-cutoff sensitivity.
- Independent rapid-equilibrium PROTAC mechanism model with target and E3 mass conservation, binary competition, cooperativity, constant synthesis, basal turnover, lumped productive clearance, fixed free intracellular exposure and ideal washout.
- Dose sweeps, target time courses, a Kd/kpr landscape, and a separate two-hazard commitment-versus-dissociation diagnostic.
- In-memory run comparison, local CSV/Markdown/JSON exports, input-session reimport and methods with explicit equations and citations.
- An 88-record case library across 14 retrieved articles, posts and archive drafts, including named degraders, controls, comparators and explicitly labeled primary-paper extensions. Case notes separate experimental evidence, article-only claims, source conflicts and hypothetical calculations.
- Five reduced illustrations: competing commitment/dissociation clocks, localization-limited E3 availability, reporter amplification, lysosomal routing versus recycling, and turnover after synthesis arrest. These are not fitted compound models.
- UbiBrowser known-interaction connection through provider links and local TSV import, with SHA-256, species/role filters, source records, component-identity guidance and exports. No provider dataset is bundled.
- On-request live reviewed-human UniProt annotation lookup. Only the entered symbol/accession is sent; this is not quantitative expression data.
- No classifier, automatic E3 efficacy ranking, structure-derived affinity, predicted cellular DC50, or fitted real-compound parameters.

## Run

```sh
npm install
npm run dev
npm test
npm run build
```

Original project code and documentation are MIT licensed. Third-party software, data and linked material keep their own terms. Version 0.2.4 is the first clean-history public research-prototype release; see `RELEASE-NOTES.md`, `CHANGELOG.md`, `CITATION.cff` and `THIRD-PARTY-NOTICES.md`.

Open the [hosted tool](https://datarichinsightpoor.github.io/ternary-check-public/), inspect the [public source](https://github.com/dataRichinsightPoor/ternary-check-public), or download the [versioned release](https://github.com/dataRichinsightPoor/ternary-check-public/releases/tag/v0.2.4). Read [The Complex Is Not the Reaction, CCXXXIX](https://ternary-check-ccxxxix.pplx.app) for the illustrated mechanistic companion.

The build output is `dist/`. There is no backend, analytics, upload route, persistence, or browser storage. The vendored 3Dmol.js build and license are in `public/vendor`. External font requests occur on page load; public PDB retrieval contacts RCSB only when requested. UniProt receives the requested gene/accession only when the lookup button is used. Following external source links opens their respective providers. Local structure contents are never sent to a server by this app.

`npm run portable` additionally produces a self-contained `portable/Ternary-Check.html` containing code, worker, 3D viewer, public example coordinates and license notices. Download it and open it in a current desktop browser; no installation is needed. Internet access is required only for external fonts, optional RCSB/UniProt requests and source links. The portable build intercepts only the embedded example PDB request; it does not proxy remote services. Database imports remain in browser memory and are discarded on reload.

## Coverage and database boundaries

The library covers the retrieved corpus, not a certified complete archive of every installment. Named compounds can be grouped with their controls when discussed as a comparison. Generic classes remain generic. Two archive articles have no confirmed public article URL; several cases are article-only or supported by preprints. Source conflicts are flagged rather than converted into quantitative presets.

Obtain [UbiBrowser's known-interaction download](http://ubibrowser.bio-it.cn/ubibrowser_v3/Public/download/literature/literature.E3.txt) directly from the provider under its applicable terms, then import it locally. No redistribution grant was established from the provider pages reviewed on 2026-09-26 UTC, so this release contains no copied interaction records. The upstream endpoint is HTTP; the app does not proxy it. Imported files are schema-validated, not biologically verified, and import time does not establish evidence currency. [Database definitions](http://ubibrowser.bio-it.cn/ubibrowser_v3/home/document/index) and source records should be inspected before interpretation.

This public repository starts from a clean source snapshot with no inherited Git history or old release assets. The separate original repository remains private because its historical v0.2.0 data snapshot was not cleared for redistribution. No provider interaction data is included here.

Known interactions include varied biological and experimental contexts. They are not an efficacy ranking or a complete recruiter catalog; a missing result cannot exclude induced recruitment. Substrate receptors, adaptors, scaffolds and RING catalytic components have distinct roles.

## Verification

`npm test` runs numerical, limiting-case, parser, library, evidence and release-metadata checks. `npm run build` creates the browser bundle. Run `npx playwright install chromium`, then `node tests/browser-qa.mjs`, `node tests/library-qa.mjs` and `node tests/worker-qa.mjs` from the project root for browser acceptance checks against `dist/`; they serve local files through request interception and leave external RCSB and UniProt requests real except explicitly marked failure cases. `python -m pip install -r requirements-test.txt` installs pinned Biopython and SciPy dependencies. `python tests/crosscheck.py` cross-checks SASA on the same selected atom records. `python tests/kinetics-crosscheck.py` compares 100 continuous and 100 pulse trajectories against independent DOP853 integration and exact post-washout recovery.

GitHub Actions runs numerical tests, builds the portable edition and performs the independent SASA and kinetics cross-checks on pushes and pull requests. Network-dependent browser checks are a separate manual workflow option so upstream availability is not confused with deterministic numerical verification.

To prepare release assets locally, install the test dependencies and Chromium, run `npm run portable` to refresh notices, commit source changes, then run `npm run verify:release` and `npm run release:package`. Packaging requires a clean working tree, verification of that exact commit, passing receipts for both browser editions, independent surface and kinetics checks, and the no-database-redistribution guard. It writes versioned HTML, source and site archives, a commit-linked verification receipt, project/dependency notices and SHA-256 checksums under `release/v0.2.4/`. Generated release files are excluded from source control. Database tests use labeled synthetic records, not provider observations.

## Scientific boundaries

The structural calculation uses ATOM heavy atoms from only two user-selected chains. Ligands, other protein chains, waters and ions do not occlude the surface calculation. The ligand is rendered for context only. Surface area is discretized and sensitive to sampling; the default NZ-exposure threshold is a user-editable operational rule, not a ubiquitination classifier. Missing atoms and unresolved regions can bias the result.

The mechanism model uses clamped free intracellular degrader, not administered or total assay dose. It assumes rapid binding equilibrium, constant E3 abundance and instantaneous E3 recycling. The productive-clearance constant kpr is supplied independently; it is not estimated from geometry. Explicit ubiquitin chains, DUB activity, protein processing queues, cellular PK, turnover feedback, molecular-glue binding mechanisms and LOCKTAC state transitions are not implemented.

Run comparisons are snapshots of assumptions and outputs, not a ligand or ligase ranking. Session JSON contains original coordinates and may therefore be sensitive. Imported structure outputs and saved snapshots are not trusted; coordinates and settings are used to recompute the current audit. Exported comparison snapshots remain available for external inspection but are not reloaded into the comparison UI.

## Scientific provenance

The conceptual framing follows [Data-Rich, Insight-Poor CLII: From Degradation Curves to Degradability Landscapes](https://www.linkedin.com/pulse/from-degradation-curves-degradability-landscapes-making-damko-qwkue). The kinetic implementation is an independent reduced model, not a reproduction or validation of [Du et al., A quantitative approach for defining the degradability landscape of protein degraders](https://doi.org/10.1038/s41467-026-75591-8).

The bundled public structure is [RCSB PDB 5T35](https://www.rcsb.org/structure/5T35), from [Gadd et al., Structural basis of PROTAC cooperative recognition for selective protein degradation](https://pmc.ncbi.nlm.nih.gov/articles/PMC5392356/). It is not a complete CRL2/E2/ubiquitin complex.

Mechanistic interpretation and limitations draw on [Bai et al., Modeling the CRL4A ligase complex to predict target protein ubiquitination induced by cereblon-recruiting PROTACs](https://www.jbc.org/article/S0021-9258(22)00093-X/fulltext) and [Wurz et al., Affinity and cooperativity modulate ternary complex formation to drive targeted protein degradation](https://www.nature.com/articles/s41467-023-39904-5). SASA follows the rolling-probe point construction documented in [Biopython](https://biopython.org/docs/latest/api/Bio.PDB.SASA.html).

Only public structural data and explicitly illustrative kinetic inputs are bundled. No employer-specific data or science is included.

## Companion reading

`docs/COMPANION-ARTICLE.md`, “The Complex Is Not the Reaction,” connects all 14 corpus entries to the mechanistic questions behind the tool. `docs/ARTICLE-CONCORDANCE.md` traces every one of the 88 case records to its article and available primary evidence. These documents distinguish the single bundled coordinate example from the wider conceptual case library.
