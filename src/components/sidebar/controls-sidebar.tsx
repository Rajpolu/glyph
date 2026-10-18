"use client";

import React, { useState } from "react";
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
import { GradientEditor } from "../toolbar/gradient-editor";
import {
  X,
  SlidersHorizontal,
  Palette,
  SunMoon,
  Type,
  Layout,
  Layers,
  RotateCcw,
  Search,
  Check,
  Shield,
  Focus,
  GitCompare,
  Plus,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface ControlsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  state: SnippetState;
  onChange: (updates: Partial<SnippetState>) => void;
}

type SidebarTab = "gradient" | "appearance" | "layout" | "features";

export function ControlsSidebar({
  isOpen,
  onClose,
  state,
  onChange,
}: ControlsSidebarProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<SidebarTab>("gradient");
  const [langSearch, setLangSearch] = useState("");
  const [themeSearch, setThemeSearch] = useState("");
  const [bgMode, setBgMode] = useState<"custom" | "presets">(
    state.background === "custom" ? "custom" : "custom" // Default to the powerful custom gradient editor!
  );

  const currentTheme = THEMES.find((t) => t.id === state.theme) || THEMES[0];
  const currentLang = LANGUAGES.find((l) => l.id === state.language) || LANGUAGES[0];
  const currentBg =
    state.background === "custom" && state.customBgValue
      ? { id: "custom", name: "Custom Gradient", preview: state.customBgValue }
      : BACKGROUNDS.find((b) => b.id === state.background) || BACKGROUNDS[0];

  const filteredLanguages = LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(langSearch.toLowerCase())
  );

  const filteredThemes = THEMES.filter((t) =>
    t.name.toLowerCase().includes(themeSearch.toLowerCase())
  );

  const handleCustomGradientChange = (css: string) => {
    onChange({
      background: "custom",
      customBgValue: css,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Logo image must be smaller than 2MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange({ customWatermarkLogo: event.target?.result as string });
        showToast("Watermark logo uploaded!", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
      />

      {/* Main Sidebar Drawer (Top-Left Sidebar Anchor, ONLY at sidebar) */}
      <aside
        role="dialog"
        aria-label="Studio Controls Sidebar"
        className={cn(
          "fixed top-0 left-0 bottom-0 z-50 w-80 sm:w-88 md:w-96 bg-[#0f1118]/95 border-r border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl flex flex-col transition-transform duration-300 ease-out select-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* 1. Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Studio Controls</h2>
              <p className="text-[10px] text-slate-400 font-sans">Customizer & Gradient Studio</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Semantic Tab Switcher */}
        <div className="grid grid-cols-4 gap-1 p-2 border-b border-white/5 bg-black/20">
          <button
            type="button"
            onClick={() => setActiveTab("gradient")}
            className={cn(
              "flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl text-[10px] font-semibold transition-all cursor-pointer",
              activeTab === "gradient"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Gradient</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("appearance")}
            className={cn(
              "flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl text-[10px] font-semibold transition-all cursor-pointer",
              activeTab === "appearance"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <SunMoon className="w-3.5 h-3.5" />
            <span>Theme</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("layout")}
            className={cn(
              "flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl text-[10px] font-semibold transition-all cursor-pointer",
              activeTab === "layout"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Layout</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("features")}
            className={cn(
              "flex flex-col items-center gap-1 py-1.5 px-1 rounded-xl text-[10px] font-semibold transition-all cursor-pointer",
              activeTab === "features"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Modes</span>
          </button>
        </div>

        {/* 3. Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* TAB 1: GRADIENT & BACKGROUND */}
          {activeTab === "gradient" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Mode Toggle: Gradient Editor vs Curated Presets */}
              <div className="flex items-center justify-between bg-white/5 p-1 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setBgMode("custom")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                    bgMode === "custom"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  Gradient Editor
                </button>
                <button
                  type="button"
                  onClick={() => setBgMode("presets")}
                  className={cn(
                    "flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                    bgMode === "presets"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  )}
                >
                  Preset Library
                </button>
              </div>

              {bgMode === "custom" ? (
                /* The New Gradient Editor Tool with Scrubber Sliders and Color Picker */
                <GradientEditor
                  value={state.customBgValue || (state.background !== "custom" ? currentBg.preview : undefined)}
                  onChange={handleCustomGradientChange}
                />
              ) : (
                /* Preset Library Grid */
                <div className="space-y-2">
                  <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                    Curated Presets ({BACKGROUNDS.length})
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => {
                          onChange({ background: bg.id, customBgValue: undefined });
                        }}
                        className={cn(
                          "h-14 rounded-xl relative overflow-hidden transition-all flex flex-col justify-end p-1.5 shadow-md cursor-pointer border",
                          state.background === bg.id
                            ? "ring-2 ring-indigo-400 border-transparent scale-105"
                            : "border-white/10 hover:border-white/30 hover:scale-102"
                        )}
                        style={{ background: bg.preview }}
                      >
                        <span className="text-[10px] font-semibold text-white drop-shadow bg-black/40 px-1 rounded truncate backdrop-blur-xs">
                          {bg.name}
                        </span>
                        {state.background === bg.id && (
                          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: APPEARANCE (Themes, Languages, Window Style) */}
          {activeTab === "appearance" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Programming Language */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Language</span>
                  <span className="text-indigo-400 font-mono text-[11px]">{currentLang.name}</span>
                </label>
                <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search language..."
                    value={langSearch}
                    onChange={(e) => setLangSearch(e.target.value)}
                    className="w-full bg-transparent text-xs text-white placeholder-slate-500 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto no-scrollbar pt-1">
                  {filteredLanguages.slice(0, 16).map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => {
                        onChange({
                          language: lang.id,
                          title: state.title.split(".")[0] + `.${lang.extension}`,
                        });
                      }}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-1.5 text-xs rounded-xl transition-all cursor-pointer text-left",
                        state.language === lang.id
                          ? "bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30"
                          : "bg-white/[0.03] text-slate-300 hover:bg-white/10"
                      )}
                    >
                      <span className="truncate">{lang.name}</span>
                      {state.language === lang.id && <Check className="w-3 h-3 text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shiki Syntax Theme */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Syntax Theme</span>
                  <span className="text-indigo-400 text-[11px]">{currentTheme.name}</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto no-scrollbar">
                  {THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => onChange({ theme: theme.id })}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-xl text-xs transition-all cursor-pointer text-left border",
                        state.theme === theme.id
                          ? "bg-white/15 text-white border-white/30 font-semibold shadow-sm"
                          : "bg-white/[0.03] text-slate-300 border-transparent hover:bg-white/10"
                      )}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full shrink-0 ring-1 ring-white/20 shadow-sm"
                        style={{ backgroundColor: theme.bgPreview }}
                      />
                      <span className="truncate">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Window Style */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <label className="text-xs font-semibold text-slate-300">Window Header Style</label>
                <div className="grid grid-cols-4 gap-1 bg-white/5 p-1 rounded-xl text-xs font-medium">
                  {(["mac", "windows", "minimal", "none"] as const).map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => onChange({ windowStyle: style })}
                      className={cn(
                        "py-1.5 capitalize rounded-lg transition-all cursor-pointer",
                        state.windowStyle === style
                          ? "bg-indigo-600 text-white font-semibold shadow-sm"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LAYOUT & TYPOGRAPHY */}
          {activeTab === "layout" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Padding Scrubber */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Canvas Padding</span>
                  <span className="font-mono text-indigo-400">{state.padding}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="128"
                  step="8"
                  value={state.padding}
                  onChange={(e) => onChange({ padding: parseInt(e.target.value, 10) })}
                  aria-label="Canvas padding scrubber"
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-ew-resize accent-indigo-500"
                />
                <div className="grid grid-cols-5 gap-1 pt-0.5">
                  {[16, 32, 48, 64, 96].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onChange({ padding: p })}
                      className={cn(
                        "py-0.5 text-[10px] font-mono rounded transition-all cursor-pointer",
                        state.padding === p
                          ? "bg-indigo-600 text-white font-bold"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      )}
                    >
                      {p}px
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <label className="text-xs font-semibold text-slate-300">Code Font</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => onChange({ fontFamily: font.id })}
                      className={cn(
                        "py-2 px-2.5 rounded-xl text-xs transition-all cursor-pointer text-left border",
                        state.fontFamily === font.id
                          ? "bg-indigo-600 text-white border-indigo-500 font-semibold shadow-sm"
                          : "bg-white/5 text-slate-300 border-transparent hover:bg-white/10"
                      )}
                    >
                      <span>{font.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Scrubber */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Font Size</span>
                  <span className="font-mono text-indigo-400">{state.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="11"
                  max="24"
                  value={state.fontSize}
                  onChange={(e) => onChange({ fontSize: parseInt(e.target.value, 10) })}
                  aria-label="Font size scrubber"
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-ew-resize accent-indigo-500"
                />
              </div>

              {/* Drop Shadow Preset */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <label className="text-xs font-semibold text-slate-300">Drop Shadow Elevation</label>
                <div className="grid grid-cols-4 gap-1 bg-white/5 p-1 rounded-xl text-xs font-medium">
                  {SHADOW_OPTIONS.map((shadow) => (
                    <button
                      key={shadow.id}
                      type="button"
                      onClick={() => onChange({ dropShadow: shadow.id })}
                      className={cn(
                        "py-1.5 capitalize rounded-lg transition-all cursor-pointer",
                        state.dropShadow === shadow.id
                          ? "bg-indigo-600 text-white font-semibold shadow-sm"
                          : "text-slate-400 hover:text-white"
                      )}
                    >
                      {shadow.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Window Opacity */}
              <div className="space-y-1.5 pt-2 border-t border-white/5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Window Opacity</span>
                  <span className="font-mono text-indigo-400">{state.opacity ?? 100}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={state.opacity ?? 100}
                  onChange={(e) => onChange({ opacity: parseInt(e.target.value, 10) })}
                  aria-label="Window opacity scrubber"
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-ew-resize accent-indigo-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: FEATURES & MODES */}
          {activeTab === "features" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Line Numbers Switch */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-200 font-semibold">Line Numbers</span>
                  <span className="text-[10px] text-slate-400">Show line count column</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={state.showLineNumbers}
                  onClick={() => onChange({ showLineNumbers: !state.showLineNumbers })}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors",
                    state.showLineNumbers ? "bg-indigo-600" : "bg-white/15"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white shadow mt-0.5 transition-transform",
                      state.showLineNumbers ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>

              {/* Git Diff Mode Switch */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-200 font-semibold">Git Diff Mode</span>
                  <span className="text-[10px] text-slate-400">Tint added (+) and removed (-) lines</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={state.highlightDiffs}
                  onClick={() => onChange({ highlightDiffs: !state.highlightDiffs })}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors",
                    state.highlightDiffs ? "bg-indigo-600" : "bg-white/15"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white shadow mt-0.5 transition-transform",
                      state.highlightDiffs ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>

              {/* Auto Redact Secrets Switch */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-200 font-semibold">Secrets Auto-Redact</span>
                  <span className="text-[10px] text-slate-400">Mask keys, tokens & env vars</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={state.autoBlurSecrets}
                  onClick={() => onChange({ autoBlurSecrets: !state.autoBlurSecrets })}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors",
                    state.autoBlurSecrets ? "bg-purple-600" : "bg-white/15"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white shadow mt-0.5 transition-transform",
                      state.autoBlurSecrets ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>

              {/* Carousel Studio Mode */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-200 font-semibold">Carousel Studio</span>
                  <span className="text-[10px] text-slate-400">Multi-slide deck for social posts</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={state.isCarousel}
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
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors",
                    state.isCarousel ? "bg-pink-600" : "bg-white/15"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-4 w-4 transform rounded-full bg-white shadow mt-0.5 transition-transform",
                      state.isCarousel ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>

              {/* Watermark Branding */}
              <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-200 font-semibold">Watermark Branding</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={state.showWatermark}
                    onClick={() => onChange({ showWatermark: !state.showWatermark })}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors",
                      state.showWatermark ? "bg-indigo-600" : "bg-white/15"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white shadow mt-0.5 transition-transform",
                        state.showWatermark ? "translate-x-4" : "translate-x-0.5"
                      )}
                    />
                  </button>
                </div>

                {state.showWatermark && (
                  <div className="space-y-2 pt-1 border-t border-white/5 text-xs">
                    <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-lg text-[10px]">
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
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. Sidebar Footer Action: Reset Defaults */}
        <div className="p-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
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
              showToast("Preferences reset to defaults", "info");
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer py-1.5 px-2.5 rounded-xl hover:bg-white/5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <span className="text-[10px] font-mono text-slate-500">v1.0 Studio</span>
        </div>
      </aside>
    </>
  );
}
