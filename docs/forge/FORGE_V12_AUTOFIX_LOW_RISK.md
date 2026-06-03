# FORGE V1.2 AUTOFIX LOW RISK

Status: ACTIVE

Purpose:

Apply low-risk TypeScript repairs classified by Forge Risk Policy.

Targets:

- TS2305 missing export/import mismatch
- TS2339 missing method/property guard

Rules:

- backup before patch
- build before patch
- build after patch
- rollback if errors increase
- write result to three memories
