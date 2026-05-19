# Agent Skill Trust Check

Static pre-install trust check for agent skills, `SKILL.md` files, and skill marketplace listings.

Agent skill marketplaces are useful, but installing a skill is still a trust decision. This repo provides a small local scanner and a portable `SKILL.md` review guide for checking public skill text before it gets installed.

## Install

```bash
npx --yes agent-skill-trust-check ./SKILL.md
```

Run against a public GitHub/raw/Gist URL:

```bash
npx --yes agent-skill-trust-check https://raw.githubusercontent.com/owner/repo/main/SKILL.md --json
```

## What It Checks

- Shell/process execution.
- Destructive command patterns.
- Secret or credential access.
- Wallet/payment/signing behavior.
- Remote network/webhook output.
- Persistence/background behavior.
- Prompt-boundary language.
- Missing provenance signals such as license, tests, permissions, versioning, source, and uninstall notes.

## Output

The CLI returns:

- `verdict`
- `risk_score`
- `findings`
- `positives`
- `missing_signals`
- `patch_order`

## Marketplace Review

For a paid marketplace-grade pass, use:

https://orkai.ai/skills/agent-skill-trust-check

For private review work:

https://tateprograms.com/payments.html

## Boundary

This scanner is a static text pass. It does not execute the target skill and it does not replace sandboxing, code review, dependency review, or runtime monitoring.

## License

MIT
