# Targeted source audit for v0.2.2

Rechecked on September 26, 2026 UTC. This is a targeted review of high-risk
mechanistic labels, not an assertion that all 88 records have received a new
full-text systematic review. The library still covers the previously retrieved
14-item corpus, not the entire publication archive.

## Corrections made

The SuFEx primary study identifies SR-1114 as a CRBN-based ENL/AF9 PROTAC, not a
molecular glue; the case's category is now “PROTAC comparator.” The same study
does not resolve whether dHTC2 is molecular-glue-like or heterobifunctional, and
describes dHTC3 as glue-like with definitive structural classification still
open. Those uncertainties now appear in the library
([Nature Chemical Biology](https://doi.org/10.1038/s41589-025-02137-2)).

## Mechanistic boundaries retained

- **KAT2A:** The primary record supports noncanonical CRBN recruitment, but the
  available extracted record did not independently establish all compound-number
  details. The library continues to label those details article-reported rather
  than importing quantitative parameters
  ([Science](https://doi.org/10.1126/science.aef5391)).
- **RNF39:** Z5000181945 supports RING-domain degradation with MLN4924 rescue;
  Z4999952733 supports enhanced recruitment without a demonstrated degradation
  result in the retrieved text. The library retains this distinction
  ([Nature Biotechnology](https://doi.org/10.1038/s41587-026-03237-7)).
- **SMARCA2/4:** Compounds 1 and 4 are DCAF16-dependent in the reported system;
  compounds 2 and 3 recruit DCAF16 and FBXO22. Weak FBXO22 binding by compound 4
  does not establish productive FBXO22-mediated degradation
  ([PubMed record](https://pubmed.ncbi.nlm.nih.gov/42392088/)).
- **BACH1:** The retrieved record distinguishes productive cytoplasmic
  CUL2–FEM1B from mitochondrial CUL2–FEM1B. Total ligase abundance is not used as
  a measured accessible pool in the app
  ([PubMed record](https://pubmed.ncbi.nlm.nih.gov/42146656/)).
- **EndoTags:** The work concerns trafficking through receptors including
  sortilin, ASGPR and IGF2R, not an interchangeable E3/proteasomal model
  ([Nature](https://www.nature.com/articles/s41586-024-07948-2)).
- **RTA:** The text supports ACBI1/SMARCA4 and ACBI2/PBRM1 examples in the
  reported reporter context and lysosomal EGFR downregulation by EGF or SJF-1521.
  Amplified reporter output remains distinct from directly measured target loss
  ([primary preprint](https://pmc.ncbi.nlm.nih.gov/articles/PMC13228303/)).
- **Molecular dynamics:** Simulated conformational populations and candidate
  ubiquitination geometry are not direct experimental ubiquitin-transfer
  measurements
  ([eLife reviewed preprint](https://elifesciences.org/reviewed-preprints/101127v2)).

## Unresolved items

Previously flagged GlueMap/article ranking conflicts, article-only MG6 claims
and archive-only article URLs remain flagged. No unsupported quantitative
compound preset, cellular DC50 prediction or universal E3 efficacy ranking was
added. These items should not be represented as resolved by the software tests.
