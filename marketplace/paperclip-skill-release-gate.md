---
name: "@tateprograms/skill-release-gate"
version: "1.0.0"
author: "Tate Programs"
description: "Pre-publish release gate for agent-skill sellers: permissions ledger, skill card, scan evidence, install boundary, rollback notes, and marketplace-ready trust copy."
tags:
  - agent-skills
  - marketplace
  - trust
  - release
  - security
  - skill-md
price: 1200
publisher_wallet: "0x568A89918BAbDB30869D03c1214fd45fF919e75D"
license: "proprietary"
model_tier: "any"
type: "skill"
references:
  - url: "https://www.paperclipskills.com/api/v1/skills/@tateprograms/agent-skill-trust-check"
    alias: "trust-check"
---

# Skill Release Gate

Use this skill before publishing or updating an agent skill, SKILL.md package, marketplace listing, or paid agent blueprint. It turns rough skill content into a release-ready trust packet that a buyer, reviewer, or marketplace can inspect before install.

---

## When to Use

Activate this skill when a user wants to:

- Publish a new agent skill or agent blueprint to a marketplace.
- Update a paid skill and reduce rejection, refund, or trust risk.
- Prepare a public skill card before sending a listing for review.
- Convert a working internal skill into something safe enough for customers.
- Compare a skill against marketplace-readiness expectations before launch.

Do not invent scans, signatures, sales claims, installs, reviews, buyer logos, or audit results. Mark unknown evidence as missing and put it in the patch order.

## Steps / Procedure

1. Collect the release inputs.
   - Required: skill name, target users, full skill text, source URL or local path, version, license, price, author/publisher name, and install path.
   - Preferred: repo URL, changelog, test command, fixture output, uninstall notes, support contact, marketplace URL, and prior scan output.
   - If any input is missing, continue with an explicit `missing_evidence` list.

2. Build the permission ledger.
   - List every capability the skill asks the loading agent to use.
   - Separate local file access, shell/package access, network destinations, account data, secrets, browser/app control, payment actions, background behavior, and external sharing.
   - For each capability, record: reason, user confirmation point, default state, and rollback path.

3. Write the skill card.
   - Summary: what the skill does in one practical sentence.
   - Intended users: who should install it.
   - Not for: where it should not be used.
   - Inputs read: files, URLs, account surfaces, secrets, or pasted text.
   - Actions taken: commands, edits, network calls, messages, purchases, or signatures.
   - Outputs produced: reports, patches, posts, tickets, files, or API calls.
   - Human confirmation: exact moments a human must approve.
   - Failure behavior: what happens on missing input, network failure, invalid credentials, or unsafe scope.
   - Uninstall/rollback: how to remove or disable it.

4. Run or request the trust check.
   - If `@tateprograms/agent-skill-trust-check` is available, apply it to the complete skill text.
   - If a CLI or scanner output is available, summarize findings without hiding warnings.
   - If no scanner is available, perform a manual static pass using the same categories and mark it as manual.

5. Prepare marketplace copy.
   - Title: clear, specific, not hype-led.
   - Description: under 500 characters, buyer outcome first, no unverifiable claims.
   - Tags: 4-8 narrow tags.
   - Price rationale: explain why the price matches time saved or risk avoided.
   - Public proof: source, version, test output, sample result, or docs link.

6. Produce a release decision.
   - `ship`: trust card complete, risky permissions bounded, rollback documented, no critical missing evidence.
   - `ship_after_patch`: useful skill with bounded fix list.
   - `hold`: broad local/account/payment behavior without guardrails, missing source/version for a paid skill, hidden external destinations, or unbounded background behavior.

7. Output the final packet in this order:
   - `decision`
   - `permission_ledger`
   - `skill_card`
   - `marketplace_copy`
   - `scan_or_manual_review`
   - `patch_order`
   - `publish_checklist`

## Release Rules

Treat these as launch blockers until patched:

| Blocker | Required patch |
| --- | --- |
| Broad local writes without scoped paths | Narrow the path or require explicit confirmation before writes. |
| Shell/package commands without command list | Add exact command list, reason, and rollback note. |
| Secrets or account data without handling rules | Add env names, storage boundary, redaction, and never-log rule. |
| Payment, wallet, purchase, or signature actions | Require human confirmation and show exact amount/action before execution. |
| Hidden network destinations | Add destination allowlist and explain data sent. |
| Background or scheduled behavior | Add start/stop controls and visible status. |
| No source/version for a paid skill | Add repo, release tag, changelog, or explicit proprietary support route. |
| No uninstall or rollback note | Add removal steps and state cleanup. |

Positive signals:

- Small, named scope.
- Source or support route is visible.
- Version and changelog are present.
- Sensitive actions are opt-in.
- The skill can be reviewed as text before install.
- Outputs are inspectable before sending or publishing.
- The listing states what the skill does not do.

## Reference

Release packet template:

```markdown
decision: ship_after_patch

permission_ledger:
- capability: network access
  destination: https://example.com/api
  reason: submits final report after user approval
  confirmation: required before send
  rollback: delete API key and remove config entry

skill_card:
  summary: ...
  intended_users: ...
  not_for: ...
  inputs_read: ...
  actions_taken: ...
  outputs_produced: ...
  human_confirmation: ...
  failure_behavior: ...
  uninstall_rollback: ...

marketplace_copy:
  title: ...
  description: ...
  tags: [...]
  price_rationale: ...
  public_proof: ...

scan_or_manual_review:
  method: manual_static_pass
  findings: [...]
  positive_signals: [...]
  missing_evidence: [...]

patch_order:
1. ...
2. ...

publish_checklist:
- version bumped
- source/support route visible
- permissions listed
- rollback documented
- sample output reviewed
```

Boundary: this release gate improves pre-publish trust posture. It does not certify runtime safety, replace legal/security review, execute untrusted skill code, authorize payments, or prove marketplace acceptance.
