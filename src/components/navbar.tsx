"use client";

import React, { useState, useRef, useEffect, useSyncExternalStore } from "react";
import { SnippetState, SAMPLE_SNIPPETS } from "@/lib/presets";
import { encodeSnippetState } from "@/lib/url-state";
import {
  exportToPng,
  exportToSvg,
  copyImageToClipboard,
  fireConfetti,
  exportCarouselToPdf,
  exportCarouselSlidesToPng,
  exportToAnimation,
} from "@/lib/export-image";
import { SnippetVaultModal } from "@/components/modals/snippet-vault-modal";
import { LifetimeProModal } from "@/components/modals/lifetime-pro-modal";
import { useProLicense } from "@/lib/license";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  Copy,
  Download,
  Share2,
  ChevronDown,
  FileCode,
  Loader2,
  Info,
  Bookmark,
  Film,
  Image as ImageIcon,
} from "lucide-react";

interface NavbarProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  state: SnippetState;
  onChange: (updates: Partial<SnippetState>) => void;
  onLoadSnippet?: (state: SnippetState) => void;
  onOpenAbout?: () => void;
}

export function Navbar({ canvasRef, state, onChange, onLoadSnippet, onOpenAbout }: NavbarProps) {
  const { showToast } = useToast();
  const { isPro } = useProLicense();
  const [isExporting, setIsExporting] = useState(false);
  const [isCopyingImage, setIsCopyingImage] = useState(false);
  const [openExportMenu, setOpenExportMenu] = useState(false);
  const [openSampleMenu, setOpenSampleMenu] = useState(false);
  const [openVaultModal, setOpenVaultModal] = useState(false);
  const [openProModal, setOpenProModal] = useState(false);
  const [highlightedProFeature, setHighlightedProFeature] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const supportsWebM = useSyncExternalStore(
    () => () => {},
    () => typeof MediaRecorder !== "undefined" && (
      MediaRecorder.isTypeSupported("video/webm") ||
      MediaRecorder.isTypeSupported("video/webm;codecs=vp8") ||
      MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ),
    () => false
  );

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const sampleMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click or Escape key without blocking page interactions
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(target)
      ) {
        setOpenExportMenu(false);
      }
      if (
        sampleMenuRef.current &&
        !sampleMenuRef.current.contains(target)
      ) {
        setOpenSampleMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenExportMenu(false);
        setOpenSampleMenu(false);
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

  // Auto-open vault modal if ?collection= param is present in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("collection")) {
        const timer = setTimeout(() => setOpenVaultModal(true), 0);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Share OG Preview URL
  const handleShareOgUrl = () => {
    const ogUrl = `${window.location.origin}/api/og?title=${encodeURIComponent(
      state.title
    )}&code=${encodeURIComponent(state.code.slice(0, 800))}&lang=${
      state.language
    }&theme=${state.theme}`;
    navigator.clipboard.writeText(ogUrl).then(
      () => showToast("OG preview URL copied!", "success"),
      () => showToast("Could not copy OG URL to clipboard", "error")
    );
    setOpenExportMenu(false);
  };

  // Export animated WebM
  const handleExportAnimation = async () => {
    if (!canvasRef.current || isAnimating) return;
    setIsAnimating(true);
    setOpenExportMenu(false);
    try {
      const baseName = state.title.replace(/\.[^/.]+$/, "") || "snippet";
      showToast("Rendering animation… (2.5s)", "info");
      await exportToAnimation(
        canvasRef.current,
        `${baseName}.webm`,
        (pct) => {
          if (pct === 100) {
            showToast("Animation ready! Downloading…", "success");
          }
        }
      );
    } catch (err) {
      console.error("Animation export error:", err);
      showToast(
        err instanceof Error ? err.message : "Animation export failed",
        "error"
      );
    } finally {
      setIsAnimating(false);
    }
  };

  // Quick Copy Image
  const handleCopyImage = async () => {
    if (!canvasRef.current || isCopyingImage) return;
    setIsCopyingImage(true);
    try {
      await copyImageToClipboard(canvasRef.current, 2);
      fireConfetti();
      showToast("Image copied to clipboard! (2x Retina)", "success");
    } catch (err: unknown) {
      console.warn("Clipboard copy failed, fallback to download:", err);
      await exportToPng(canvasRef.current, `${state.title || "snippet"}.png`, 2);
      showToast("Downloaded PNG image", "success");
    } finally {
      setIsCopyingImage(false);
    }
  };

  // Share URL
  const handleShareUrl = () => {
    const encoded = encodeSnippetState(state);
    if (!encoded) {
      showToast("Failed to generate share URL", "error");
      return;
    }

    const shareUrl = `${window.location.origin}${window.location.pathname}#${encoded}`;
    window.history.replaceState(null, "", `#${encoded}`);

    navigator.clipboard.writeText(shareUrl).then(
      () => {
        showToast("Snippet link copied to clipboard!", "success");
      },
      () => {
        showToast("Link updated in browser URL bar", "info");
      }
    );
  };

  // Download Action
  const handleDownload = async (format: "png2x" | "png4x" | "svg") => {
    if (!canvasRef.current || isExporting) return;
    setIsExporting(true);
    setOpenExportMenu(false);

    try {
      const baseName = state.title.replace(/\.[^/.]+$/, "") || "snippet";
      if (format === "png2x") {
        await exportToPng(canvasRef.current, `${baseName}-2x.png`, 2);
        showToast("Downloaded 2x PNG", "success");
      } else if (format === "png4x") {
        await exportToPng(canvasRef.current, `${baseName}-4x.png`, 4);
        showToast("Downloaded 4x Ultra HD PNG", "success");
      } else if (format === "svg") {
        await exportToSvg(canvasRef.current, `${baseName}.svg`);
        showToast("Downloaded SVG", "success");
      }
    } catch (err) {
      console.error("Export error:", err);
      showToast("Export failed, please retry", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Export Carousel Multi-Page PDF
  const handleExportCarouselPdf = async () => {
    if (!canvasRef.current || isExporting || !state.slides || state.slides.length === 0) return;
    if (!isPro) {
      setHighlightedProFeature("Multi-Slide Carousel Studio");
      setOpenProModal(true);
      showToast("LinkedIn Carousel PDF is unlocked with Lifetime Pro ($29 one-time)", "info");
      return;
    }
    setIsExporting(true);
    setOpenExportMenu(false);
    try {
      const baseName = state.title.replace(/\.[^/.]+$/, "") || "carousel-deck";
      await exportCarouselToPdf(
        canvasRef.current,
        state.slides.length,
        async (idx) => {
          const slide = state.slides![idx];
          onChange({
            activeSlideIndex: idx,
            code: slide.code,
            title: slide.title || `slide-${idx + 1}.ts`,
            focusedLines: slide.focusedLines || [],
            language: slide.language || state.language,
          });
        },
        `${baseName}.pdf`,
        (cur, total) => {
          showToast(`Rendering slide ${cur} of ${total} into PDF...`, "info");
        }
      );
      fireConfetti();
      showToast("Downloaded LinkedIn Carousel PDF!", "success");
    } catch (err) {
      console.error("PDF export error:", err);
      showToast("Failed to generate PDF carousel", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Export All Slides as PNGs
  const handleExportAllSlidesPng = async () => {
    if (!canvasRef.current || isExporting || !state.slides || state.slides.length === 0) return;
    if (!isPro) {
      setHighlightedProFeature("Multi-Slide Carousel Studio");
      setOpenProModal(true);
      showToast("Batch Slide PNG export is unlocked with Lifetime Pro ($29 one-time)", "info");
      return;
    }
    setIsExporting(true);
    setOpenExportMenu(false);
    try {
      const baseName = state.title.replace(/\.[^/.]+$/, "") || "slide";
      await exportCarouselSlidesToPng(
        canvasRef.current,
        state.slides.length,
        async (idx) => {
          const slide = state.slides![idx];
          onChange({
            activeSlideIndex: idx,
            code: slide.code,
            title: slide.title || `slide-${idx + 1}.ts`,
            focusedLines: slide.focusedLines || [],
            language: slide.language || state.language,
          });
        },
        baseName,
        (cur, total) => {
          showToast(`Exporting slide ${cur} of ${total}...`, "info");
        }
      );
      fireConfetti();
      showToast("Downloaded all carousel slides!", "success");
    } catch (err) {
      console.error("Batch slide export error:", err);
      showToast("Failed to export all slides", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Copy raw code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(state.code);
    showToast("Raw code copied to clipboard", "success");
    setOpenExportMenu(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#090a0f]/80 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-3 sm:px-6 h-16">
        {/* High-Res Vector Brand Logo & Identity */}
        <div className="flex items-center gap-2.5 sm:gap-6 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer select-none shrink-0">
            {/* High-Resolution SVG Geometric Aperture/Prism Logo */}
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 p-1.5 shadow-[0_4px_20px_rgba(99,102,241,0.25)] group-hover:shadow-[0_4px_25px_rgba(99,102,241,0.4)] transition-all flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full transform group-hover:scale-105 transition-transform"
              >
                <defs>
                  <linearGradient id="glyph-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                  <linearGradient id="glyph-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z"
                  stroke="url(#glyph-grad-1)"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M8.5 10L6.5 12L8.5 14"
                  stroke="url(#glyph-grad-2)"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15.5 10L17.5 12L15.5 14"
                  stroke="url(#glyph-grad-2)"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="1.5" fill="#f43f5e" />
              </svg>
            </div>

            {/* Brand Typography */}
            <div className="flex items-center shrink-0">
              <span className="font-extrabold text-base sm:text-lg tracking-[-0.03em] bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                Glyph
              </span>
            </div>
          </div>

          {/* Starter Snippets Menu */}
          <div ref={sampleMenuRef} className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => {
                setOpenSampleMenu(!openSampleMenu);
                setOpenExportMenu(false);
              }}
              aria-label="Starter code templates"
              aria-expanded={openSampleMenu}
              aria-haspopup="menu"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-xl bg-white/5 hover:bg-white/10 transition-all shadow-sm cursor-pointer"
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold">Templates</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {openSampleMenu && (
              <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl bg-[#161822] shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="text-[10px] uppercase font-semibold text-slate-400 px-3 py-1">
                  Starter Templates
                </div>
                {SAMPLE_SNIPPETS.map((sample) => (
                  <button
                    key={sample.label}
                    type="button"
                    onClick={() => {
                      onChange({
                        code: sample.code,
                        language: sample.language,
                        title: sample.filename,
                        focusedLines: sample.focusedLines ?? [],
                        highlightDiffs: sample.highlightDiffs ?? state.highlightDiffs,
                        isCarousel: sample.isCarousel ?? false,
                        slides: sample.slides ?? (sample.isCarousel ? sample.slides : []),
                        activeSlideIndex: 0,
                        autoBlurSecrets: sample.autoBlurSecrets ?? false,
                      });
                      setOpenSampleMenu(false);
                      showToast(`Loaded ${sample.label}`, "info");
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-between cursor-pointer gap-2"
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span className="truncate">
                        {sample.label.replace(/\s*\(Pro\)/i, "")}
                      </span>
                      {sample.label.includes("(Pro)") && (
                        <span className="text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 text-black leading-none uppercase shadow-sm shrink-0 border border-amber-300/30">
                          PRO
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {sample.language}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side Actions: Lifetime Pro, Snippet Vault, About (i), and Dedicated Export button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Lifetime Pro "Get Pro" Button */}
          <button
            type="button"
            onClick={() => {
              setHighlightedProFeature(null);
              setOpenProModal(true);
            }}
            aria-label={isPro ? "Glyph Pro Active" : "Get Pro"}
            title={
              isPro
                ? "Glyph Pro Active — Click to view perks or manage license"
                : "Glyph Lifetime Pro — Unlock Carousel Studio, Secrets Redaction, Custom Watermarks & 4K Export"
            }
            className={cn(
              "group relative flex items-center justify-center px-2.5 sm:px-3.5 h-8 sm:h-8.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none shrink-0 active:scale-95 shadow-sm",
              isPro
                ? "bg-emerald-500/10 hover:bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.08)]"
                : "bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10 hover:border-white/20 backdrop-blur-md shadow-[0_2px_8px_rgba(0,0,0,0.25)] hover:shadow-[0_0_15px_rgba(255,255,255,0.08)]"
            )}
          >
            {isPro && (
              <span className="relative flex h-2 w-2 mr-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
            <span className="font-semibold tracking-tight">
              {isPro ? "Pro Active" : "Get Pro"}
            </span>
          </button>

          {/* Snippet Vault Library Button (Desktop/Tablet only) */}
          <button
            type="button"
            onClick={() => setOpenVaultModal(true)}
            aria-label="Snippet Vault"
            title="Snippet Vault & Collections"
            className="hidden sm:flex items-center justify-center w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 hover:text-white transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-purple-400 outline-none shrink-0"
          >
            <Bookmark className="w-4 h-4 fill-purple-400/20 stroke-purple-400" />
          </button>

          {/* About & Shortcuts i button icon (Desktop/Tablet only) */}
          <button
            type="button"
            onClick={onOpenAbout}
            aria-label="About and keyboard shortcuts"
            title="About & Shortcuts"
            className="hidden sm:flex items-center justify-center w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none shrink-0"
          >
            <Info className="w-4 h-4 text-slate-300 hover:text-white" />
          </button>

          {/* Dedicated Export Button with Gutter Copy Button Icon */}
          <div ref={exportMenuRef} className="relative shrink-0">
          <div className="flex items-stretch h-8 sm:h-8.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_2px_12px_rgba(99,102,241,0.35)] hover:shadow-[0_4px_18px_rgba(99,102,241,0.5)] transition-all">
            {/* Primary Dedicated Export Button */}
            <button
              type="button"
              onClick={() => {
                setOpenExportMenu(!openExportMenu);
                setOpenSampleMenu(false);
              }}
              disabled={isExporting}
              aria-label="Export options"
              aria-expanded={openExportMenu}
              aria-haspopup="menu"
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 h-full text-xs font-semibold text-white hover:bg-white/15 rounded-xl sm:rounded-l-xl sm:rounded-r-none transition-all cursor-pointer select-none active:scale-[0.98]"
            >
              {isExporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Download className="w-3.5 h-3.5 text-white" />
              )}
              <span>Export</span>
              <ChevronDown className="w-3 h-3 text-white/80" />
            </button>

            {/* Divider Gutter (Desktop only) */}
            <div className="hidden sm:block w-[1px] bg-white/20 self-stretch my-1" />

            {/* Gutter Copy Button Icon (Desktop only) */}
            <button
              type="button"
              onClick={handleCopyImage}
              disabled={isCopyingImage}
              title="Copy Image to clipboard (2x Retina)"
              aria-label="Copy image to clipboard"
              className="hidden sm:flex items-center justify-center px-2.5 h-full text-white hover:bg-white/15 rounded-r-xl transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isCopyingImage ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-white" />
              )}
            </button>
          </div>

          {/* Export Dropdown Menu with Image Format Badges */}
          {openExportMenu && (
            <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-[#161822] shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-2 z-50 animate-in fade-in zoom-in-95 flex flex-col gap-1">
              {/* Carousel Deck Export Options */}
              {state.isCarousel && (state.slides?.length || 0) > 1 && (
                <>
                  <div className="text-[10px] uppercase font-bold text-pink-400 px-2.5 py-1 tracking-wider flex items-center justify-between">
                    <span>Carousel Deck ({state.slides?.length} slides)</span>
                    <span className="text-[9px] font-extrabold tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-pink-500 text-black leading-none uppercase shadow-sm border border-amber-300/30">
                      PRO
                    </span>
                  </div>

                  {/* Multi-Page PDF for LinkedIn */}
                  <button
                    type="button"
                    onClick={handleExportCarouselPdf}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-white/10 rounded-xl transition-colors text-left cursor-pointer group bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20"
                  >
                    <span className="min-w-[56px] h-6 px-1.5 flex items-center justify-center font-mono font-bold text-[10px] rounded-lg bg-pink-500 text-white shrink-0 shadow-sm">
                      PDF DECK
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">LinkedIn Carousel PDF</span>
                      <span className="text-[10px] text-pink-300/80">Multi-page document post</span>
                    </div>
                  </button>

                  {/* All Slides as PNGs */}
                  <button
                    type="button"
                    onClick={handleExportAllSlidesPng}
                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-white/10 rounded-xl transition-colors text-left cursor-pointer group"
                  >
                    <span className="min-w-[56px] h-6 px-1.5 flex items-center justify-center font-mono font-bold text-[10px] rounded-lg bg-purple-500/20 text-purple-300 group-hover:bg-purple-500/30 shrink-0 shadow-sm">
                      BATCH
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-white">All Slides (PNG)</span>
                      <span className="text-[10px] text-slate-400">Download each slide image</span>
                    </div>
                  </button>

                  <div className="my-1 border-t border-white/5" />
                </>
              )}

              <div className="text-[10px] uppercase font-bold text-slate-400 px-2.5 py-0.5 tracking-wider">
                {state.isCarousel && (state.slides?.length || 0) > 1 ? "Current Slide Image" : "Save Image"}
              </div>

              {/* 2x PNG with Format Badge */}
              <button
                type="button"
                onClick={() => handleDownload("png2x")}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-white/10 rounded-xl transition-colors text-left cursor-pointer group"
              >
                <span className="min-w-[56px] h-6 px-1.5 flex items-center justify-center font-mono font-bold text-[10px] rounded-lg bg-indigo-500/20 text-indigo-300 group-hover:bg-indigo-500/30 shrink-0 shadow-sm">
                  PNG 2x
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Retina Image</span>
                  <span className="text-[10px] text-slate-400">Crisp social & web export</span>
                </div>
              </button>

              {/* 4x PNG with Format Badge */}
              <button
                type="button"
                onClick={() => handleDownload("png4x")}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-white/10 rounded-xl transition-colors text-left cursor-pointer group"
              >
                <span className="min-w-[56px] h-6 px-1.5 flex items-center justify-center font-mono font-bold text-[10px] rounded-lg bg-purple-500/20 text-purple-300 group-hover:bg-purple-500/30 shrink-0 shadow-sm">
                  PNG 4x
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Ultra HD Image</span>
                  <span className="text-[10px] text-slate-400">High-res print & 4K quality</span>
                </div>
              </button>

              {/* SVG with Format Badge */}
              <button
                type="button"
                onClick={() => handleDownload("svg")}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-white/10 rounded-xl transition-colors text-left cursor-pointer group"
              >
                <span className="min-w-[56px] h-6 px-1.5 flex items-center justify-center font-mono font-bold text-[10px] rounded-lg bg-pink-500/20 text-pink-300 group-hover:bg-pink-500/30 shrink-0 shadow-sm">
                  SVG
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Vector Format</span>
                  <span className="text-[10px] text-slate-400">Lossless resolution &amp; scale</span>
                </div>
              </button>

              {/* Animate WebM — only shown when MediaRecorder/WebM is available */}
              {supportsWebM && (
                <button
                  type="button"
                  onClick={handleExportAnimation}
                  disabled={isAnimating}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-white/10 rounded-xl transition-colors text-left cursor-pointer group disabled:opacity-50"
                >
                  <span className="min-w-[56px] h-6 px-1.5 flex items-center justify-center font-mono font-bold text-[10px] rounded-lg bg-emerald-500/20 text-emerald-300 group-hover:bg-emerald-500/30 shrink-0 shadow-sm">
                    {isAnimating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Film className="w-3 h-3" />}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Animate (.webm)</span>
                    <span className="text-[10px] text-slate-400">Wipe-reveal video animation</span>
                  </div>
                </button>
              )}

              <div className="my-1 border-t border-white/5" />

              <div className="text-[10px] uppercase font-bold text-slate-400 px-2.5 py-0.5 tracking-wider">
                Share &amp; Code
              </div>

              {/* Share Link inside Export Menu */}
              <button
                type="button"
                onClick={() => {
                  handleShareUrl();
                  setOpenExportMenu(false);
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-white/10 rounded-xl transition-colors text-left cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 shrink-0">
                  <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Share URL</span>
                  <span className="text-[10px] text-slate-400">Copy permanent link to snippet</span>
                </div>
              </button>

              {/* Share OG Preview URL */}
              <button
                type="button"
                onClick={handleShareOgUrl}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-white/10 rounded-xl transition-colors text-left cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 shrink-0">
                  <ImageIcon className="w-3.5 h-3.5 text-pink-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Share OG Preview</span>
                  <span className="text-[10px] text-slate-400">Copy social preview image URL</span>
                </div>
              </button>

              {/* Copy Raw Code */}
              <button
                type="button"
                onClick={handleCopyCode}
                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-white/10 rounded-xl transition-colors text-left cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 shrink-0">
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Copy Raw Code</span>
                  <span className="text-[10px] text-slate-400">Copy plain text code</span>
                </div>
              </button>

              {/* Mobile-only Quick Access for Vault & About */}
              <div className="sm:hidden flex flex-col gap-1 pt-1 border-t border-white/5">
                <div className="text-[10px] uppercase font-bold text-slate-400 px-2.5 py-0.5 tracking-wider">
                  More
                </div>
                {/* Mobile Snippet Vault */}
                <button
                  type="button"
                  onClick={() => {
                    setOpenVaultModal(true);
                    setOpenExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-white/10 rounded-xl transition-colors text-left cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 shrink-0">
                    <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">Snippet Vault</span>
                    <span className="text-[10px] text-slate-400">Saved snippets & collections</span>
                  </div>
                </button>

                {/* Mobile About & Shortcuts */}
                <button
                  type="button"
                  onClick={() => {
                    onOpenAbout?.();
                    setOpenExportMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-white/10 rounded-xl transition-colors text-left cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 shrink-0">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-white">About & Shortcuts</span>
                    <span className="text-[10px] text-slate-400">Keys, tips & version info</span>
                  </div>
                </button>
              </div>
            </div>
          )}
          </div>{/* /exportMenuRef */}
        </div>{/* /right flex */}
      </div>{/* /max-w-7xl */}

      {/* Snippet Vault Modal Dialog — rendered via createPortal inside the component */}
      <SnippetVaultModal
        isOpen={openVaultModal}
        onClose={() => setOpenVaultModal(false)}
        currentState={state}
        onLoadSnippet={onLoadSnippet ?? onChange}
        showToast={showToast}
      />

      {/* Lifetime Pro Upgrade & Activation Modal */}
      <LifetimeProModal
        isOpen={openProModal}
        onClose={() => {
          setOpenProModal(false);
          setHighlightedProFeature(null);
        }}
        showToast={showToast}
        highlightedFeature={highlightedProFeature}
      />
    </header>
  );
}
