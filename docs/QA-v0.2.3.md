# Ternary Check v0.2.3: verification scope

This refinement keeps the structural method unchanged. It changes dose
sampling, improves display/provenance, and strengthens release verification.

## Coverage inventory

- Structural inputs: embedded 5T35, local PDB, live RCSB 1BRS, malformed records,
  alternate occupancy, chain selection, probe and cutoff changes, missing NZ.
- Rendering and interaction: representation, ligand/lysine toggles, residue
  focus, camera reset, tables, filters, theme, desktop and mobile layouts.
- Export: CSV, Markdown, session JSON, molecular PNG, kinetics CSV; valid
  reimport recomputes, invalid import preserves the current valid audit.
- Mechanism: exact protein mass balance, bounded integration, hook effect,
  selected-dose inclusion, analytic peak inclusion, zero E3/processing,
  pulse split, time courses, saved comparisons, invalid washout.
- Corpus: every one of 88 records, 14 source entries, filters, case notes,
  explicit controls/comparators, and no automatic parameter assignment.
- E3 evidence: no-data semantics, local synthetic TSV import, exact-byte
  fingerprint, malformed and duplicate-header rejection, live UniProt plus
  failure handling, evidence/dossier provenance.
- Workers: static and portable inside an opaque-origin iframe; construction,
  runtime, message and timeout failures; no incomplete save; retry recovery.
- Independent checks: Biopython SASA with matched atoms/radii; 100 continuous
  trajectories against SciPy DOP853; 100 pulse trajectories against DOP853
  before washout and the exact exponential recovery afterward.
- Packaging: clean commit, inventory-bound receipts, license notices, hashes,
  no redistributed UbiBrowser data, private draft only.

The machine-readable release receipt records actual results. Passing checks
establishes the specified software behavior in tested Chromium environments,
not universal browser support, biological validity, or cellular potency.
