# Changelog

## v0.2.4

- First public release from a clean-history source snapshot. The separate old
  repository stays private; no historical provider-data payload is inherited.
- Add GitHub Pages deployment, public source/release links and article walkthrough.
- Preserve the v0.2.3 calculation code, worker repairs and case library.
- Rerun release verification and package commit-bound receipts for this edition.

## v0.2.3

- Include selected dose and the analytic rapid-equilibrium peak sqrt(Kt*Ke) in
  the dose-response sampling. This fixes a grid artifact, not a biological
  prediction. Structural algorithm and session schema remain 0.2.0.
- Gate releases on 100 independent continuous-exposure checks and 100
  pulse/washout comparisons against SciPy DOP853 plus exact post-washout recovery.
- Clarify app versus structural algorithm versions in exported dossiers.
- Link the published RTA paper while retaining open-manuscript provenance.
- Preserve article provenance notes, including manuscript links, in case exports.
- Improve light-theme Export contrast and raise sub-12px interface labels.
- Add regression coverage for sampling, zero-processing pulse boundaries,
  and light-theme Export contrast.
- Synchronize citation and release metadata with a regression check.
- Add the companion essay and a full article/case concordance.

## v0.2.2

- Fix worker startup in opaque-origin embedded previews by embedding the worker in both distributions.
- Catch startup, runtime and message errors; add a two-minute timeout, persistent failure status and retry recovery.
- Test the actual sandbox constraint and four forced-failure/recovery paths in both editions.
- Reject blank PDB coordinate columns, malformed residue numbers and nonfinite/unsupported structural inputs before computation.
- Keep asynchronous structure imports ordered and validate imported settings before replacing current input.
- Hash original interaction-file bytes, preserve empty trailing TSV columns and reject duplicate headers.
- Bind release packaging to the exact tested build inventory and require the worker regression suite.
- Correct SR-1114 to a PROTAC comparator, mark dHTC2 modality unresolved and qualify dHTC3 as glue-like, following the primary study.


## v0.2.1

Distribution repair; the scientific calculation algorithms are unchanged.

- Added owner-approved MIT licensing for original code and documentation, separately scoped from third-party material.
- Removed bundled UbiBrowser records and raw test database from the current tree and all newly generated release assets.
- Preserved provider links, local known-interaction TSV import, species/role filters, SHA-256 provenance, exports and live UniProt annotations.
- Added an honest empty database state; no-data is not presented as a negative interaction result.
- Replaced provider-data test dependencies with explicitly synthetic fixtures.
- Included project licensing and third-party notices in every distribution format.
- Added distribution guards and commit-bound verification to packaging.
- Preserved v0.2.0 and private history; public visibility remains blocked operationally until an approved clean-history publication.

## v0.2.0

First prepared GitHub release. Research prototype; software verification is not biological validation.

### Included

- Local PDB parsing, bundled 5T35 example, optional RCSB retrieval and interactive molecular viewing.
- Worker-based solvent-accessible surface sampling, two-chain interface burial, lysine NZ exposure, residue contact pairs and cutoff sensitivity.
- Conditional rapid-equilibrium PROTAC model with target/E3 mass conservation, cooperativity, target turnover, a high-dose hook effect, and ideal washout.
- An 88-record illustrative library covering 14 retrieved articles, posts and archive drafts; controls, comparators and primary-paper extensions are explicitly distinguished.
- UbiBrowser known-interaction snapshot with 4,068 records, provenance, role/species filtering, source links, local TSV replacement and evidence export.
- On-request reviewed-human UniProt annotations with constrained query inputs and error handling.
- Local case, dossier, CSV, PNG and JSON exports, in-memory comparisons and session-input reimport.
- A self-contained HTML edition that runs directly from a downloaded file, plus a static-site bundle and inspectable source.
- Numerical/data tests, browser acceptance scripts and an independent Biopython SASA cross-check.

### Scientific and coverage limitations

- No trained predictor, classifier accuracy claim, structure-derived affinity, inferred linker entropy, predicted cellular DC50, or automatic E3 efficacy ranking.
- The article corpus is not a certified complete archive. Some records are article-only, archive-only or preprint-supported; source conflicts remain flagged.
- The database is a dated snapshot, not a live UbiBrowser feed or a complete catalog of drug-induced recruitment.
- Surface calculations use only the selected two protein chains; missing coordinates, other chains and ligand occlusion are not reconstructed.
- The mechanism model is not fitted to named compounds. Explicit ubiquitin chains, cellular PK, DUB activity, covalent-glue kinetics, lysosomal trafficking networks and LOCKTAC state models are outside scope.
- Session reimport restores structural and kinetic inputs, not imported database contents or article-selection state.

### Distribution status

Prepared as a private draft prerelease. Public visibility, publication, software licensing and third-party dataset redistribution review are separate decisions; no GitHub Pages deployment is enabled.
