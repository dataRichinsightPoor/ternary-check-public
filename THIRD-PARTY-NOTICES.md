# Third-party notices and data provenance

Original Ternary Check code, documentation and synthetic software-test fixtures are licensed under MIT, with owner approval. See `LICENSE`. This grant excludes third-party software, third-party datasets, linked articles and user-imported material; their own terms continue to apply.

## Software

- **3Dmol.js 2.5.3:** BSD-3-Clause and incorporated-code notices are preserved in `public/vendor/3Dmol-LICENSE.txt` and embedded in the portable HTML edition. Project: https://3dmol.org/.
- **Chart.js:** MIT; the installed package license is retained in the release dependency-notice asset and portable HTML. Project: https://www.chartjs.org/.
- **Lucide:** ISC; the installed package license is retained in the release dependency-notice asset and portable HTML. Project: https://lucide.dev/.
- **Vite:** Build tooling, not a scientific inference engine. Locked dependency versions are in `package-lock.json`. Project: https://vite.dev/.
- **Playwright:** Browser verification tooling. It is not bundled into the application. Project: https://playwright.dev/.
- **Biopython:** Independent surface-area verification tooling. It is not bundled into the application. Project: https://biopython.org/.

All dependency licenses remain applicable. See the packaged dependency-license text for the exact notices rather than treating this summary as their replacement.

## Public data

- **5T35 coordinates:** Retrieved from RCSB PDB, https://www.rcsb.org/structure/5T35. PDB archive data are available under CC0 1.0, per https://www.rcsb.org/pages/policies (reviewed 2026-09-26 UTC). The public structure is a BRD4–MZ1–VHL/elongin complex, not a complete E2–ubiquitin ligase assembly. This does not extend CC0 to every external annotation on the RCSB website.
- **UbiBrowser known interactions:** Official download, http://ubibrowser.bio-it.cn/ubibrowser_v3/Public/download/literature/literature.E3.txt. Definitions: http://ubibrowser.bio-it.cn/ubibrowser_v3/home/document/index. No provider interaction records or raw database fixture are distributed in the v0.2.1 source tree, site bundle or standalone HTML. Users obtain the file directly from the provider under its applicable terms and import it into their browser. The provider's download page and documentation did not establish an explicit redistribution grant when reviewed on 2026-09-26 UTC. A journal article license is not assumed to license the database. The database integration remains available without redistributing its contents.
- **UniProt:** Live annotations are requested only on user action and are not pre-bundled. Provider: https://www.uniprot.org/.
- **Article library:** Case records are short original summaries and interpretations linked to their article or primary-study provenance. Full articles are not redistributed. Coverage limits and archive-only entries are visible in the app.
- **Fonts:** External Google Fonts and Fontshare stylesheets are requested at runtime; font files are not included in the release archive. System-font fallbacks apply if unavailable.

## Release and history boundary

MIT is selected for original project material. Dependency notices are included in the standalone HTML, source distribution and site bundle; the structural example retains its CC0 provenance. Tests use conspicuously labeled original synthetic rows, not experimental database evidence.

The separate original private repository's earlier commits, v0.2.0 tag and draft assets still contain the former UbiBrowser snapshot. They remain private, preserved rather than rewritten or deleted. This public v0.2.4 repository starts from a clean source snapshot without inherited Git history or old assets. Its source archive is made with `git archive` and contains no `.git` history.

This is a practical distribution boundary, not legal advice or a blanket legal clearance. Public distribution of this clean-history edition was authorized by the project owner; that authorization does not extend to the old provider-data snapshot.
