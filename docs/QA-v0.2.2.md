# v0.2.2 audit coverage

## Worker regression

The previous hosted build constructed an external module worker. In a sandboxed
iframe without `allow-same-origin`, Chromium refused that script from origin
`null`; the synchronous constructor exception left the interface busy. The fix
embeds the same analysis worker in both distributions using Vite's inline-worker
loader. It does not move coordinates or calculations to a server.

Acceptance checks cover an opaque-origin iframe, repeated audits, worker
construction failure, runtime error, message decoding failure, timeout, and
recovery by clicking Retry/Run audit. Each failure must clear busy state, retain a
persistent explanation and leave incomplete results unavailable for export.
Both static and standalone editions run these checks.

## Full regression

The release gate also exercises structure controls, settings, maps, exports,
session reimport, malformed input, model scenarios, article cases, local
interaction imports, external-annotation mocks, comparison views, desktop/mobile
layouts and themes. Existing tests and an independent Biopython SASA comparison
are rerun; these verify implementation, not biological predictive accuracy.

## Additional boundary checks

Blank coordinate columns must not become zero coordinates. Structural settings
must reject nonfinite values and altered overlap thresholds. Session import must
validate settings before replacing current input. A later file selection wins
over earlier asynchronous reads or hashing. Database fingerprints must identify
original file bytes, including a possible byte-order mark; valid empty final TSV
fields must survive parsing.

## Release integrity

The verification receipt binds the commit to a SHA-256 inventory of built static
and portable files. Packaging rechecks that inventory, all unit tests, all three
browser suites for both editions and the independent surface receipt. Original
material remains MIT; no third-party interaction database is redistributed.

## Explicit exclusions

No new biological validation, fitted compound parameters, efficacy ranking or
DC50 prediction is claimed. External database/server availability, untested
browser engines and enterprise browser policies that forbid all workers are not
guaranteed. For a policy failure the app must explain the failure rather than
fabricate results or silently upload the structure.
