#!/usr/bin/env node
import fs from 'node:fs/promises';

const FINDING_RULES = [
  {
    id: 'shell-execution',
    label: 'Shell or process execution',
    weight: 8,
    pattern: /\b(shell|bash|zsh|powershell|cmd\.exe|child_process|execSync|spawn|subprocess|os\.system)\b/i,
    advice: 'Require exact command allowlists, dry-run mode, and visible permission boundaries before install.',
  },
  {
    id: 'destructive-command',
    label: 'Destructive command pattern',
    weight: 10,
    pattern: /\b(rm\s+-rf|mkfs|dd\s+if=|chmod\s+777|chown\s+-R|sudo\b|curl\s+[^|]+\|\s*(sh|bash))\b/i,
    advice: 'Remove destructive examples or put them behind explicit human confirmation and scoped paths.',
  },
  {
    id: 'secret-access',
    label: 'Secret or credential access',
    weight: 9,
    pattern: /\b(api[_-]?key|auth[_-]?token|password|secret|private[_-]?key|seed phrase|mnemonic|\.env|process\.env|credential)\b/i,
    advice: 'Document what secrets are read, why they are needed, and how outputs avoid logging or exfiltration.',
  },
  {
    id: 'wallet-payment',
    label: 'Wallet or payment action',
    weight: 8,
    pattern: /\b(wallet|sign(ature|ing)?|transaction|transfer|usdc|x402|payment|settle|payTo|eip-3009)\b/i,
    advice: 'Add quoted amount, network, recipient, replay/idempotency, and approval boundaries before any signing flow.',
  },
  {
    id: 'network-exfil',
    label: 'Network or webhook output',
    weight: 6,
    pattern: /\b(fetch|axios|curl|webhook|post\s+to|upload|send\s+to|http:\/\/|https:\/\/)\b/i,
    advice: 'List all remote hosts and the data sent to each host; redact secrets and user identifiers.',
  },
  {
    id: 'persistence',
    label: 'Persistence or background behavior',
    weight: 6,
    pattern: /\b(cron|launchd|systemd|daemon|background|startup|login item|persist|autostart)\b/i,
    advice: 'Make background behavior opt-in and include removal commands.',
  },
  {
    id: 'prompt-boundary',
    label: 'Weak prompt boundary',
    weight: 5,
    pattern: /\b(ignore previous|override instructions|system prompt|developer message|hidden instruction|jailbreak)\b/i,
    advice: 'Separate untrusted content from operational instructions and document prompt-injection handling.',
  },
];

const POSITIVE_RULES = [
  { id: 'license', pattern: /\blicen[cs]e\b/i },
  { id: 'tests', pattern: /\b(test|spec|ci|github actions)\b/i },
  { id: 'permissions', pattern: /\b(permission|scope|allowlist|denylist)\b/i },
  { id: 'versioning', pattern: /\b(version|release|changelog|semver)\b/i },
  { id: 'source', pattern: /\b(source|repository|github\.com)\b/i },
  { id: 'uninstall', pattern: /\b(uninstall|remove|cleanup|disable)\b/i },
];

function usage() {
  return [
    'Usage:',
    '  agent-skill-trust-check <path-or-url> [--json]',
    '',
    'Examples:',
    '  agent-skill-trust-check SKILL.md',
    '  agent-skill-trust-check https://raw.githubusercontent.com/owner/repo/main/SKILL.md --json',
  ].join('\n');
}

async function readInput(target) {
  if (/^https?:\/\//i.test(target)) {
    const url = new URL(target);
    if (!['raw.githubusercontent.com', 'github.com', 'gist.githubusercontent.com'].includes(url.hostname)) {
      throw new Error('Only public GitHub/raw/Gist URLs are fetched by the local CLI.');
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Fetch failed with HTTP ${response.status}`);
    return response.text();
  }
  return fs.readFile(target, 'utf8');
}

function analyze(text, target) {
  const findings = FINDING_RULES.filter((rule) => rule.pattern.test(text)).map((rule) => ({
    id: rule.id,
    label: rule.label,
    severity: rule.weight >= 9 ? 'high' : rule.weight >= 7 ? 'medium' : 'low',
    advice: rule.advice,
  }));

  const positives = POSITIVE_RULES.filter((rule) => rule.pattern.test(text)).map((rule) => rule.id);
  const missing = POSITIVE_RULES.filter((rule) => !rule.pattern.test(text)).map((rule) => rule.id);
  const riskScore = findings.reduce((sum, finding) => {
    const rule = FINDING_RULES.find((item) => item.id === finding.id);
    return sum + (rule?.weight || 0);
  }, 0);

  let verdict = 'review_before_install';
  if (riskScore >= 24 || findings.some((finding) => finding.severity === 'high')) {
    verdict = 'do_not_install_without_changes';
  } else if (riskScore <= 6 && missing.length <= 2) {
    verdict = 'reasonable_to_trial_in_sandbox';
  }

  return {
    target,
    verdict,
    risk_score: riskScore,
    findings,
    positives,
    missing_signals: missing,
    patch_order: findings.map((finding) => finding.advice),
    next_step: 'For marketplace-grade review, run the paid Agent Skill Trust Check on Orkai or request a private review from Tate Programs.',
  };
}

function printText(result) {
  console.log(`Agent Skill Trust Check: ${result.verdict}`);
  console.log(`Risk score: ${result.risk_score}`);
  console.log(`Target: ${result.target}`);
  console.log('');
  if (result.findings.length === 0) {
    console.log('No risky patterns matched in the static text pass.');
  } else {
    console.log('Findings:');
    for (const finding of result.findings) {
      console.log(`- [${finding.severity}] ${finding.label}: ${finding.advice}`);
    }
  }
  console.log('');
  console.log(`Missing signals: ${result.missing_signals.join(', ') || 'none'}`);
  console.log(result.next_step);
}

const args = process.argv.slice(2);
const json = args.includes('--json');
const target = args.find((arg) => arg !== '--json');

if (!target || args.includes('--help') || args.includes('-h')) {
  console.log(usage());
  process.exit(target ? 0 : 1);
}

try {
  const text = await readInput(target);
  const result = analyze(text, target);
  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printText(result);
  }
} catch (error) {
  console.error(`agent-skill-trust-check: ${error.message}`);
  process.exit(1);
}
