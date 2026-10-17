"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  SnippetState,
  THEMES,
  BACKGROUNDS,
  LANGUAGES,
  PADDING_OPTIONS,
  FONT_OPTIONS,
  SHADOW_OPTIONS,
  DEFAULT_STATE,
} from "@/lib/presets";
import {
  MoreHorizontal,
  ChevronDown,
  Check,
  Search,
  Type,
  Layout,
  SunMoon,
  X,
  RotateCcw,
  Plus,
  SlidersHorizontal,
  GitCompare,
  Focus,
  Shield,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface ControlsToolbarProps {
  state: SnippetState;
  onChange: (updates: Partial<SnippetState>) => void;
}

export function ControlsToolbar({ state, onChange }: ControlsToolbarProps) {
  const { showToast } = useToast();
  const [openDropdown, setOpenDropdown] = useState<
    "lang" | "theme" | "bg" | "settings" | null
  >(null);
  const [langSearch, setLangSearch] = useState("");

  const toolbarRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);

  // Close any open dropdown on click/touch outside or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Custom Background Creator State
  const [showCustomBg, setShowCustomBg] = useState(false);
  const [customBgType, setCustomBgType] = useState<"gradient" | "solid">("gradient");
  const [customColor1, setCustomColor1] = useState("#ec4899");
  const [customColor2, setCustomColor2] = useState("#6366f1");
  const [customAngle, setCustomAngle] = useState("135deg");
  const [customSolidColor, setCustomSolidColor] = useState("#0f172a");

  const currentTheme = THEMES.find((t) => t.id === state.theme) || THEMES[0];
  const currentLang =
    LANGUAGES.find((l) => l.id === state.language) || LANGUAGES[0];
  const currentBg =
    state.background === "custom" && state.customBgValue
      ? { id: "custom", name: "Custom", preview: state.customBgValue }
      : BACKGROUNDS.find((b) => b.id === state.background) || BACKGROUNDS[0];

  const filteredLanguages = LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(langSearch.toLowerCase())
  );

  const applyCustomGradient = (c1: string, c2: string, a: string) => {
    setCustomColor1(c1);
    setCustomColor2(c2);
    setCustomAngle(a);
    const css = `linear-gradient(${a}, ${c1} 0%, ${c2} 100%)`;
    onChange({ background: "custom", customBgValue: css });
  };

  const applyCustomSolid = (color: string) => {
    setCustomSolidColor(color);
    onChange({ background: "custom", customBgValue: color });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please upload a logo under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        onChange({
          watermarkType: "customLogo",
          customWatermarkLogo: dataUrl,
          showWatermark: true,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const gradientPresets = [
    { name: "Sunset Pink", c1: "#f59e0b", c2: "#ec4899" },
    { name: "Cyber Violet", c1: "#06b6d4", c2: "#8b5cf6" },
    { name: "Neon Emerald", c1: "#10b981", c2: "#6366f1" },
    { name: "Bubblegum", c1: "#f43f5e", c2: "#a855f7" },
    { name: "Deep Cosmic", c1: "#1e1b4b", c2: "#6d28d9" },
    { name: "Electric Amber", c1: "#f97316", c2: "#db2777" },
  ];

  const solidPresets = [
    "#090a0f",
    "#0f172a",
    "#18181b",
    "#1e1b4b",
    "#064e3b",
    "#4a044e",
    "#1e293b",
    "#312e81",
  ];

  return (
    <div className="sticky top-16 z-40 flex items-center justify-center w-full px-2 sm:px-4 py-1.5 sm:py-2 pointer-events-none">
      {/* Outer Dock Wrapper - Frosted glassmorphic island dock */}
      <div
        ref={toolbarRef}
        className="relative z-50 max-w-full rounded-2xl bg-[#0f1118]/85 border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.65)] backdrop-blur-2xl p-1 sm:p-1.5 pointer-events-auto"
      >
        {/* Horizontally Scrollable Track with 3 Grouped Semantic Islands */}
        <div
          ref={scrollTrackRef}
          className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x px-1 py-0.5"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x",
            overscrollBehaviorX: "contain",
          }}
        >
          {/* =========================================================
              ISLAND 1: APPEARANCE (Theme, Background, Language)
              ========================================================= */}
          <div className="flex items-center bg-white/[0.03] border border-white/[0.06] rounded-xl p-0.5 shrink-0 gap-0.5">
            {/* 1. Theme Button */}
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "theme" ? null : "theme")
              }
              aria-label="Select theme"
              aria-expanded={openDropdown === "theme"}
              aria-haspopup="listbox"
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 whitespace-nowrap",
                openDropdown === "theme"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              )}
            >
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm ring-1 ring-white/25"
                style={{ backgroundColor: currentTheme.bgPreview }}
              />
              <span className="font-semibold text-white truncate max-w-[76px] sm:max-w-none">
                {currentTheme.name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {/* 2. Background Button */}
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "bg" ? null : "bg")}
              aria-label="Select background gradient or color"
              aria-expanded={openDropdown === "bg"}
              aria-haspopup="dialog"
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 whitespace-nowrap",
                openDropdown === "bg"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              )}
            >
              <div
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm ring-1 ring-white/25"
                style={{ background: currentBg.preview }}
              />
              <span className="font-semibold text-white hidden sm:inline">
                {currentBg.name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {/* 3. Language Button */}
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "lang" ? null : "lang")
              }
              aria-label="Select programming language"
              aria-expanded={openDropdown === "lang"}
              aria-haspopup="listbox"
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 whitespace-nowrap",
                openDropdown === "lang"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-slate-200 hover:bg-white/10 hover:text-white"
              )}
            >
              <span className="font-semibold text-white truncate max-w-[76px] sm:max-w-none">
                {currentLang.name}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>
          </div>

          {/* =========================================================
              ISLAND 2: STUDIO MODES (Diff, Spotlight, Redact, Deck)
              Icon-first minimalist buttons with clean active state glows
              ========================================================= */}
          <div className="flex items-center bg-white/[0.03] border border-white/[0.06] rounded-xl p-0.5 shrink-0 gap-1">
            {/* Git Diff Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !state.highlightDiffs;
                onChange({ highlightDiffs: next });
                showToast(next ? "Git Diff mode enabled" : "Git Diff mode disabled", "info");
              }}
              aria-label="Toggle Git Diff Mode"
              title={state.highlightDiffs ? "Git Diff mode is ON (+ and - lines highlighted)" : "Git Diff mode: highlight additions (+) and deletions (-)"}
              className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 active:scale-95",
                state.highlightDiffs
                  ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              )}
            >
              <GitCompare className="w-4 h-4" />
              {state.highlightDiffs && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>

            {/* Spotlight / Line Focus Toggle */}
            <button
              type="button"
              onClick={() => {
                if ((state.focusedLines?.length ?? 0) > 0) {
                  onChange({ focusedLines: [] });
                  showToast("Line spotlight cleared", "info");
                } else {
                  const total = state.code.split("\n").length;
                  const start = Math.max(1, Math.min(3, total));
                  const end = Math.min(total, start + 3);
                  const sampleLines = Array.from({ length: end - start + 1 }, (_, i) => start + i);
                  onChange({ focusedLines: sampleLines });
                  showToast(`Spotlight focused on ${sampleLines.length} lines`, "info");
                }
              }}
              aria-label="Toggle Line Spotlight Focus"
              title={
                (state.focusedLines?.length ?? 0) > 0
                  ? `Spotlight active on ${state.focusedLines?.length} line(s). Click to clear.`
                  : "Spotlight Focus: dim surrounding lines to highlight key code"
              }
              className={cn(
                "relative flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 active:scale-95 gap-1",
                (state.focusedLines?.length ?? 0) > 0
                  ? "bg-indigo-600/30 text-indigo-300 ring-1 ring-indigo-500/50 shadow-[0_0_12px_rgba(99,102,241,0.3)]"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              )}
            >
              <Focus className="w-4 h-4 shrink-0" />
              {(state.focusedLines?.length ?? 0) > 0 && (
                <span className="text-[10px] font-mono font-bold px-1 rounded bg-indigo-500/30 text-indigo-200">
                  {state.focusedLines?.length}
                </span>
              )}
            </button>

            {/* Secrets Auto-Redaction Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !state.autoBlurSecrets;
                onChange({ autoBlurSecrets: next });
                showToast(next ? "Secrets auto-redaction active" : "Secrets redaction disabled", "info");
              }}
              aria-label="Toggle Secrets Auto-Redaction"
              title={state.autoBlurSecrets ? "Secrets Redaction is ON (API keys & passwords blurred)" : "Secrets Auto-Redact: auto-blur sensitive API keys, tokens & passwords"}
              className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 active:scale-95",
                state.autoBlurSecrets
                  ? "bg-purple-600/25 text-purple-300 ring-1 ring-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              )}
            >
              {state.autoBlurSecrets ? (
                <ShieldCheck className="w-4 h-4 text-purple-400" />
              ) : (
                <Shield className="w-4 h-4" />
              )}
              {state.autoBlurSecrets && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-400" />
              )}
            </button>

            {/* Carousel Deck Mode Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextVal = !state.isCarousel;
                const slides = state.slides && state.slides.length > 0
                  ? state.slides
                  : [
                      {
                        id: "slide_1",
                        code: state.code,
                        title: state.title,
                        language: state.language,
                        focusedLines: state.focusedLines,
                      },
                    ];
                onChange({ isCarousel: nextVal, slides, activeSlideIndex: 0 });
                showToast(nextVal ? "Carousel Studio enabled" : "Carousel Studio disabled", "info");
              }}
              aria-label="Toggle Multi-Slide Carousel Deck Mode"
              title={state.isCarousel ? "Carousel Studio is ON" : "Carousel Studio: create multi-slide decks for LinkedIn & social posts"}
              className={cn(
                "relative flex items-center justify-center min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 active:scale-95 gap-1",
                state.isCarousel
                  ? "bg-pink-600/25 text-pink-300 ring-1 ring-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.25)]"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              )}
            >
              <Layers className="w-4 h-4 shrink-0 text-pink-400" />
              {state.isCarousel && (
                <span className="text-[10px] font-mono font-bold px-1 rounded bg-pink-500/30 text-pink-200">
                  {state.slides?.length || 1}
                </span>
              )}
            </button>
          </div>

          {/* =========================================================
              ISLAND 3: FRAME & SETTINGS (Padding + More Settings ...)
              ========================================================= */}
          <div className="flex items-center bg-white/[0.03] border border-white/[0.06] rounded-xl p-0.5 shrink-0 gap-0.5">
            {/* Desktop Padding Pills */}
            <div className="hidden sm:flex items-center p-0.5">
              {PADDING_OPTIONS.map((pad) => (
                <button
                  key={pad.value}
                  type="button"
                  onClick={() => onChange({ padding: pad.value })}
                  aria-label={`Set padding to ${pad.label} pixels`}
                  className={cn(
                    "px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-mono font-medium rounded-lg transition-all cursor-pointer shrink-0 whitespace-nowrap",
                    state.padding === pad.value
                      ? "bg-white/20 text-white shadow-sm font-semibold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {pad.label}
                </button>
              ))}
            </div>

            {/* Mobile Compact Padding Cycle Button */}
            <button
              type="button"
              onClick={() => {
                const curIdx = PADDING_OPTIONS.findIndex((p) => p.value === state.padding);
                const nextIdx = (curIdx + 1) % PADDING_OPTIONS.length;
                onChange({ padding: PADDING_OPTIONS[nextIdx].value });
              }}
              aria-label={`Padding: ${state.padding}px. Tap to cycle.`}
              title="Tap to cycle padding"
              className="sm:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono font-medium text-slate-200 transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <span className="text-[10px] text-slate-400 font-sans font-normal">Pad</span>
              <span className="text-white font-semibold">{state.padding}</span>
            </button>

            {/* More Settings (...) Trigger Button */}
            <button
              type="button"
              onClick={() =>
                setOpenDropdown(openDropdown === "settings" ? null : "settings")
              }
              aria-label="More preferences and settings"
              aria-expanded={openDropdown === "settings"}
              aria-haspopup="dialog"
              title="More settings (Window style, Shadows, Fonts, Watermarks)"
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none shrink-0",
                openDropdown === "settings"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              )}
            >
              <MoreHorizontal className="w-4 h-4 text-slate-200" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            DROPDOWNS CONTAINER: Rendered OUTSIDE scrollTrackRef so they NEVER clip
            and NEVER interfere with horizontal scrolling!
           ========================================================================= */}

        {/* 1. Theme Dropdown */}
        {openDropdown === "theme" && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-1/2 -translate-x-1/2 sm:left-2 sm:translate-x-0 top-full mt-2 w-52 max-w-[calc(100vw-24px)] rounded-2xl bg-[#161822] shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-1.5 z-50 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95"
          >
            <div className="text-[10px] uppercase font-semibold text-slate-400 px-3 py-1">
              Editor Themes
            </div>
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  onChange({ theme: theme.id });
                  setOpenDropdown(null);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-1.5 text-xs rounded-xl transition-all text-left cursor-pointer",
                  state.theme === theme.id
                    ? "bg-indigo-600/30 text-indigo-300 font-medium"
                    : "text-slate-300 hover:bg-white/5"
                )}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: theme.bgPreview }}
                />
                <span className="flex-1">{theme.name}</span>
                {state.theme === theme.id && (
                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* 2. Background Dropdown */}
        {openDropdown === "bg" && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-1/2 -translate-x-1/2 sm:left-4 sm:translate-x-0 top-full mt-2 w-76 sm:w-80 max-w-[calc(100vw-24px)] rounded-2xl bg-[#161822] shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-3 z-50 animate-in fade-in zoom-in-95 flex flex-col gap-3"
          >
            {/* Header Switch: Presets vs Custom */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowCustomBg(false)}
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                    !showCustomBg
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  Presets
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomBg(true);
                    if (state.background !== "custom") {
                      const bgCss =
                        customBgType === "gradient"
                          ? `linear-gradient(${customAngle}, ${customColor1} 0%, ${customColor2} 100%)`
                          : customSolidColor;
                      onChange({ background: "custom", customBgValue: bgCss });
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer",
                    showCustomBg
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/25"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  <Plus className="w-3 h-3" />
                  <span>Custom</span>
                </button>
              </div>

              <span className="text-[10px] text-slate-500 font-mono">
                {state.background === "custom" ? "Custom Mode" : "Presets Mode"}
              </span>
            </div>

            {!showCustomBg ? (
              /* Presets Grid */
              <div>
                <div className="grid grid-cols-4 gap-2">
                  {/* + Create Custom Background Tile */}
                  <button
                    type="button"
                    title="Create custom solid or gradient background"
                    onClick={() => {
                      setShowCustomBg(true);
                      if (state.background !== "custom") {
                        const bgCss =
                          customBgType === "gradient"
                            ? `linear-gradient(${customAngle}, ${customColor1} 0%, ${customColor2} 100%)`
                            : customSolidColor;
                        onChange({
                          background: "custom",
                          customBgValue: bgCss,
                        });
                      }
                    }}
                    className={cn(
                      "w-14 h-10 rounded-xl relative overflow-hidden transition-all flex flex-col items-center justify-center shadow-md cursor-pointer border border-dashed border-white/20 hover:border-indigo-400 bg-white/5 hover:bg-white/10 group",
                      state.background === "custom" &&
                        "ring-2 ring-indigo-400 bg-indigo-600/20"
                    )}
                  >
                    <Plus className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
                    <span className="text-[9px] text-slate-400 font-medium">
                      Custom
                    </span>
                  </button>

                  {/* Presets */}
                  {BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      title={bg.name}
                      onClick={() => {
                        onChange({ background: bg.id, customBgValue: undefined });
                        setOpenDropdown(null);
                      }}
                      className={cn(
                        "w-14 h-10 rounded-xl relative overflow-hidden transition-all flex items-center justify-center shadow-md cursor-pointer",
                        state.background === bg.id
                          ? "ring-2 ring-indigo-400 scale-105"
                          : "hover:scale-105 hover:opacity-90"
                      )}
                      style={{ background: bg.preview }}
                    >
                      {state.background === bg.id && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Custom Background Interactive Creator */
              <div className="flex flex-col gap-3">
                {/* Gradient vs Solid Mode Toggle */}
                <div className="grid grid-cols-2 gap-1 bg-white/5 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomBgType("gradient");
                      applyCustomGradient(
                        customColor1,
                        customColor2,
                        customAngle
                      );
                    }}
                    className={cn(
                      "py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                      customBgType === "gradient"
                        ? "bg-white/20 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    Gradient
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomBgType("solid");
                      applyCustomSolid(customSolidColor);
                    }}
                    className={cn(
                      "py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                      customBgType === "solid"
                        ? "bg-white/20 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    Solid Color
                  </button>
                </div>

                {/* Live Preview Swatch */}
                <div
                  className="w-full h-11 rounded-xl shadow-inner flex items-center justify-center text-xs font-mono font-medium text-white/90 drop-shadow"
                  style={{
                    background:
                      customBgType === "gradient"
                        ? `linear-gradient(${customAngle}, ${customColor1} 0%, ${customColor2} 100%)`
                        : customSolidColor,
                  }}
                >
                  {customBgType === "gradient"
                    ? `${customColor1} ➔ ${customColor2}`
                    : customSolidColor}
                </div>

                {customBgType === "gradient" ? (
                  <>
                    {/* Color 1 & Color 2 Inputs */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl">
                        <div className="relative w-6 h-6 rounded-lg overflow-hidden shrink-0 cursor-pointer shadow-sm">
                          <div
                            className="w-full h-full"
                            style={{ backgroundColor: customColor1 }}
                          />
                          <input
                            type="color"
                            value={customColor1}
                            onChange={(e) =>
                              applyCustomGradient(
                                e.target.value,
                                customColor2,
                                customAngle
                              )
                            }
                            aria-label="Custom gradient start color"
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={customColor1}
                          onChange={(e) =>
                            applyCustomGradient(
                              e.target.value,
                              customColor2,
                              customAngle
                            )
                          }
                          aria-label="Custom gradient start hex color"
                          className="w-full bg-transparent text-[11px] font-mono text-white outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-xl">
                        <div className="relative w-6 h-6 rounded-lg overflow-hidden shrink-0 cursor-pointer shadow-sm">
                          <div
                            className="w-full h-full"
                            style={{ backgroundColor: customColor2 }}
                          />
                          <input
                            type="color"
                            value={customColor2}
                            onChange={(e) =>
                              applyCustomGradient(
                                customColor1,
                                e.target.value,
                                customAngle
                              )
                            }
                            aria-label="Custom gradient end color"
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={customColor2}
                          onChange={(e) =>
                            applyCustomGradient(
                              customColor1,
                              e.target.value,
                              customAngle
                            )
                          }
                          aria-label="Custom gradient end hex color"
                          className="w-full bg-transparent text-[11px] font-mono text-white outline-none"
                        />
                      </div>
                    </div>

                    {/* Angle Selectors */}
                    <div className="flex items-center justify-between gap-1 bg-white/5 p-1 rounded-xl">
                      {["45deg", "90deg", "135deg", "180deg"].map((ang) => (
                        <button
                          key={ang}
                          type="button"
                          onClick={() =>
                            applyCustomGradient(
                              customColor1,
                              customColor2,
                              ang
                            )
                          }
                          className={cn(
                            "flex-1 py-1 text-[10px] font-mono font-semibold rounded-lg transition-all cursor-pointer",
                            customAngle === ang
                              ? "bg-white/20 text-white shadow-sm"
                              : "text-slate-400 hover:text-white"
                          )}
                        >
                          {ang.replace("deg", "°")}
                        </button>
                      ))}
                    </div>

                    {/* Quick Curated Palettes */}
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                        Curated Palettes
                      </div>
                      <div className="grid grid-cols-6 gap-1.5">
                        {gradientPresets.map((gp) => (
                          <button
                            key={gp.name}
                            type="button"
                            title={gp.name}
                            onClick={() =>
                              applyCustomGradient(gp.c1, gp.c2, customAngle)
                            }
                            className="w-full h-7 rounded-lg shadow transition-transform hover:scale-105 cursor-pointer"
                            style={{
                              background: `linear-gradient(135deg, ${gp.c1} 0%, ${gp.c2} 100%)`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Solid Color Input */}
                    <div className="flex items-center gap-2.5 bg-white/5 p-2 rounded-xl">
                      <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 cursor-pointer shadow-sm">
                        <div
                          className="w-full h-full"
                          style={{ backgroundColor: customSolidColor }}
                        />
                        <input
                          type="color"
                          value={customSolidColor}
                          onChange={(e) => applyCustomSolid(e.target.value)}
                          aria-label="Custom solid color"
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </div>
                      <input
                        type="text"
                        value={customSolidColor}
                        onChange={(e) => applyCustomSolid(e.target.value)}
                        aria-label="Custom solid hex color"
                        className="w-full bg-transparent text-xs font-mono text-white outline-none"
                        placeholder="#0f172a"
                      />
                    </div>

                    {/* Quick Curated Solids */}
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                        Curated Solids
                      </div>
                      <div className="grid grid-cols-8 gap-1">
                        {solidPresets.map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            title={hex}
                            onClick={() => applyCustomSolid(hex)}
                            className={cn(
                              "w-full h-7 rounded-lg shadow transition-transform hover:scale-110 cursor-pointer",
                              customSolidColor === hex &&
                                "ring-2 ring-indigo-400 scale-105"
                            )}
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. Language Dropdown */}
        {openDropdown === "lang" && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-1/2 -translate-x-1/2 sm:left-12 sm:translate-x-0 top-full mt-2 w-56 sm:w-60 max-w-[calc(100vw-24px)] max-h-72 flex flex-col rounded-2xl bg-[#161822] shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden z-50 animate-in fade-in zoom-in-95"
          >
            <div className="p-2.5 flex items-center gap-2 bg-white/5">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search language..."
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                autoFocus
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>
            <div className="overflow-y-auto p-1.5 max-h-56">
              {filteredLanguages.map((lang) => (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => {
                    onChange({
                      language: lang.id,
                      title:
                        state.title.split(".")[0] + `.${lang.extension}`,
                    });
                    setOpenDropdown(null);
                    setLangSearch("");
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-1.5 text-xs rounded-xl transition-all text-left cursor-pointer",
                    state.language === lang.id
                      ? "bg-indigo-600/30 text-indigo-300 font-medium"
                      : "text-slate-300 hover:bg-white/5"
                  )}
                >
                  <span>{lang.name}</span>
                  {state.language === lang.id && (
                    <Check className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. More Preferences Dropdown */}
        {openDropdown === "settings" && (
          <div
            role="dialog"
            aria-label="Editor and Frame Preferences"
            onClick={(e) => e.stopPropagation()}
            className="absolute left-1/2 -translate-x-1/2 sm:right-2 sm:left-auto sm:translate-x-0 top-full mt-2 w-76 sm:w-80 max-w-[calc(100vw-24px)] rounded-2xl bg-[#161822] shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-4 z-50 flex flex-col gap-4 animate-in fade-in zoom-in-95 max-h-[80vh] overflow-y-auto"
          >
            {/* Header with Title and Close Button */}
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                <span className="font-semibold text-xs text-white">
                  Preferences & Settings
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpenDropdown(null)}
                aria-label="Close preferences"
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Window Style */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-slate-400" />
                <span>Window Style</span>
              </label>
              <div className="grid grid-cols-4 gap-1 bg-white/5 p-1 rounded-xl">
                {(["mac", "windows", "minimal", "none"] as const).map(
                  (style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() =>
                        onChange({
                          windowStyle: style,
                          showWindowControls: style !== "none",
                        })
                      }
                      className={cn(
                        "py-1.5 text-[11px] font-medium capitalize rounded-lg transition-all cursor-pointer",
                        state.windowStyle === style
                          ? "bg-white/20 text-white font-semibold shadow-sm"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      {style}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Drop Shadow */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <SunMoon className="w-3.5 h-3.5 text-slate-400" />
                <span>Drop Shadow</span>
              </label>
              <div className="grid grid-cols-4 gap-1 bg-white/5 p-1 rounded-xl">
                {SHADOW_OPTIONS.map((shadow) => (
                  <button
                    key={shadow.id}
                    type="button"
                    onClick={() => onChange({ dropShadow: shadow.id })}
                    className={cn(
                      "py-1.5 text-[11px] font-medium capitalize rounded-lg transition-all cursor-pointer",
                      state.dropShadow === shadow.id
                        ? "bg-white/20 text-white font-semibold shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    {shadow.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Monospace Font Family */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-slate-400" />
                <span>Font Family</span>
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-white/5 p-1.5 rounded-xl">
                {FONT_OPTIONS.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => onChange({ fontFamily: font.id })}
                    className={cn(
                      "py-1.5 px-2.5 text-[11px] font-mono truncate rounded-lg transition-all text-left cursor-pointer",
                      state.fontFamily === font.id
                        ? "bg-white/20 text-white font-semibold shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Font Size Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
                <span>Font Size</span>
                <span className="text-white font-mono font-semibold">
                  {state.fontSize}px
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="20"
                step="1"
                value={state.fontSize}
                onChange={(e) =>
                  onChange({ fontSize: parseInt(e.target.value) })
                }
                aria-label="Font size in pixels"
                className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
              />
            </div>

            {/* Accessible Animated Toggle Switches */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-white/5 text-xs">
              {/* Line Numbers Switch */}
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-200 font-medium">
                  Line Numbers
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={state.showLineNumbers}
                  aria-label="Toggle line numbers"
                  onClick={() =>
                    onChange({ showLineNumbers: !state.showLineNumbers })
                  }
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none",
                    state.showLineNumbers ? "bg-indigo-600" : "bg-white/15"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out mt-0.5",
                      state.showLineNumbers
                        ? "translate-x-4"
                        : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>

              {/* Wrap Code Lines Switch */}
              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="text-slate-200 font-medium">
                    Wrap Code Lines
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Wrap long lines without clipping on resize
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={state.lineWrap !== false}
                  aria-label="Toggle code line wrapping"
                  onClick={() =>
                    onChange({ lineWrap: state.lineWrap === false ? true : false })
                  }
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none",
                    state.lineWrap !== false ? "bg-indigo-600" : "bg-white/15"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out mt-0.5",
                      state.lineWrap !== false
                        ? "translate-x-4"
                        : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>

              {/* Git Diff Mode Switch */}
              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="text-slate-200 font-medium">
                    Git Diff Mode
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Tint added (+) and removed (-) lines
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={state.highlightDiffs}
                  aria-label="Toggle git diff highlighting"
                  onClick={() =>
                    onChange({ highlightDiffs: !state.highlightDiffs })
                  }
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none",
                    state.highlightDiffs ? "bg-indigo-600" : "bg-white/15"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out mt-0.5",
                      state.highlightDiffs
                        ? "translate-x-4"
                        : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>

              {/* Secrets Auto-Redact Switch */}
              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="text-slate-200 font-medium">
                    Secrets Auto-Redact
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Frosted mask on API keys, env vars & tokens
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={state.autoBlurSecrets}
                  aria-label="Toggle secrets redaction"
                  onClick={() =>
                    onChange({ autoBlurSecrets: !state.autoBlurSecrets })
                  }
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-purple-400 outline-none",
                    state.autoBlurSecrets ? "bg-purple-600" : "bg-white/15"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out mt-0.5",
                      state.autoBlurSecrets
                        ? "translate-x-4"
                        : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>

              {/* Multi-Slide Carousel Studio Switch */}
              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="text-slate-200 font-medium">
                    Carousel Studio
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Multi-slide deck for LinkedIn & Instagram
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={state.isCarousel}
                  aria-label="Toggle Carousel mode"
                  onClick={() => {
                    const nextVal = !state.isCarousel;
                    const slides = state.slides && state.slides.length > 0
                      ? state.slides
                      : [
                          {
                            id: "slide_1",
                            code: state.code,
                            title: state.title,
                            language: state.language,
                            focusedLines: state.focusedLines,
                          },
                        ];
                    onChange({ isCarousel: nextVal, slides, activeSlideIndex: 0 });
                  }}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-pink-400 outline-none",
                    state.isCarousel ? "bg-pink-600" : "bg-white/15"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out mt-0.5",
                      state.isCarousel
                        ? "translate-x-4"
                        : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>

              {/* Spotlight Status indicator */}
              {(state.focusedLines?.length ?? 0) > 0 && (
                <div className="flex items-center justify-between py-1.5 px-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <span className="text-indigo-300 font-mono text-[11px]">
                    Spotlight: {state.focusedLines?.length} {state.focusedLines?.length === 1 ? "line" : "lines"}
                  </span>
                  <button
                    type="button"
                    onClick={() => onChange({ focusedLines: [] })}
                    className="text-[11px] font-semibold text-indigo-400 hover:text-white cursor-pointer"
                  >
                    Clear Focus
                  </button>
                </div>
              )}

              {/* Watermark Switch */}
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-200 font-medium">
                  Watermark
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={state.showWatermark}
                  aria-label="Toggle watermark"
                  onClick={() =>
                    onChange({ showWatermark: !state.showWatermark })
                  }
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none",
                    state.showWatermark ? "bg-indigo-600" : "bg-white/15"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out mt-0.5",
                      state.showWatermark
                        ? "translate-x-4"
                        : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>

              {/* Watermark Brand Kit Customization */}
              {state.showWatermark && (
                <div className="flex flex-col gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[11px] font-medium text-slate-300">
                    Watermark Branding
                  </span>
                  <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-lg text-[11px]">
                    {(["default", "customText", "customLogo"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => onChange({ watermarkType: type })}
                        className={cn(
                          "py-1 capitalize rounded-md transition-all cursor-pointer",
                          (state.watermarkType || "default") === type
                            ? "bg-white/20 text-white font-semibold"
                            : "text-slate-400 hover:text-white"
                        )}
                      >
                        {type === "default" ? "Glyph" : type === "customText" ? "Text" : "Logo"}
                      </button>
                    ))}
                  </div>

                  {state.watermarkType === "customText" && (
                    <input
                      type="text"
                      placeholder="@handle or brand.dev"
                      value={state.customWatermarkText || ""}
                      onChange={(e) => onChange({ customWatermarkText: e.target.value })}
                      className="w-full bg-white/5 px-2.5 py-1 text-xs text-white rounded-lg outline-none focus:ring-1 focus:ring-indigo-400 placeholder:text-slate-500 font-mono"
                    />
                  )}

                  {state.watermarkType === "customLogo" && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        {state.customWatermarkLogo ? (
                          <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={state.customWatermarkLogo} alt="Logo" className="h-4 w-auto object-contain rounded" />
                            <button
                              type="button"
                              onClick={() => onChange({ customWatermarkLogo: null })}
                              className="text-[10px] text-rose-400 hover:text-rose-300 cursor-pointer"
                            >
                              ✕ Remove
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center gap-1.5 px-2.5 py-1 text-xs bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-lg cursor-pointer transition-colors">
                            <span>Upload Logo</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/svg+xml,image/webp"
                              className="hidden"
                              onChange={handleLogoUpload}
                            />
                          </label>
                        )}
                        <input
                          type="text"
                          placeholder="Handle (optional)"
                          value={state.customWatermarkText || ""}
                          onChange={(e) => onChange({ customWatermarkText: e.target.value })}
                          className="flex-1 bg-white/5 px-2 py-1 text-xs text-white rounded-lg outline-none focus:ring-1 focus:ring-indigo-400 placeholder:text-slate-500 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Position selector */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Position:</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => onChange({ watermarkPosition: "bottom-left" })}
                        className={cn(
                          "px-2 py-0.5 rounded cursor-pointer transition-colors",
                          state.watermarkPosition === "bottom-left" ? "bg-white/20 text-white font-medium" : "hover:text-white"
                        )}
                      >
                        Left
                      </button>
                      <button
                        type="button"
                        onClick={() => onChange({ watermarkPosition: "bottom-right" })}
                        className={cn(
                          "px-2 py-0.5 rounded cursor-pointer transition-colors",
                          (!state.watermarkPosition || state.watermarkPosition === "bottom-right") ? "bg-white/20 text-white font-medium" : "hover:text-white"
                        )}
                      >
                        Right
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reset to Defaults Action */}
            <div className="pt-2 border-t border-white/5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onChange({
                    windowStyle: DEFAULT_STATE.windowStyle,
                    dropShadow: DEFAULT_STATE.dropShadow,
                    fontFamily: DEFAULT_STATE.fontFamily,
                    fontSize: DEFAULT_STATE.fontSize,
                    showLineNumbers: DEFAULT_STATE.showLineNumbers,
                    showWatermark: DEFAULT_STATE.showWatermark,
                    padding: DEFAULT_STATE.padding,
                  });
                }}
                className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Preferences</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
