# Documentation Structure

This directory is organized by document purpose.

## Folder Map
- `reports/`: final written reports for reviewers and stakeholders.
- `evidence/logs/`: command outputs and diagnostic text captures.
- `evidence/diffs/`: code diff snapshots used as fix evidence.
- `evidence/screenshots/`: visual captures exported as SVG.
- `evidence/raw-http/`: raw HTTP responses captured during runtime checks.

## Current Main Report
- `reports/technical-issues-and-fixes-report.md`

## Naming Convention
- Use lowercase names with hyphens for reports.
- Keep evidence files numbered (`01_`, `02_`, ...) to preserve chronology.
- Prefer descriptive suffixes (`_before_fixes`, `_after_fixes`, `_with_error`).

## Update Checklist
1. Add or update files in the correct evidence folder.
2. Update `reports/technical-issues-and-fixes-report.md` evidence section paths.
3. Keep all documentation content in English.
