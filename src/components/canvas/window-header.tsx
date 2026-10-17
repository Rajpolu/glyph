"use client";

import React, { useState } from "react";
import { SnippetState } from "@/lib/presets";
import { FileCode2, Check, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WindowHeaderProps {
  state: SnippetState;
  onChange: (updates: Partial<SnippetState>) => void;
  isDarkTheme?: boolean;
}

export function WindowHeader({
  state,
  onChange,
  isDarkTheme = true,
}: WindowHeaderProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  if (!state.showWindowControls && !state.title) {
    return null;
  }

  const isWindows = state.windowStyle === "windows";

  return (
    <div
      className={cn(
        "flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 select-none transition-colors gap-2",
        isDarkTheme ? "text-white/70" : "text-black/70"
      )}
    >
      {/* Left controls:
          - Mac / Minimal: Window control dots on left
          - Windows: Language badge on left for balance */}
      <div className="flex items-center gap-2 shrink-0">
        {state.showWindowControls && !isWindows && (
          <>
            {state.windowStyle === "mac" && (
              <div className="flex items-center gap-2 group">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm transition-transform group-hover:scale-105" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm transition-transform group-hover:scale-105" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm transition-transform group-hover:scale-105" />
              </div>
            )}

            {state.windowStyle === "minimal" && (
              <div className="flex items-center gap-1.5 opacity-50">
                <div className="w-2.5 h-2.5 rounded-full bg-current" />
                <div className="w-2.5 h-2.5 rounded-full bg-current" />
                <div className="w-2.5 h-2.5 rounded-full bg-current" />
              </div>
            )}
          </>
        )}

        {isWindows && (
          <span
            className={cn(
              "text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full",
              isDarkTheme
                ? "bg-white/10 text-white/60"
                : "bg-black/5 text-black/60"
            )}
          >
            {state.language}
          </span>
        )}
      </div>

      {/* Editable Title */}
      <div className="flex-1 min-w-0 flex items-center justify-center px-1 sm:px-2">
        {isEditingTitle ? (
          <div className="flex items-center gap-1.5 max-w-xs w-full">
            <input
              type="text"
              value={state.title}
              onChange={(e) => onChange({ title: e.target.value })}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "Escape") {
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
              aria-label="Snippet title"
              className={cn(
                "w-full text-center text-xs font-mono font-medium px-2 py-0.5 rounded-lg outline-none transition-all shadow-inner",
                isDarkTheme
                  ? "bg-white/10 text-white focus:bg-white/15"
                  : "bg-black/5 text-black focus:bg-black/10"
              )}
            />
            <button
              type="button"
              onClick={() => setIsEditingTitle(false)}
              aria-label="Confirm snippet title"
              className="p-1 hover:text-indigo-400 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingTitle(true)}
            aria-label={state.title ? `Rename snippet: ${state.title}` : "Name snippet"}
            className={cn(
              "group/title inline-flex items-center gap-1.5 text-xs font-mono font-medium px-2.5 py-1 rounded-lg hover:bg-white/10 transition-all cursor-pointer max-w-full",
              !state.title && "opacity-0 group-hover:opacity-100"
            )}
            title="Click to rename snippet"
          >
            <FileCode2 className="w-3.5 h-3.5 opacity-50 group-hover/title:opacity-100 transition-opacity shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-[220px]">
              {state.title || "untitled"}
            </span>
            <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover/title:opacity-60 transition-opacity shrink-0" />
          </button>
        )}
      </div>

      {/* Right controls:
          - Windows: Minimize / Maximize / Close controls positioned at top right edge, slightly resized & semi-bold
          - Mac / Minimal: Language tag */}
      <div className="shrink-0 flex items-center justify-end">
        {isWindows ? (
          state.showWindowControls && (
            <div className="flex items-center gap-1.5 sm:gap-2 text-current/80 font-semibold">
              {/* Minimize - semi-bold stroke, slightly resized */}
              <span
                title="Minimize"
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors cursor-default"
              >
                <svg
                  className="w-3.5 h-3.5 stroke-[2.2]"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M1.5 6.5H10.5"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>

              {/* Maximize - semi-bold stroke, slightly resized */}
              <span
                title="Maximize"
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors cursor-default"
              >
                <svg
                  className="w-3.5 h-3.5 stroke-[2]"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <rect
                    x="1.5"
                    y="1.5"
                    width="9"
                    height="9"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </span>

              {/* Close - semi-bold stroke, slightly resized */}
              <span
                title="Close"
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-rose-500/20 hover:text-rose-400 transition-colors cursor-default"
              >
                <svg
                  className="w-3.5 h-3.5 stroke-[2.2]"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2.2 2.2L9.8 9.8M9.8 2.2L2.2 9.8"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </div>
          )
        ) : (
          <span
            className={cn(
              "text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full",
              isDarkTheme
                ? "bg-white/10 text-white/60"
                : "bg-black/5 text-black/60"
            )}
          >
            {state.language}
          </span>
        )}
      </div>
    </div>
  );
}
