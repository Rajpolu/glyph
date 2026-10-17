"use client";

import React, { useState, useEffect, useRef } from "react";
import { SnippetState, BACKGROUNDS, SHADOW_OPTIONS, THEMES, SlideItem } from "@/lib/presets";
import { WindowHeader } from "./window-header";
import { CodeEditor } from "./code-editor";
import { ChevronLeft, ChevronRight, Plus, Copy, Trash2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeCanvasProps {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  state: SnippetState;
  onChange: (updates: Partial<SnippetState>) => void;
}

export function CodeCanvas({ canvasRef, state, onChange }: CodeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const scaleRef = useRef<number>(1);

  // Carousel slide state management
  const slides: SlideItem[] = state.slides && state.slides.length > 0
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
  const activeSlideIndex = state.activeSlideIndex || 0;

  const handleSelectSlide = (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const updatedSlides = [...slides];
    updatedSlides[activeSlideIndex] = {
      ...updatedSlides[activeSlideIndex],
      code: state.code,
      title: state.title,
      language: state.language,
      focusedLines: state.focusedLines,
    };
    const target = updatedSlides[targetIndex];
    onChange({
      slides: updatedSlides,
      activeSlideIndex: targetIndex,
      code: target.code,
      title: target.title || `slide-${targetIndex + 1}.ts`,
      language: target.language || state.language,
      focusedLines: target.focusedLines || [],
    });
  };

  const handleAddSlide = () => {
    const updatedSlides = [...slides];
    updatedSlides[activeSlideIndex] = {
      ...updatedSlides[activeSlideIndex],
      code: state.code,
      title: state.title,
      language: state.language,
      focusedLines: state.focusedLines,
    };
    const newSlide: SlideItem = {
      id: `slide_${Date.now()}`,
      title: `slide-${updatedSlides.length + 1}.ts`,
      code: `// Slide ${updatedSlides.length + 1}\n`,
      language: state.language,
      focusedLines: [],
    };
    const nextList = [...updatedSlides, newSlide];
    onChange({
      slides: nextList,
      activeSlideIndex: nextList.length - 1,
      code: newSlide.code,
      title: newSlide.title,
      focusedLines: [],
    });
  };

  const handleDuplicateSlide = () => {
    const updatedSlides = [...slides];
    updatedSlides[activeSlideIndex] = {
      ...updatedSlides[activeSlideIndex],
      code: state.code,
      title: state.title,
      language: state.language,
      focusedLines: state.focusedLines,
    };
    const current = updatedSlides[activeSlideIndex];
    const newSlide: SlideItem = {
      ...current,
      id: `slide_${Date.now()}`,
      title: `copy-${current.title || "slide"}`,
    };
    const nextList = [
      ...updatedSlides.slice(0, activeSlideIndex + 1),
      newSlide,
      ...updatedSlides.slice(activeSlideIndex + 1),
    ];
    onChange({
      slides: nextList,
      activeSlideIndex: activeSlideIndex + 1,
      code: newSlide.code,
      title: newSlide.title,
      focusedLines: newSlide.focusedLines || [],
    });
  };

  const handleDeleteSlide = (deleteIndex: number) => {
    if (slides.length <= 1) return;
    const nextList = slides.filter((_, idx) => idx !== deleteIndex);
    const nextIdx = Math.min(activeSlideIndex, nextList.length - 1);
    const target = nextList[nextIdx];
    onChange({
      slides: nextList,
      activeSlideIndex: nextIdx,
      code: target.code,
      title: target.title || `slide-${nextIdx + 1}.ts`,
      language: target.language || state.language,
      focusedLines: target.focusedLines || [],
    });
  };

  const currentBg =
    BACKGROUNDS.find((bg) => bg.id === state.background) || BACKGROUNDS[0];
  const activeBackground =
    state.background === "custom" && state.customBgValue
      ? state.customBgValue
      : currentBg.id === "transparent"
      ? undefined
      : currentBg.preview;
  const currentShadow =
    SHADOW_OPTIONS.find((s) => s.id === state.dropShadow) || SHADOW_OPTIONS[2];
  const currentTheme =
    THEMES.find((t) => t.id === state.theme) || THEMES[0];

  const windowOpacity = (state.opacity ?? 100) / 100;

  // Track parent container width for responsive scaling on mobile / narrow viewports
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateContainerWidth();

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(Math.round(entry.contentRect.width));
      }
    });

    observer.observe(container);
    window.addEventListener("resize", updateContainerWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateContainerWidth);
    };
  }, []);

  // Real-time measuring of natural unscaled canvas dimensions with hysteresis to prevent subpixel jitter loops
  useEffect(() => {
    const element = canvasRef.current;
    if (!element) return;

    const updateDimensions = () => {
      if (!canvasRef.current) return;
      const newWidth = Math.round(canvasRef.current.offsetWidth);
      const newHeight = Math.round(canvasRef.current.offsetHeight);
      if (newWidth <= 0 || newHeight <= 0) return;

      setDimensions((prev) => {
        if (Math.abs(prev.width - newWidth) < 2 && Math.abs(prev.height - newHeight) < 2) {
          return prev;
        }
        return { width: newWidth, height: newHeight };
      });
    };

    updateDimensions();

    const observer = new ResizeObserver(() => {
      updateDimensions();
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [canvasRef]);

  // Compute responsive scale factor so the canvas card never overflows or clips
  const naturalWidth = state.customWidth ?? dimensions.width ?? 580;
  const naturalHeight = dimensions.height || 420;
  // Comfortable horizontal breathing room (at least 32px margin on mobile)
  const availableWidth = containerWidth > 0 ? containerWidth - 32 : 0;
  const scale =
    availableWidth > 0 && naturalWidth > availableWidth
      ? Math.min(1, Math.max(0.3, availableWidth / naturalWidth))
      : 1;

  // Keep live scale accessible to event handlers without stale closures
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // Handle Drag to Scale Width (Mouse) with incremental step tracking & live scale compensation
  const handleMouseDown = (e: React.MouseEvent, direction: "left" | "right") => {
    e.preventDefault();
    setIsDragging(true);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "ew-resize";

    const initialWidth = state.customWidth ?? dimensions.width ?? 600;
    let currentWidth = initialWidth;
    let lastX = e.clientX;
    let rafId: number | null = null;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const stepX = moveEvent.clientX - lastX;
        lastX = moveEvent.clientX;
        const currentScale = scaleRef.current || 1;
        const sign = direction === "right" ? 1 : -1;
        const stepDeltaWidth = (stepX * 2 * sign) / currentScale;
        currentWidth = Math.min(1280, Math.max(260, currentWidth + stepDeltaWidth));
        onChange({ customWidth: Math.round(currentWidth), aspectPreset: "auto" });
      });
    };

    const handleMouseUp = () => {
      if (rafId) cancelAnimationFrame(rafId);
      setIsDragging(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  // Handle Drag to Scale Width (Touch) with incremental step tracking & live scale compensation
  const handleTouchStart = (e: React.TouchEvent, direction: "left" | "right") => {
    if (!e.touches[0]) return;
    setIsDragging(true);
    document.body.style.userSelect = "none";

    const initialWidth = state.customWidth ?? dimensions.width ?? 600;
    let currentWidth = initialWidth;
    let lastX = e.touches[0].clientX;
    let rafId: number | null = null;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!moveEvent.touches[0]) return;
      if (moveEvent.cancelable) moveEvent.preventDefault();
      const clientX = moveEvent.touches[0].clientX;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const stepX = clientX - lastX;
        lastX = clientX;
        const currentScale = scaleRef.current || 1;
        const sign = direction === "right" ? 1 : -1;
        const stepDeltaWidth = (stepX * 2 * sign) / currentScale;
        currentWidth = Math.min(1280, Math.max(260, currentWidth + stepDeltaWidth));
        onChange({ customWidth: Math.round(currentWidth), aspectPreset: "auto" });
      });
    };

    const handleTouchEnd = () => {
      if (rafId) cancelAnimationFrame(rafId);
      setIsDragging(false);
      document.body.style.userSelect = "";
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };

    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("touchcancel", handleTouchEnd);
  };

  // Accessible Keyboard Resize
  const handleKeyDownResize = (e: React.KeyboardEvent, direction: "left" | "right" = "right") => {
    const currentWidth = state.customWidth ?? dimensions.width ?? 600;
    const step = e.shiftKey ? 64 : 16;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const newWidth = direction === "right"
        ? Math.max(260, currentWidth - step)
        : Math.min(1280, currentWidth + step);
      onChange({ customWidth: newWidth, aspectPreset: "auto" });
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const newWidth = direction === "right"
        ? Math.min(1280, currentWidth + step)
        : Math.max(260, currentWidth - step);
      onChange({ customWidth: newWidth, aspectPreset: "auto" });
    } else if (e.key === "Home" || e.key === "Escape") {
      e.preventDefault();
      onChange({ customWidth: null, aspectPreset: "auto" });
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col items-center justify-center py-2 relative max-w-full"
    >
      {/* Active Drag Measuring Tooltip (Only visible while dragging!) */}
      {isDragging && (
        <div className="no-export absolute -top-4 z-50 flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/95 text-white text-xs font-mono font-semibold shadow-xl backdrop-blur-xl animate-in fade-in zoom-in-95 pointer-events-none select-none">
          <span>📐</span>
          <span>{naturalWidth} × {naturalHeight} px</span>
        </div>
      )}

      {/* Carousel Deck Navigation Bar - Frosted Glass Aesthetic aligned with Toolbar Dock */}
      {state.isCarousel && (
        <div className="no-export flex items-center justify-between w-full max-w-xl px-3 py-1.5 mb-3 rounded-2xl bg-[#0f1118]/85 border border-white/10 backdrop-blur-2xl shadow-[0_12px_32px_rgba(0,0,0,0.5)] z-20">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-pink-500/15 border border-pink-500/25 text-pink-300 text-xs font-semibold shadow-sm">
              <Layers className="w-3.5 h-3.5 text-pink-400" />
              <span>Slide {activeSlideIndex + 1} of {slides.length}</span>
            </div>

            {/* Prev Button */}
            <button
              type="button"
              disabled={activeSlideIndex <= 0}
              onClick={() => handleSelectSlide(activeSlideIndex - 1)}
              className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-25 disabled:pointer-events-none hover:bg-white/10 transition-colors cursor-pointer"
              title="Previous Slide"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Slide Number Tabs */}
            <div className="flex items-center gap-1 max-w-[180px] overflow-x-auto no-scrollbar">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSlide(idx)}
                  className={cn(
                    "w-6 h-6 rounded-lg text-xs font-mono font-medium flex items-center justify-center transition-all cursor-pointer",
                    idx === activeSlideIndex
                      ? "bg-pink-600 text-white font-bold shadow-md shadow-pink-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Next Button */}
            <button
              type="button"
              disabled={activeSlideIndex >= slides.length - 1}
              onClick={() => handleSelectSlide(activeSlideIndex + 1)}
              className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-25 disabled:pointer-events-none hover:bg-white/10 transition-colors cursor-pointer"
              title="Next Slide"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleAddSlide}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-pink-300 hover:text-white bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 rounded-xl transition-all cursor-pointer active:scale-95"
              title="Add Slide"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add</span>
            </button>

            <button
              type="button"
              onClick={handleDuplicateSlide}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Duplicate Active Slide"
              aria-label="Duplicate Active Slide"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            {slides.length > 1 && (
              <button
                type="button"
                onClick={() => handleDeleteSlide(activeSlideIndex)}
                className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                title="Delete Slide"
                aria-label="Delete Slide"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Scaled Canvas Viewport Box: Smooth centering, zero flickering */}
      <div
        className="relative mx-auto flex items-center justify-center max-w-full"
        style={{
          width: scale < 1 ? `${Math.round(naturalWidth * scale)}px` : `${naturalWidth}px`,
          height: scale < 1 ? `${Math.round(naturalHeight * scale)}px` : `${naturalHeight}px`,
        }}
      >
        <div
          className="relative shrink-0 flex items-center justify-center"
          style={{
            width: `${naturalWidth}px`,
            height: `${naturalHeight}px`,
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: "center center",
            willChange: scale < 1 ? "transform" : undefined,
          }}
        >
          {/* Main Screenshot Target Canvas */}
          <div
            ref={canvasRef}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-2xl shrink-0 select-none",
              currentBg.id === "transparent" && "bg-transparent"
            )}
            style={{
              background: activeBackground,
              padding: `${state.padding}px`,
              width: state.customWidth ? `${state.customWidth}px` : "max-content",
              minWidth: state.customWidth ? undefined : "min(100%, 280px)",
              maxWidth: state.customWidth ? `${state.customWidth}px` : undefined,
              transform: "translateZ(0)",
            }}
          >
            {/* Code Window - Silky Soft Shadow, 100% Borderless, Natural Content Width */}
            <div
              className={cn(
                "relative rounded-2xl overflow-hidden",
                windowOpacity < 1 && "backdrop-blur-md",
                currentShadow.class,
                currentTheme.isDark ? "text-slate-100" : "text-slate-900"
              )}
              style={{
                backgroundColor: currentTheme.bgPreview,
                opacity: windowOpacity,
                width: state.customWidth ? "100%" : "max-content",
                minWidth: state.customWidth ? undefined : "min(100%, 240px)",
                maxWidth: "100%",
              }}
            >
              {/* Window Header */}
              <WindowHeader
                state={state}
                onChange={onChange}
                isDarkTheme={currentTheme.isDark}
              />

              {/* Code Editor */}
              <CodeEditor state={state} onChange={onChange} />
            </div>

            {/* Watermark / Brand Kit Rendering + Carousel Counter (Only rendered when content exists to keep perfect canvas balance) */}
            {(state.isCarousel && slides.length > 1) || (state.showWatermark && state.watermarkType !== "none") ? (
              <div className="w-full flex items-center justify-between mt-2.5 px-2">
                {/* Carousel Slide Pagination badge on the canvas (exports with slide!) */}
                {state.isCarousel && slides.length > 1 ? (
                  <div className="text-[10px] font-mono tracking-wider text-white/80 px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-md border border-white/10 shadow-sm shrink-0">
                    {activeSlideIndex + 1} / {slides.length}
                  </div>
                ) : <div />}

                {state.showWatermark && state.watermarkType !== "none" && (
                  <div
                    className={cn(
                      "flex items-center transition-opacity",
                      state.watermarkPosition === "bottom-left" ? "order-first" : "order-last"
                    )}
                  >
                    {state.watermarkType === "customLogo" && state.customWatermarkLogo ? (
                      <div className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={state.customWatermarkLogo}
                          alt="Brand watermark logo"
                          className="h-4.5 sm:h-5 max-w-[120px] object-contain rounded"
                        />
                        {state.customWatermarkText && (
                          <span className="text-[10px] font-mono tracking-wider text-white/80">
                            {state.customWatermarkText}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono tracking-widest opacity-40 hover:opacity-80 transition-opacity text-white">
                        {state.watermarkType === "customText" && state.customWatermarkText
                          ? state.customWatermarkText
                          : "Glyph"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : null}

            {/* Left Drag Handle for resizing on click & drag (Hidden in export via .no-export) */}
            <div
              role="separator"
              tabIndex={0}
              aria-orientation="vertical"
              aria-label="Resize canvas width from left. Use arrow keys to resize or double-click to reset."
              aria-valuenow={naturalWidth}
              aria-valuemin={260}
              aria-valuemax={1280}
              onKeyDown={(e) => handleKeyDownResize(e, "left")}
              onMouseDown={(e) => handleMouseDown(e, "left")}
              onTouchStart={(e) => handleTouchStart(e, "left")}
              onDoubleClick={() => onChange({ customWidth: null, aspectPreset: "auto" })}
              className={cn(
                "no-export absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-16 flex items-center justify-center cursor-ew-resize group/drag z-30 transition-all select-none touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-full",
                isDragging && "scale-110"
              )}
              title="Drag to resize width (Double-click to reset to auto)"
            >
              <div
                className={cn(
                  "w-1.5 h-8 rounded-full bg-white/30 group-hover/drag:bg-indigo-400 group-hover/drag:w-2 transition-all shadow-md backdrop-blur-sm",
                  isDragging && "bg-indigo-400 w-2.5 h-10 shadow-indigo-500/50 shadow-lg"
                )}
              />
            </div>

            {/* Right Drag Handle for resizing on click & drag (Hidden in export via .no-export) */}
            <div
              role="separator"
              tabIndex={0}
              aria-orientation="vertical"
              aria-label="Resize canvas width from right. Use arrow keys to resize or double-click to reset."
              aria-valuenow={naturalWidth}
              aria-valuemin={260}
              aria-valuemax={1280}
              onKeyDown={(e) => handleKeyDownResize(e, "right")}
              onMouseDown={(e) => handleMouseDown(e, "right")}
              onTouchStart={(e) => handleTouchStart(e, "right")}
              onDoubleClick={() => onChange({ customWidth: null, aspectPreset: "auto" })}
              className={cn(
                "no-export absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-16 flex items-center justify-center cursor-ew-resize group/drag z-30 transition-all select-none touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-full",
                isDragging && "scale-110"
              )}
              title="Drag to resize width (Double-click to reset to auto)"
            >
              <div
                className={cn(
                  "w-1.5 h-8 rounded-full bg-white/30 group-hover/drag:bg-indigo-400 group-hover/drag:w-2 transition-all shadow-md backdrop-blur-sm",
                  isDragging && "bg-indigo-400 w-2.5 h-10 shadow-indigo-500/50 shadow-lg"
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
