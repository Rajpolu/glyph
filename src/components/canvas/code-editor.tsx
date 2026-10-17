"use client";

import React, { useRef, useMemo } from "react";
import { SnippetState, FONT_OPTIONS, THEMES } from "@/lib/presets";
import { highlightCode, splitHighlightedHtmlIntoLines } from "@/lib/highlighter";
import { detectSecrets, maskSecretsInLineHtml } from "@/lib/secrets";
import { cn } from "@/lib/utils";

interface CodeEditorProps {
  state: SnippetState;
  onChange: (updates: Partial<SnippetState>) => void;
}

export function CodeEditor({ state, onChange }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastClickedLineRef = useRef<number | null>(null);

  const lines = useMemo(() => state.code.split("\n"), [state.code]);
  const currentTheme = THEMES.find((t) => t.id === state.theme) || THEMES[0];
  const fontConfig = FONT_OPTIONS.find((f) => f.id === state.fontFamily) || FONT_OPTIONS[0];

  // Synchronous, zero-latency syntax highlighting
  const highlightedHtml = useMemo(() => {
    return highlightCode(state.code, state.language);
  }, [state.code, state.language]);

  // Split highlighted HTML into robust, tag-balanced lines
  const highlightedLines = useMemo(() => {
    return splitHighlightedHtmlIntoLines(highlightedHtml);
  }, [highlightedHtml]);

  // Detect active secrets from regex auto-detection + custom blurred tokens
  const activeSecrets = useMemo(() => {
    const list = new Set<string>(state.blurredTokens || []);
    if (state.autoBlurSecrets) {
      const auto = detectSecrets(state.code);
      auto.forEach((s) => list.add(s));
    }
    return Array.from(list);
  }, [state.code, state.autoBlurSecrets, state.blurredTokens]);

  // Apply tag-safe secret token masking to highlighted lines
  const displayLines = useMemo(() => {
    if (activeSecrets.length === 0) return highlightedLines;
    return highlightedLines.map((lineHtml) =>
      maskSecretsInLineHtml(lineHtml, activeSecrets)
    );
  }, [highlightedLines, activeSecrets]);

  // Spotlight line focus set
  const focusedSet = useMemo(() => {
    return new Set(state.focusedLines || []);
  }, [state.focusedLines]);
  const hasFocus = focusedSet.size > 0;

  // Toggle or range-select lines to spotlight
  const toggleLineFocus = (lineNum: number, shiftKey: boolean) => {
    const current = state.focusedLines || [];
    let updated: number[];

    if (shiftKey && lastClickedLineRef.current !== null) {
      const start = Math.min(lastClickedLineRef.current, lineNum);
      const end = Math.max(lastClickedLineRef.current, lineNum);
      const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
      const set = new Set([...current, ...range]);
      updated = Array.from(set).sort((a, b) => a - b);
    } else {
      if (current.includes(lineNum)) {
        updated = current.filter((l) => l !== lineNum);
      } else {
        updated = [...current, lineNum].sort((a, b) => a - b);
      }
      lastClickedLineRef.current = lineNum;
    }

    onChange({ focusedLines: updated });
  };

  const clearFocus = () => {
    lastClickedLineRef.current = null;
    onChange({ focusedLines: [] });
  };

  // Handle Tab, Shift+Tab indentation, and Escape to prevent keyboard trap
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      textareaRef.current?.blur();
      if (hasFocus) {
        clearFocus();
      }
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        const beforeCursor = state.code.substring(0, start);
        const afterCursor = state.code.substring(end);
        if (beforeCursor.endsWith("  ")) {
          const newCode = beforeCursor.slice(0, -2) + afterCursor;
          onChange({ code: newCode });
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
                Math.max(0, start - 2);
            }
          }, 0);
        }
      } else {
        const newCode =
          state.code.substring(0, start) + "  " + state.code.substring(end);
        onChange({ code: newCode });
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
              start + 2;
          }
        }, 0);
      }
    }
  };

  // Sync scroll between textarea and highlighted code view
  const handleScroll = () => {
    if (!textareaRef.current || !containerRef.current) return;
    containerRef.current.scrollTop = textareaRef.current.scrollTop;
    containerRef.current.scrollLeft = textareaRef.current.scrollLeft;
  };

  const lineHeight = 1.65;
  const lineSpacing = `${state.fontSize * lineHeight}px`;

  const isWrapped = state.lineWrap !== false;

  return (
    <div
      className="relative flex overflow-hidden text-sm leading-relaxed select-text w-full"
      style={
        {
          "--syn-keyword": currentTheme.tokens.keyword,
          "--syn-string": currentTheme.tokens.string,
          "--syn-function": currentTheme.tokens.function,
          "--syn-number": currentTheme.tokens.number,
          "--syn-comment": currentTheme.tokens.comment,
          "--syn-operator": currentTheme.tokens.operator,
          "--syn-class": currentTheme.tokens.classType,
          "--syn-punctuation": currentTheme.tokens.punctuation,
          "--syn-property": currentTheme.tokens.property,
          "--syn-boolean": currentTheme.tokens.boolean,
          color: currentTheme.textColor,
          fontFamily: fontConfig.fontFamily,
          fontSize: `${state.fontSize}px`,
          lineHeight,
        } as React.CSSProperties
      }
    >
      {/* Code Container */}
      <div
        ref={containerRef}
        className={cn(
          "relative flex-1 min-w-0",
          isWrapped ? "w-full overflow-hidden" : "overflow-x-auto overflow-y-hidden"
        )}
      >
        {/* Instant Highlighted Code View with Spotlight & Git Diff Highlighting */}
        <div
          className={cn(
            "py-4 pointer-events-none select-none",
            isWrapped ? "w-full" : "w-max min-w-full"
          )}
          style={{
            fontFamily: fontConfig.fontFamily,
            fontSize: `${state.fontSize}px`,
            lineHeight,
          }}
        >
          {displayLines.map((lineHtml, idx) => {
            const lineNum = idx + 1;
            const isFocused = hasFocus ? focusedSet.has(lineNum) : true;
            const lineRaw = lines[idx] || "";
            const isAdded = state.highlightDiffs && (lineRaw.startsWith("+ ") || lineRaw.startsWith("+"));
            const isRemoved = state.highlightDiffs && (lineRaw.startsWith("- ") || lineRaw.startsWith("-"));

            return (
              <div
                key={idx}
                style={{ minHeight: lineSpacing }}
                className={cn(
                  "flex items-start transition-colors duration-150 rounded-md relative group/line",
                  !isFocused && "opacity-25 grayscale-[30%]",
                  isFocused && hasFocus && "bg-white/[0.04]",
                  isAdded && "bg-emerald-500/15 text-emerald-200 border-l-2 border-emerald-400",
                  isRemoved && "bg-rose-500/15 text-rose-200 border-l-2 border-rose-400"
                )}
              >
                {/* Line Numbers Column with Click-to-Spotlight UX */}
                {state.showLineNumbers && (
                  <div
                    style={{ height: lineSpacing }}
                    onClick={(e) => toggleLineFocus(lineNum, e.shiftKey)}
                    title="Click to spotlight line (Shift+Click for range)"
                    className={cn(
                      "pointer-events-auto cursor-pointer select-none shrink-0 w-11 pl-3.5 pr-2.5 text-right font-mono flex items-center justify-end z-30 transition-colors",
                      !isFocused && "opacity-25 hover:opacity-80 hover:bg-white/10 hover:text-white",
                      isFocused && hasFocus && "opacity-100 font-bold text-indigo-400 bg-indigo-500/20 shadow-sm rounded",
                      !hasFocus && "opacity-40 hover:opacity-100 hover:text-indigo-300 hover:bg-indigo-500/15",
                      isAdded && "text-emerald-400 font-semibold opacity-95",
                      isRemoved && "text-rose-400 font-semibold opacity-95"
                    )}
                  >
                    {isAdded ? (
                      <span className="text-[11px] font-bold text-emerald-400 mr-0.5">+</span>
                    ) : isRemoved ? (
                      <span className="text-[11px] font-bold text-rose-400 mr-0.5">-</span>
                    ) : null}
                    <span>{lineNum}</span>
                  </div>
                )}

                {/* Code Content */}
                <div
                  className={cn(
                    "flex-1 min-w-0 pr-4",
                    state.showLineNumbers ? "pl-2" : "pl-4",
                    isWrapped
                      ? "whitespace-pre-wrap break-words [word-break:break-word] [overflow-wrap:anywhere]"
                      : "whitespace-pre"
                  )}
                  style={{ minHeight: lineSpacing, lineHeight }}
                >
                  <code
                    dangerouslySetInnerHTML={{ __html: lineHtml || "&nbsp;" }}
                    className="prism-code inline-block w-full"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Interactive Textarea Overlay */}
        <textarea
          ref={textareaRef}
          value={state.code}
          onChange={(e) => onChange({ code: e.target.value })}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          aria-label="Code snippet editor"
          role="textbox"
          aria-multiline="true"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className={cn(
            "absolute inset-0 w-full h-full py-4 resize-none bg-transparent text-transparent caret-indigo-400 selection:bg-indigo-500/35 selection:text-transparent outline-none z-20 font-mono focus:ring-0",
            isWrapped
              ? "whitespace-pre-wrap break-words [word-break:break-word] [overflow-wrap:anywhere] overflow-y-hidden overflow-x-hidden"
              : "whitespace-pre overflow-x-auto overflow-y-hidden"
          )}
          style={{
            fontFamily: fontConfig.fontFamily,
            fontSize: `${state.fontSize}px`,
            lineHeight,
            paddingLeft: state.showLineNumbers ? "52px" : "16px",
            paddingRight: "16px",
            tabSize: 2,
          }}
        />

        {/* Floating Spotlight Reset Pill */}
        {hasFocus && (
          <button
            type="button"
            onClick={clearFocus}
            title="Click to clear spotlight (or press Esc)"
            className="no-export absolute bottom-2 right-3 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white text-[11px] font-mono shadow-lg backdrop-blur-md transition-all cursor-pointer select-none active:scale-95"
          >
            <span>Spotlight: {focusedSet.size} {focusedSet.size === 1 ? "line" : "lines"}</span>
            <span className="opacity-70 hover:opacity-100 font-bold ml-0.5">✕</span>
          </button>
        )}
      </div>
    </div>
  );
}
