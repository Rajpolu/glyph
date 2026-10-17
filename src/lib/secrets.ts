// Secrets and sensitive token detection & masking engine

export const SECRET_PATTERNS = [
  // OpenAI / Stripe / GitHub / AWS / GitLab / Slack API keys
  /\b(?:sk_live_|sk_test_|ghp_|gho_|ghs_|glpat-|xoxb-|xoxp-|AKIA|ASIA)[a-zA-Z0-9_\-]{16,}\b/gi,
  // Google API keys (AIza...)
  /\bAIza[0-9A-Za-z\-_]{35}\b/g,
  // Generic Bearer / JWT auth tokens
  /\bBearer\s+[a-zA-Z0-9_\-\.]{20,}\b/gi,
  // Key / Secret / Password assignments (apiKey = "...", password: '...')
  /(?:api[_-]?key|secret|password|passwd|token|auth[_-]?key|private[_-]?key|client[_-]?secret)\s*[:=]\s*(['"`])([^\s'"`]{6,})\1/gi,
  // Connection strings (postgres://user:pass@host:port/db, mongodb+srv://...)
  /\b(?:postgres(?:ql)?|mongodb(?:\+srv)?|mysql|redis):\/\/[^\s:]+:([^\s@]+)@[^\s]+/gi,
];

/**
 * Detect sensitive credentials and secrets in raw code text.
 * Returns an array of distinct sensitive strings to redact.
 */
export function detectSecrets(code: string): string[] {
  if (!code) return [];
  const matches = new Set<string>();

  for (const pattern of SECRET_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let m;
    while ((m = regex.exec(code)) !== null) {
      // If regex has capture group 2 (value inside quotes), mask just the secret value
      if (m.length > 2 && m[2]) {
        matches.add(m[2]);
      } else if (m.length > 1 && m[1] && pattern.source.includes("://")) {
        // Connection string password capture
        matches.add(m[1]);
      } else {
        matches.add(m[0]);
      }
    }
  }

  return Array.from(matches).filter((s) => s.length >= 4);
}

/**
 * Safely masks secret tokens within Prism syntax-highlighted HTML lines.
 * Replaces tokens ONLY inside text nodes without corrupting HTML tags or classes.
 */
export function maskSecretsInLineHtml(lineHtml: string, secrets: string[]): string {
  if (!lineHtml || !secrets || secrets.length === 0) return lineHtml;

  let result = lineHtml;
  for (const secret of secrets) {
    if (!secret || secret.length < 3) continue;

    // Split HTML by tags (<...>) so we only replace text within text segments
    const parts = result.split(/(<[^>]+>)/g);
    for (let i = 0; i < parts.length; i++) {
      // Even indices are text outside tags, odd indices are HTML tags
      if (i % 2 === 0 && parts[i].includes(secret)) {
        const bulletCount = Math.min(14, Math.max(6, secret.length));
        const maskHtml = `<span class="glyph-blurred-secret inline-block px-1 py-0.5 rounded text-[10px] bg-slate-800/90 text-slate-400 select-none ring-1 ring-white/10 blur-[3px] hover:blur-none transition-all cursor-pointer" title="Redacted secret (click to toggle)">${"•".repeat(bulletCount)}</span>`;
        parts[i] = parts[i].replaceAll(secret, maskHtml);
      }
    }
    result = parts.join("");
  }

  return result;
}
