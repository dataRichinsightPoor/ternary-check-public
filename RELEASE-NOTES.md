# Ternary Check v0.2.4

First clean-history public research-prototype release, with an accompanying Data-Rich, Insight-Poor essay. The structural algorithm and session schema remain 0.2.0; the application version is 0.2.4. Scientific calculation code is unchanged from v0.2.3. This release updates distribution, public links, documentation and deployment.

## Refinements

- Dose-response sampling now includes the user-selected exposure and the analytic equilibrium peak, sqrt(Kt × Ke), avoiding a coarse-grid artifact.
- Continuous and pulse/washout integration are checked on 100 parameter sets each against SciPy DOP853 and exact recovery after washout.
- Light-theme Export contrast and small interface labels are improved.
- Dossiers distinguish application version from structural algorithm version.
- Citation, guide and release metadata have a consistency regression test.
- RTA publication provenance is updated while preserving the open manuscript.
- The companion essay, “The Complex Is Not the Reaction,” connects all 14 retrieved corpus entries. A separate concordance covers all 88 case records.

## Worker repair retained

The worker remains embedded in both the static and portable editions for opaque-origin preview compatibility. Construction, runtime, message and timeout failures clear loading state, prevent incomplete saves and permit retry. The worker suite exercises the restricted iframe and forced failure/recovery paths in both editions.

## Open the app

Download `Ternary-Check-v0.2.4.html` and open it in a current desktop browser. The molecular viewer, 5T35 example, calculations and case library are included; no installation or local server is required.

For UbiBrowser interactions, obtain the official known E3 TSV under the provider's terms and import it locally. No provider database is bundled. Imported records remain in memory; reimport after closing or reloading. Optional RCSB/UniProt lookups, external fonts and source links need internet access. Local structures are not uploaded.

## Verification

The release pipeline runs numerical/data/metadata tests, browser acceptance and worker-failure suites against both editions, independent SASA and kinetics cross-checks, and a distribution guard. Exact results and source commit are in `ternary-check-v0.2.4-verification.json`; asset checksums are in `SHA256SUMS.txt`.

Software verification is not biological validation. The app does not infer cellular DC50, affinity, linker entropy or comparative E3 efficacy from a structure. Hypothetical models are not fitted compound parameters, and the 14-entry corpus is not a certified complete publication archive.

## Assets and licensing

The release includes standalone HTML, static-site and source ZIPs, the verification receipt, MIT license for original material, separately scoped third-party notices and checksums. The source archive includes the companion essay and article/case concordance.

The public repository contains fresh history only. Earlier v0.2.0 history and assets remain in the separate private repository and are not distributed. No UbiBrowser provider records are bundled.

Use the [hosted tool](https://datarichinsightpoor.github.io/ternary-check-public/), [public source](https://github.com/dataRichinsightPoor/ternary-check-public), and [illustrated CCXXXIX companion](https://ternary-check-ccxxxix.pplx.app). Public availability is not a claim of validated biological prediction.
