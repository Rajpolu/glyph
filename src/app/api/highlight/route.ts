import { NextResponse } from "next/server";
import { getSingletonHighlighter, BundledLanguage, BundledTheme } from "shiki";

const SUPPORTED_THEMES: BundledTheme[] = [
  "dracula",
  "one-dark-pro",
  "tokyo-night",
  "github-dark",
  "nord",
  "night-owl",
  "catppuccin-mocha",
  "rose-pine",
  "github-light",
  "min-dark",
];

const SUPPORTED_LANGS: BundledLanguage[] = [
  "typescript",
  "javascript",
  "python",
  "rust",
  "go",
  "html",
  "css",
  "sql",
  "json",
  "markdown",
  "cpp",
  "csharp",
  "java",
  "swift",
  "kotlin",
  "php",
  "bash",
  "yaml",
  "dockerfile",
];

// Lazy-initialized singleton highlighter promise
let highlighterPromise: ReturnType<typeof getSingletonHighlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = getSingletonHighlighter({
      themes: SUPPORTED_THEMES,
      langs: SUPPORTED_LANGS,
    });
  }
  return highlighterPromise;
}

export async function POST(request: Request) {
  try {
    const { code, language, theme } = await request.json();

    if (typeof code !== "string") {
      return NextResponse.json({ error: "Code string is required" }, { status: 400 });
    }

    const highlighter = await getHighlighter();

    const safeLanguage = (
      SUPPORTED_LANGS.includes(language) ? language : "markdown"
    ) as BundledLanguage;

    const safeTheme = (
      SUPPORTED_THEMES.includes(theme) ? theme : "dracula"
    ) as BundledTheme;

    // Load dynamic theme or lang if not already present in the bundle
    if (!highlighter.getLoadedThemes().includes(safeTheme)) {
      await highlighter.loadTheme(safeTheme);
    }
    if (!highlighter.getLoadedLanguages().includes(safeLanguage)) {
      await highlighter.loadLanguage(safeLanguage);
    }

    const html = highlighter.codeToHtml(code, {
      lang: safeLanguage,
      theme: safeTheme,
    });

    return NextResponse.json({ html });
  } catch (error) {
    console.error("Syntax highlighting error:", error);
    return NextResponse.json(
      { error: "Failed to highlight code" },
      { status: 500 }
    );
  }
}
