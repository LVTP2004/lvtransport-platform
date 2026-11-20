# LVTransport historical record — 20 November 2026

This directory preserves the historical report requested by the owner and gives Codex an entry point for continuing the existing LVTransport plan. The report and original historical text remain in their source languages. The repository entry point and this guide use English.

## Read this first

- [Download the complete historical archive](lvtransport-history-2026-11-20.zip). Extract it locally and open `report/LVTransport_historial_PR_y_commits_2026-11-20.html` in a browser. The self-contained report contains search, filters, full PR descriptions, full commit messages and CSV export.
- [Codex handoff and acceptance criteria](CODEX_HANDOFF.md) connect this record to the existing execution plan.
- [Manifest](manifest.json) records the original snapshot, file sizes, SHA-256 hashes, coverage and limitations.
- [Archive checksum](SHA256SUMS) allows the downloaded archive to be checked before extraction.

The archive is versioned documentation. It is not deployed as a public application route.

## Frozen snapshot

The historical query was recorded at **2026-11-20 18:10:38 UTC / 19:10:38 Europe/Brussels**. Packaging and operational-context capture have their own timestamps in the manifest. The new commit preserving this package is necessarily later and is not counted in this snapshot.

| Measure | Count |
| --- | ---: |
| Pull requests | 373 |
| Merged PRs | 358 |
| Open PRs | 12 |
| Closed without merge | 3 |
| Open drafts | 8 |
| Commits reachable from the pinned main | 750 |
| Distinct commit SHAs across captured branch, tag and PR-head references | 1,876 |
| Captured branch heads | 418 |
| Captured tags | 1 |
| Captured PR-head references | 373 |
| Total captured references | 792 |

Pinned main: [`a7708afbdcba16dcef7e146c4501297daab3bdfd`](https://github.com/LVTP2004/lvtransport-platform/commit/a7708afbdcba16dcef7e146c4501297daab3bdfd).
The first main-root commit is [`2bbfa637`, 9 May 2026](https://github.com/LVTP2004/lvtransport-platform/commit/2bbfa637b179a540e70ef6dd746e62d9f72ccf37).

Of the 358 merged PRs, **315 targeted main and 43 targeted fix/production-build**. PR #417 is an identifier, not the number of PRs, because issues share the numbering sequence. A merged PR does not prove deployment or acceptance.

The 1,876 SHAs include equivalent histories, merge commits and branch work. They do not represent 1,876 independent features. Preserve each SHA and its parents: equal messages or trees are not a reason to delete or combine records. The 1,126 SHAs outside the pinned main are not a pending-work count.

## What is preserved

The archive keeps these independent representations:

| Location inside the archive | Purpose |
| --- | --- |
| `report/*.html` | Complete human-readable report, including the historical synthesis and searchable inventories. |
| `data/prs-all.json` | All 373 normalized PR records, including original titles, descriptions, dates, states, base/head references and URLs. |
| `data/commits-all.json` | All 1,876 commit records with full messages, SHA, parents, dates and membership in the pinned main. |
| `data/pr-diff-inventory.json` | File inventories reconstructed for every PR from captured base/head references. |
| `data/refs.json` | All 792 captured reference names and SHAs. |
| `data/summary.json` | Original snapshot and counts, preserved without rewriting. |
| `data/current-context.json` | Later capture of #409, #411, #414, #415, #410, #417 and the selected operational/owner comments used for the handoff. |
| `raw/pr-page-*.json` | Original captured PR API pages, including metadata beyond the normalized inventory. |
| `analysis/*.md` | Supplementary reading notes for the delegated historical batches. They are analysis, not new owner decisions or runtime acceptance. |

Three PR descriptions were empty (#4, #59 and #367). The JSON preserves their original values; the HTML adds an explanatory display label. Commit messages and non-empty PR descriptions must remain unchanged, including Unicode and line breaks.

This preserves the **audited history**, not a full repository backup: it does not include every PR comment, review, complete patch, CI log, Git object or runtime artifact. The current-context capture is explicitly selective. The original report and reading notes remain frozen even where later decisions supersede historical statements.

### Integrity check

Run from this directory:

```sh
sha256sum -c SHA256SUMS
python3 - <<'PY'
from pathlib import Path
import hashlib, json, zipfile
root = Path(".")
manifest = json.loads((root / "manifest.json").read_text())
with zipfile.ZipFile(root / manifest["archive"]["path"]) as archive:
    expected = {item["path"] for item in manifest["members"]}
    assert set(archive.namelist()) == expected
    for item in manifest["members"]:
        payload = archive.read(item["path"])
        assert len(payload) == item["bytes"], item["path"]
        assert hashlib.sha256(payload).hexdigest() == item["sha256"], item["path"]
    prs = json.loads(archive.read("data/prs-all.json"))
    commits = json.loads(archive.read("data/commits-all.json"))
    refs = json.loads(archive.read("data/refs.json"))
    assert len(prs) == len({p["number"] for p in prs}) == 373
    assert len(commits) == len({c["sha"] for c in commits}) == 1876
    assert sum(bool(c["in_main"]) for c in commits) == 750
    assert len(refs) == 792
print("Archive hashes, sizes and frozen counts verified.")
PY
```

These checks validate preservation of the archive. They do not run or certify the transport platform.

## Where current authority and work live

Read the [agent contract](../../../AGENTS.md), [product specification](../../LVTRANSPORT_SPEC_LOCK.md) and [existing masterplan](../../PROJECT-MASTERPLAN.md) alongside later owner decisions.

| Existing record | Current purpose |
| --- | --- |
| [#414](https://github.com/LVTP2004/lvtransport-platform/issues/414) | Product, access and acceptance decisions. |
| [#415](https://github.com/LVTP2004/lvtransport-platform/issues/415) | Execution order, dependencies and isolated-staging boundaries. |
| [#409](https://github.com/LVTP2004/lvtransport-platform/issues/409) and [#416](https://github.com/LVTP2004/lvtransport-platform/pull/416) | Approved visual reference and clarification of five surfaces within four visual blocks. |
| [#410](https://github.com/LVTP2004/lvtransport-platform/pull/410) | Operational source consolidation; captured head `c51082883254bdb8603b43723699f50affcedcd5`, still a draft with a review gate. |
| [#411](https://github.com/LVTP2004/lvtransport-platform/issues/411) | Joint real-account and same-booking acceptance. |
| [#417](https://github.com/LVTP2004/lvtransport-platform/pull/417) | Repository orientation and preservation of this report. |

Refresh those records before implementation. Do not treat this historical archive as a replacement masterplan.

## Continuity into the platform

Maintain one evidence matrix linked from the existing implementation-status and decision records. Each row needs:

**surface / requirement → historical reference → current source and SHA → delivered artifact → test evidence and limits → missing integration → authority boundary → next step in #415**.

Start with the five agreed surfaces:

| Surface | Evidence to reconcile | Acceptance focus |
| --- | --- | --- |
| Public website | Current public entry, booking and public tracking; #410 and later receipts. | Anonymous request and reference lookup; approved public navigation and restricted public data. |
| Private Ride account | Current customer ownership checks plus #414 requirements. | Own bookings/history, editable frequent-route suggestions, authorized payment/receipt sources. |
| Driver / MONI Drive | Current driver portal, assignments, lifecycle and GPS. | Enabled driver, valid assignment and the same booking reference throughout the trip. |
| Admin / Control Tower | Current operations portal and assignment controls. | Authorized dispatch, eligibility, assignment conflicts and auditable changes. |
| Founder OS / MONI Core | Current Founder reads and later separation candidate. | Explicit Founder identity/capabilities; distinct authorization from Tower; only supported data sources. |

The captured #410 Founder view uses verified Admin identity and does not itself provide separate Founder authority, connected ASK MONI or voice. #414 records a later local separation candidate for three reads; do not erase that later work or present it as deployed.

The [OTP staging receipt](https://github.com/LVTP2004/lvtransport-platform/issues/415#issuecomment-7046587020) already records an isolated implementation and emulator/browser checks. Locate and preserve those sources before extending them. It is a private artifact, not an active VPS site; challenge persistence and a separate staging sender/project with real-email acceptance remain pending. The [MONI pilot](https://github.com/LVTP2004/lvtransport-platform/issues/415#issuecomment-7045367174) also already ran. Its current mission profile remains limited to booking validation.

## Updating this record

Keep this dated archive and original hashes immutable. Put later snapshots in a new dated directory, and update the current evidence matrix with dated references. Record supersession explicitly. Do not delete old branches, rewrite history, bulk-merge historical PRs, or recreate older simulated implementations as part of organization.
