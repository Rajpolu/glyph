import Prism from "prismjs";

// Core base grammars (must load first)
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-markup-templating";

// Language grammars
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-go";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-json";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-swift";
import "prismjs/components/prism-kotlin";
import "prismjs/components/prism-php";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-docker";

const langMap: Record<string, string> = {
  typescript: "typescript",
  javascript: "javascript",
  python: "python",
  rust: "rust",
  go: "go",
  html: "markup",
  css: "css",
  sql: "sql",
  json: "json",
  markdown: "markdown",
  cpp: "cpp",
  csharp: "csharp",
  java: "java",
  swift: "swift",
  kotlin: "kotlin",
  php: "php",
  bash: "bash",
  yaml: "yaml",
  dockerfile: "docker",
};

export function highlightCode(code: string, language: string): string {
  try {
    const targetLang = langMap[language] || "javascript";
    const grammar = Prism.languages[targetLang] || Prism.languages.javascript;
    if (!grammar) {
      return escapeHtml(code);
    }
    return Prism.highlight(code, grammar, targetLang);
  } catch (err) {
    console.error("Syntax highlighting error:", err);
    return escapeHtml(code);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Splits syntax-highlighted HTML string into individual lines while strictly
 * preserving tag stacks across newlines (prevents unclosed or mismatched <span> tags).
 */
export function splitHighlightedHtmlIntoLines(html: string): string[] {
  const lines: string[] = [];
  const openTags: { name: string; openTag: string }[] = [];
  let currentLine = "";

  const tagRegex = /(<\/?([a-zA-Z0-9_-]+)(?:\s+[^>]*?)?>)|(\n)|([^<\n]+)/g;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(html)) !== null) {
    const [, fullTag, tagName, newline, text] = match;

    if (newline) {
      // Close all open tags for this line in reverse order
      for (let i = openTags.length - 1; i >= 0; i--) {
        currentLine += `</${openTags[i].name}>`;
      }
      lines.push(currentLine);

      // Re-open all open tags at start of next line
      currentLine = "";
      for (let i = 0; i < openTags.length; i++) {
        currentLine += openTags[i].openTag;
      }
    } else if (fullTag) {
      currentLine += fullTag;
      if (fullTag.startsWith("</")) {
        openTags.pop();
      } else if (!fullTag.endsWith("/>")) {
        openTags.push({ name: tagName, openTag: fullTag });
      }
    } else if (text) {
      currentLine += text;
    }
  }

  // Close remaining tags for the final line
  for (let i = openTags.length - 1; i >= 0; i--) {
    currentLine += `</${openTags[i].name}>`;
  }
  lines.push(currentLine);

  return lines;
}
