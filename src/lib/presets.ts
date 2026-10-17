export interface ThemeTokens {
  keyword: string;
  string: string;
  function: string;
  number: string;
  comment: string;
  operator: string;
  classType: string;
  punctuation: string;
  property: string;
  boolean: string;
}

export interface ThemeOption {
  id: string;
  name: string;
  shikiTheme: string;
  bgPreview: string;
  textColor: string;
  isDark: boolean;
  tokens: ThemeTokens;
}

export interface BackgroundOption {
  id: string;
  name: string;
  preview: string;
}

export interface LanguageOption {
  id: string;
  name: string;
  extension: string;
  defaultFilename: string;
}

export interface FontOption {
  id: "jetbrains" | "fira" | "geist" | "system";
  label: string;
  fontFamily: string;
}

export interface SlideItem {
  id: string;
  title?: string;
  code: string;
  language?: string;
  focusedLines?: number[];
}

export interface SnippetState {
  code: string;
  language: string;
  theme: string;
  background: string;
  padding: number;
  showLineNumbers: boolean;
  showWindowControls: boolean;
  windowStyle: "mac" | "windows" | "minimal" | "none";
  title: string;
  dropShadow: "none" | "soft" | "medium" | "harsh";
  fontSize: number;
  fontFamily: "jetbrains" | "fira" | "geist" | "system";
  showWatermark: boolean;
  opacity: number;
  customWidth: number | null; // null = auto
  aspectPreset: "auto" | "1:1" | "16:9" | "twitter";
  customBgValue?: string;
  focusedLines?: number[]; // empty = all normal, otherwise only specified lines are spotlighted
  highlightDiffs?: boolean; // git diff styling (+ / -)
  watermarkType?: "default" | "customText" | "customLogo" | "none";
  customWatermarkText?: string;
  customWatermarkLogo?: string | null;
  watermarkPosition?: "bottom-right" | "bottom-left" | "top-right";
  autoBlurSecrets?: boolean; // click-to-blur & regex secrets redaction
  blurredTokens?: string[]; // custom words or tokens to redact
  lineWrap?: boolean; // wrap code lines without horizontal clipping
  isCarousel?: boolean; // multi-slide carousel studio mode
  slides?: SlideItem[]; // deck slides
  activeSlideIndex?: number;
}

export const THEMES: ThemeOption[] = [
  {
    id: "dracula",
    name: "Dracula",
    shikiTheme: "dracula",
    bgPreview: "#282a36",
    textColor: "#f8f8f2",
    isDark: true,
    tokens: {
      keyword: "#ff79c6",
      string: "#f1fa8c",
      function: "#50fa7b",
      number: "#bd93f9",
      comment: "#6272a4",
      operator: "#ff79c6",
      classType: "#8be9fd",
      punctuation: "#f8f8f2",
      property: "#66d9ef",
      boolean: "#bd93f9",
    },
  },
  {
    id: "one-dark-pro",
    name: "One Dark Pro",
    shikiTheme: "one-dark-pro",
    bgPreview: "#282c34",
    textColor: "#abb2bf",
    isDark: true,
    tokens: {
      keyword: "#c678dd",
      string: "#98c379",
      function: "#61afef",
      number: "#d19a66",
      comment: "#5c6370",
      operator: "#56b6c2",
      classType: "#e5c07b",
      punctuation: "#abb2bf",
      property: "#e06c75",
      boolean: "#d19a66",
    },
  },
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    shikiTheme: "tokyo-night",
    bgPreview: "#1a1b26",
    textColor: "#a9b1d6",
    isDark: true,
    tokens: {
      keyword: "#bb9af7",
      string: "#9ece6a",
      function: "#7aa2f7",
      number: "#ff9e64",
      comment: "#565f89",
      operator: "#89ddff",
      classType: "#2ac3de",
      punctuation: "#c0caf5",
      property: "#7dcfff",
      boolean: "#ff9e64",
    },
  },
  {
    id: "github-dark",
    name: "GitHub Dark",
    shikiTheme: "github-dark",
    bgPreview: "#24292e",
    textColor: "#e1e4e8",
    isDark: true,
    tokens: {
      keyword: "#ff7b72",
      string: "#a5d6ff",
      function: "#d2a8ff",
      number: "#79c0ff",
      comment: "#8b949e",
      operator: "#ff7b72",
      classType: "#ffa657",
      punctuation: "#e1e4e8",
      property: "#79c0ff",
      boolean: "#79c0ff",
    },
  },
  {
    id: "nord",
    name: "Nord",
    shikiTheme: "nord",
    bgPreview: "#2e3440",
    textColor: "#d8dee9",
    isDark: true,
    tokens: {
      keyword: "#81a1c1",
      string: "#a3be8c",
      function: "#88c0d0",
      number: "#b48ead",
      comment: "#616e88",
      operator: "#81a1c1",
      classType: "#8fbcbb",
      punctuation: "#eceff4",
      property: "#88c0d0",
      boolean: "#b48ead",
    },
  },
  {
    id: "night-owl",
    name: "Night Owl",
    shikiTheme: "night-owl",
    bgPreview: "#011627",
    textColor: "#d6deeb",
    isDark: true,
    tokens: {
      keyword: "#c792ea",
      string: "#ecc48d",
      function: "#82aaff",
      number: "#f78c6c",
      comment: "#637777",
      operator: "#c792ea",
      classType: "#ffcb8b",
      punctuation: "#d6deeb",
      property: "#7fdbca",
      boolean: "#ff5874",
    },
  },
  {
    id: "catppuccin-mocha",
    name: "Catppuccin Mocha",
    shikiTheme: "catppuccin-mocha",
    bgPreview: "#1e1e2e",
    textColor: "#cdd6f4",
    isDark: true,
    tokens: {
      keyword: "#cba6f7",
      string: "#a6e3a1",
      function: "#89b4fa",
      number: "#fab387",
      comment: "#6c7086",
      operator: "#94e2d5",
      classType: "#f9e2af",
      punctuation: "#cdd6f4",
      property: "#f5c2e7",
      boolean: "#fab387",
    },
  },
  {
    id: "rose-pine",
    name: "Rosé Pine",
    shikiTheme: "rose-pine",
    bgPreview: "#191724",
    textColor: "#e0def4",
    isDark: true,
    tokens: {
      keyword: "#eb6f92",
      string: "#f6c177",
      function: "#9ccfd8",
      number: "#ebbcba",
      comment: "#6e6a86",
      operator: "#31748f",
      classType: "#c4a7e7",
      punctuation: "#e0def4",
      property: "#9ccfd8",
      boolean: "#ebbcba",
    },
  },
  {
    id: "github-light",
    name: "GitHub Light",
    shikiTheme: "github-light",
    bgPreview: "#ffffff",
    textColor: "#24292e",
    isDark: false,
    tokens: {
      keyword: "#d73a49",
      string: "#032f62",
      function: "#6f42c1",
      number: "#005cc5",
      comment: "#6a737d",
      operator: "#d73a49",
      classType: "#6f42c1",
      punctuation: "#24292e",
      property: "#005cc5",
      boolean: "#005cc5",
    },
  },
  {
    id: "min-dark",
    name: "Minimal Dark",
    shikiTheme: "min-dark",
    bgPreview: "#121212",
    textColor: "#e5e7eb",
    isDark: true,
    tokens: {
      keyword: "#f43f5e",
      string: "#10b981",
      function: "#6366f1",
      number: "#f59e0b",
      comment: "#64748b",
      operator: "#06b6d4",
      classType: "#eab308",
      punctuation: "#e2e8f0",
      property: "#38bdf8",
      boolean: "#f43f5e",
    },
  },
];

export const BACKGROUNDS: BackgroundOption[] = [
  {
    id: "sunset",
    name: "Sunset",
    preview: "linear-gradient(135deg, #f59e0b 0%, #f43f5e 50%, #9333ea 100%)",
  },
  {
    id: "midnight",
    name: "Midnight",
    preview: "linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 50%, #3b0764 100%)",
  },
  {
    id: "candy",
    name: "Candy",
    preview: "linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #6366f1 100%)",
  },
  {
    id: "breeze",
    name: "Breeze",
    preview: "linear-gradient(135deg, #22d3ee 0%, #14b8a6 50%, #2563eb 100%)",
  },
  {
    id: "emerald",
    name: "Emerald",
    preview: "linear-gradient(135deg, #10b981 0%, #0d9488 50%, #0e7490 100%)",
  },
  {
    id: "hyper",
    name: "Hyper",
    preview: "linear-gradient(135deg, #7c3aed 0%, #c026d3 50%, #ec4899 100%)",
  },
  {
    id: "aurora",
    name: "Aurora",
    preview: "linear-gradient(135deg, #34d399 0%, #4f46e5 50%, #581c87 100%)",
  },
  {
    id: "solaris",
    name: "Solaris",
    preview: "linear-gradient(135deg, #ea580c 0%, #f59e0b 50%, #e11d48 100%)",
  },
  {
    id: "crimson",
    name: "Crimson",
    preview: "linear-gradient(135deg, #dc2626 0%, #be123c 50%, #581c87 100%)",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    preview: "linear-gradient(135deg, #facc15 0%, #ef4444 50%, #db2777 100%)",
  },
  {
    id: "slate",
    name: "Slate",
    preview: "#1e293b",
  },
  {
    id: "charcoal",
    name: "Charcoal",
    preview: "#121316",
  },
  {
    id: "onyx",
    name: "Onyx",
    preview: "#08090c",
  },
  {
    id: "transparent",
    name: "Transparent",
    preview: "transparent",
  },
];

export const LANGUAGES: LanguageOption[] = [
  { id: "typescript", name: "TypeScript", extension: "ts", defaultFilename: "index.ts" },
  { id: "javascript", name: "JavaScript", extension: "js", defaultFilename: "index.js" },
  { id: "python", name: "Python", extension: "py", defaultFilename: "main.py" },
  { id: "rust", name: "Rust", extension: "rs", defaultFilename: "main.rs" },
  { id: "go", name: "Go", extension: "go", defaultFilename: "main.go" },
  { id: "html", name: "HTML", extension: "html", defaultFilename: "index.html" },
  { id: "css", name: "CSS", extension: "css", defaultFilename: "styles.css" },
  { id: "sql", name: "SQL", extension: "sql", defaultFilename: "query.sql" },
  { id: "json", name: "JSON", extension: "json", defaultFilename: "config.json" },
  { id: "markdown", name: "Markdown", extension: "md", defaultFilename: "README.md" },
  { id: "cpp", name: "C++", extension: "cpp", defaultFilename: "main.cpp" },
  { id: "csharp", name: "C#", extension: "cs", defaultFilename: "Program.cs" },
  { id: "java", name: "Java", extension: "java", defaultFilename: "Main.java" },
  { id: "swift", name: "Swift", extension: "swift", defaultFilename: "App.swift" },
  { id: "kotlin", name: "Kotlin", extension: "kt", defaultFilename: "Main.kt" },
  { id: "php", name: "PHP", extension: "php", defaultFilename: "index.php" },
  { id: "bash", name: "Bash", extension: "sh", defaultFilename: "deploy.sh" },
  { id: "yaml", name: "YAML", extension: "yaml", defaultFilename: "compose.yml" },
  { id: "dockerfile", name: "Dockerfile", extension: "dockerfile", defaultFilename: "Dockerfile" },
];

export const PADDING_OPTIONS = [
  { label: "16", value: 16 },
  { label: "32", value: 32 },
  { label: "64", value: 64 },
  { label: "128", value: 128 },
];

export const SHADOW_OPTIONS: { id: SnippetState["dropShadow"]; label: string; class: string }[] = [
  { id: "none", label: "None", class: "shadow-none" },
  {
    id: "soft",
    label: "Soft",
    class: "shadow-[0_15px_40px_rgba(0,0,0,0.25)]",
  },
  {
    id: "medium",
    label: "Medium",
    class: "shadow-[0_25px_60px_-15px_rgba(0,0,0,0.45),0_10px_20px_-5px_rgba(0,0,0,0.3)]",
  },
  {
    id: "harsh",
    label: "Deep",
    class: "shadow-[0_35px_80px_-20px_rgba(0,0,0,0.65),0_15px_35px_-5px_rgba(0,0,0,0.4)]",
  },
];

export const FONT_OPTIONS: FontOption[] = [
  {
    id: "jetbrains",
    label: "JetBrains Mono",
    fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, Menlo, Monaco, Consolas, monospace",
  },
  {
    id: "fira",
    label: "Fira Code",
    fontFamily: "'Fira Code', 'JetBrains Mono', ui-monospace, Menlo, Monaco, Consolas, monospace",
  },
  {
    id: "geist",
    label: "Geist Mono",
    fontFamily: "var(--font-mono), ui-monospace, Menlo, Monaco, Consolas, monospace",
  },
  {
    id: "system",
    label: "System",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
  },
];

export interface SampleSnippet {
  label: string;
  language: string;
  filename: string;
  code: string;
  focusedLines?: number[];
  highlightDiffs?: boolean;
  autoBlurSecrets?: boolean;
  isCarousel?: boolean;
  slides?: SlideItem[];
}

export const SAMPLE_SNIPPETS: SampleSnippet[] = [
  {
    label: "TypeScript Session Cache",
    language: "typescript",
    filename: "session.ts",
    code: `// High-performance user session cache
export async function getSession(token: string): Promise<Session> {
  const session = await redis.get(\`auth:\${token}\`);
  if (!session) throw new UnauthorizedError();
  
  return JSON.parse(session);
}`,
  },
  {
    label: "Carousel: 3-Slide Refactor (Pro)",
    language: "typescript",
    filename: "carousel-deck-slide-1.ts",
    isCarousel: true,
    slides: [
      {
        id: "slide_1",
        title: "1-problem-statement.ts",
        language: "typescript",
        focusedLines: [3, 4],
        code: `// Slide 1: The Bottleneck
export async function fetchUserFeed(userId: string) {
  // ⚠️ Problem: Blocking sequential waterfall queries
  const user = await db.user.findUnique({ where: { id: userId } });
  const posts = await db.post.findMany({ where: { authorId: userId } });
  const stats = await db.analytics.aggregate({ where: { userId } });
  return { user, posts, stats };
}`,
      },
      {
        id: "slide_2",
        title: "2-parallel-batching.ts",
        language: "typescript",
        focusedLines: [4, 5, 6, 7],
        code: `// Slide 2: Concurrent Resolution
export async function fetchUserFeed(userId: string) {
  // ⚡ Optimization: Parallelize independent I/O promises
  const [user, posts, stats] = await Promise.all([
    db.user.findUnique({ where: { id: userId } }),
    db.post.findMany({ where: { authorId: userId } }),
    db.analytics.aggregate({ where: { userId } }),
  ]);
  return { user, posts, stats };
}`,
      },
      {
        id: "slide_3",
        title: "3-edge-cached.ts",
        language: "typescript",
        focusedLines: [3, 4, 8],
        code: `// Slide 3: Edge Stale-While-Revalidate
export async function fetchUserFeed(userId: string) {
  const cacheKey = \`feed:\${userId}\`;
  const cached = await edgeKV.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const feed = await computeFeed(userId);
  await edgeKV.put(cacheKey, JSON.stringify(feed), { ttl: 60 });
  return feed;
}`,
      },
    ],
    code: `// Slide 1: The Bottleneck
export async function fetchUserFeed(userId: string) {
  // ⚠️ Problem: Blocking sequential waterfall queries
  const user = await db.user.findUnique({ where: { id: userId } });
  const posts = await db.post.findMany({ where: { authorId: userId } });
  const stats = await db.analytics.aggregate({ where: { userId } });
  return { user, posts, stats };
}`,
  },
  {
    label: "Secrets Redacted API (Pro)",
    language: "typescript",
    filename: "stripe-webhook.ts",
    autoBlurSecrets: true,
    code: `import Stripe from "stripe";

// Confidential Gateway Credentials
const stripeSecretKey = "sk_test_placeholder_key_abc123xyz456";
const webhookSecret = "whsec_placeholder_secret_abc123xyz456";

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-06-20",
});`,
  },
  {
    label: "Git Diff Refactor (Pro)",
    language: "typescript",
    filename: "auth-service.ts",
    highlightDiffs: true,
    focusedLines: [],
    code: `// Modern Auth Validation Migration
export async function verifySession(token: string) {
- const user = await legacyDb.findUser(token);
- if (!user) throw new Error("Invalid session");
+ const session = await authClient.validateToken(token);
+ if (!session.isValid) {
+   throw new UnauthorizedError("Session expired or invalid");
+ }
+ const user = await cache.getOrSetUser(session.userId);
  return { user, permissions: user.roles };
}`,
  },
  {
    label: "Line Spotlight Focus (Pro)",
    language: "typescript",
    filename: "rate-limiter.ts",
    highlightDiffs: false,
    focusedLines: [6, 7, 8, 9],
    code: `export class SlidingWindowRateLimiter {
  constructor(private readonly limit: number, private readonly windowMs: number) {}

  async check(key: string): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    // Spotlight: atomic slide-window evaluation
    const count = await redis.zcount(key, windowStart, now);
    if (count >= this.limit) return false;
    await redis.zadd(key, now, now);
    return true;
  }
}`,
  },
  {
    label: "Rust Concurrency",
    language: "rust",
    filename: "worker.rs",
    code: `use tokio::sync::mpsc;
use std::time::Duration;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let (tx, mut rx) = mpsc::channel(32);

    tokio::spawn(async move {
        tx.send("task completed").await.unwrap();
    });

    println!("Output: {:?}", rx.recv().await);
    Ok(())
}`,
  },
  {
    label: "React Custom Hook",
    language: "typescript",
    filename: "useDebounce.ts",
    code: `import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}`,
  },
  {
    label: "Python Fibonacci",
    language: "python",
    filename: "fibonacci.py",
    code: `def fibonacci(limit: int):
    """Generates Fibonacci numbers on demand."""
    a, b = 0, 1
    for _ in range(limit):
        yield a
        a, b = b, a + b

print(list(fibonacci(8)))`,
  },
  {
    label: "SQL Analytics Window",
    language: "sql",
    filename: "analytics.sql",
    code: `SELECT 
    DATE_TRUNC('month', order_date) AS month,
    customer_id,
    SUM(total_amount) AS revenue,
    RANK() OVER (PARTITION BY DATE_TRUNC('month', order_date) ORDER BY SUM(total_amount) DESC) as rank
FROM orders
GROUP BY 1, 2;`,
  },
];

export const DEFAULT_STATE: SnippetState = {
  code: SAMPLE_SNIPPETS[0].code,
  language: "typescript",
  theme: "dracula",
  background: "sunset",
  padding: 32,
  showLineNumbers: true,
  showWindowControls: true,
  windowStyle: "mac",
  title: "session.ts",
  dropShadow: "medium",
  fontSize: 13,
  fontFamily: "jetbrains",
  showWatermark: true,
  opacity: 100,
  customWidth: null,
  aspectPreset: "auto",
  focusedLines: [],
  highlightDiffs: true,
  watermarkType: "default",
  customWatermarkText: "",
  customWatermarkLogo: null,
  watermarkPosition: "bottom-right",
  autoBlurSecrets: false,
  blurredTokens: [],
  lineWrap: true,
  isCarousel: false,
  slides: [],
  activeSlideIndex: 0,
};
