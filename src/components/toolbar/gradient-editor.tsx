"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  GradientConfig,
  GradientStop,
  GradientType,
  generateGradientCss,
  parseGradientCss,
  hexToHsl,
  hslToHex,
  hexToRgb,
  rgbToHex,
  CURATED_PALETTES,
  VIBRANT_COLOR_SWATCHES,
  generateRandomHarmonicGradient,
} from "@/lib/gradient-utils";
import {
  Pipette,
  Sparkles,
  Copy,
  Check,
  Plus,
  Trash2,
  RotateCw,
  ArrowLeftRight,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface GradientEditorProps {
  value?: string;
  onChange: (css: string) => void;
  className?: string;
}

export function GradientEditor({ value, onChange, className }: GradientEditorProps) {
  const { showToast } = useToast();
  const [config, setConfig] = useState<GradientConfig>(() => parseGradientCss(value));
  const [activeStopId, setActiveStopId] = useState<string>(() => {
    const initial = parseGradientCss(value);
    return initial.stops[0]?.id || "stop-1";
  });
  const [copiedCss, setCopiedCss] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Sync when incoming external value changes significantly
  useEffect(() => {
    if (value && typeof value === "string") {
      const parsed = parseGradientCss(value);
      // Only sync if the generated CSS differs to avoid overwriting ongoing user micro-adjustments
      const currentCss = generateGradientCss(config);
      if (value !== currentCss) {
        setConfig(parsed);
        if (!parsed.stops.some((s) => s.id === activeStopId)) {
          setActiveStopId(parsed.stops[0]?.id || "stop-1");
        }
      }
    }
  }, [value]);

  const activeStop = config.stops.find((s) => s.id === activeStopId) || config.stops[0];

  // Helper to commit changes and emit updated CSS to parent
  const commitConfig = useCallback((newConfig: GradientConfig) => {
    setConfig(newConfig);
    const css = generateGradientCss(newConfig);
    onChange(css);
  }, [onChange]);

  // Handle active stop color update (Hex)
  const handleColorChange = (hex: string) => {
    let cleanHex = hex;
    if (!cleanHex.startsWith("#")) cleanHex = "#" + cleanHex;
    const newStops = config.stops.map((s) =>
      s.id === activeStop.id ? { ...s, color: cleanHex } : s
    );
    commitConfig({ ...config, stops: newStops });
  };

  // Handle Hue scrubber change
  const handleHueChange = (newHue: number) => {
    const currentHsl = hexToHsl(activeStop.color);
    const updatedHex = hslToHex(newHue, currentHsl.s || 80, currentHsl.l || 55);
    handleColorChange(updatedHex);
  };

  // Handle Saturation scrubber change
  const handleSaturationChange = (newSat: number) => {
    const currentHsl = hexToHsl(activeStop.color);
    const updatedHex = hslToHex(currentHsl.h, newSat, currentHsl.l);
    handleColorChange(updatedHex);
  };

  // Handle Lightness scrubber change
  const handleLightnessChange = (newLight: number) => {
    const currentHsl = hexToHsl(activeStop.color);
    const updatedHex = hslToHex(currentHsl.h, currentHsl.s, newLight);
    handleColorChange(updatedHex);
  };

  // Handle Stop Position scrubber change
  const handlePositionChange = (newPos: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newPos)));
    const newStops = config.stops.map((s) =>
      s.id === activeStop.id ? { ...s, position: clamped } : s
    );
    commitConfig({ ...config, stops: newStops });
  };

  // Handle Stop Opacity scrubber change
  const handleOpacityChange = (newOpacity: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newOpacity)));
    const newStops = config.stops.map((s) =>
      s.id === activeStop.id ? { ...s, opacity: clamped } : s
    );
    commitConfig({ ...config, stops: newStops });
  };

  // Handle Angle scrubber change
  const handleAngleChange = (newAngle: number) => {
    const clamped = ((Math.round(newAngle) % 360) + 360) % 360;
    commitConfig({ ...config, angle: clamped });
  };

  // Handle Gradient Type Change
  const handleTypeChange = (type: GradientType) => {
    commitConfig({ ...config, type });
  };

  // Add new stop
  const handleAddStop = (pos?: number) => {
    const position = pos !== undefined ? Math.round(pos) : 50;
    const newId = `stop-${Date.now()}`;
    const newStop: GradientStop = {
      id: newId,
      color: activeStop ? activeStop.color : "#6366f1",
      position,
      opacity: 100,
    };
    const updatedStops = [...config.stops, newStop].sort((a, b) => a.position - b.position);
    setActiveStopId(newId);
    commitConfig({ ...config, stops: updatedStops });
  };

  // Remove active stop
  const handleRemoveStop = (idToRemove: string) => {
    if (config.stops.length <= 2) {
      showToast("Gradient requires at least 2 color stops", "info");
      return;
    }
    const filtered = config.stops.filter((s) => s.id !== idToRemove);
    const nextActive = filtered[0]?.id || "stop-1";
    setActiveStopId(nextActive);
    commitConfig({ ...config, stops: filtered });
  };

  // Reverse color stop order
  const handleReverseStops = () => {
    const reversed = config.stops.map((s) => ({
      ...s,
      position: 100 - s.position,
    })).sort((a, b) => a.position - b.position);
    commitConfig({ ...config, stops: reversed });
  };

  // Randomize gradient
  const handleRandomize = () => {
    const randomized = generateRandomHarmonicGradient();
    setActiveStopId(randomized.stops[0].id);
    commitConfig(randomized);
    showToast("Generated harmonic gradient!", "success");
  };

  // Copy CSS to clipboard
  const handleCopyCss = () => {
    const css = generateGradientCss(config);
    navigator.clipboard.writeText(css);
    setCopiedCss(true);
    showToast("Gradient CSS copied to clipboard!", "success");
    setTimeout(() => setCopiedCss(false), 2000);
  };

  // EyeDropper API
  const handleEyeDropper = async () => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          handleColorChange(result.sRGBHex);
          showToast(`Picked ${result.sRGBHex}`, "success");
        }
      } catch (err) {
        console.warn("EyeDropper aborted or failed", err);
      }
    } else {
      showToast("EyeDropper API is not supported in this browser", "info");
    }
  };

  // Dragging stop pin along the visual track
  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));

    // If clicking directly on a pin, let the pin's pointer handler handle it
    const target = e.target as HTMLElement;
    if (target.dataset.stopPin) return;

    // Clicked on track empty space: add a new stop at that exact percentage!
    handleAddStop(percent);
  };

  const handlePinPointerDown = (e: React.PointerEvent, stopId: string) => {
    e.stopPropagation();
    setActiveStopId(stopId);
    isDraggingRef.current = true;

    const handlePointerMove = (moveEv: PointerEvent) => {
      if (!isDraggingRef.current || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(100, ((moveEv.clientX - rect.left) / rect.width) * 100));
      const clamped = Math.round(percent);

      setConfig((prev) => {
        const nextStops = prev.stops.map((s) =>
          s.id === stopId ? { ...s, position: clamped } : s
        );
        const nextConfig = { ...prev, stops: nextStops };
        onChange(generateGradientCss(nextConfig));
        return nextConfig;
      });
    };

    const handlePointerUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const currentHsl = hexToHsl(activeStop?.color || "#6366f1");
  const currentCss = generateGradientCss(config);

  return (
    <div className={cn("flex flex-col gap-3.5 select-none", className)}>
      {/* 1. Header Toolbar: Mode Selector & Quick Actions */}
      <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-white/5">
        {/* Gradient Type Pills */}
        <div className="flex items-center bg-white/5 p-0.5 rounded-xl border border-white/5 text-[11px] font-medium">
          {(["linear", "radial", "conic"] as GradientType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              className={cn(
                "px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer",
                config.type === t
                  ? "bg-indigo-600 text-white font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Action Buttons: Randomize & Copy CSS */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleReverseStops}
            title="Reverse Color Stops"
            aria-label="Reverse Color Stops"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRandomize}
            title="Generate Harmonious Gradient"
            aria-label="Generate Harmonious Gradient"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-amber-300 hover:text-amber-200 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCopyCss}
            title="Copy CSS Code"
            aria-label="Copy CSS Code"
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            {copiedCss ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Interactive Gradient Track Visualizer & Stop Scrubber Pins */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-semibold text-slate-300">Gradient Track</span>
          <span className="text-[10px] text-slate-500">Click track to add stop</span>
        </div>

        <div
          ref={trackRef}
          onPointerDown={handleTrackPointerDown}
          className="relative h-9 w-full rounded-xl cursor-crosshair shadow-inner ring-1 ring-white/15 overflow-visible touch-none"
          style={{ background: currentCss }}
        >
          {/* Color Stop Markers / Pins */}
          {config.stops.map((stop) => {
            const isSelected = stop.id === activeStop.id;
            return (
              <div
                key={stop.id}
                data-stop-pin="true"
                onPointerDown={(e) => handlePinPointerDown(e, stop.id)}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group cursor-ew-resize flex flex-col items-center z-10"
                style={{ left: `${stop.position}%` }}
              >
                {/* Active Indicator Arrow */}
                <div
                  className={cn(
                    "w-0 h-0 border-x-4 border-x-transparent border-t-[5px] transition-all -mb-0.5",
                    isSelected ? "border-t-white scale-125" : "border-t-white/60 opacity-0 group-hover:opacity-100"
                  )}
                />
                {/* Color Swatch Circle Handle */}
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 transition-all shadow-lg flex items-center justify-center",
                    isSelected
                      ? "border-white ring-2 ring-indigo-400 scale-110 shadow-[0_0_12px_rgba(255,255,255,0.6)]"
                      : "border-white/80 hover:scale-105"
                  )}
                  style={{ backgroundColor: stop.color }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Stop Selector & Stop Action Pills */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {config.stops.map((stop, index) => {
              const isSelected = stop.id === activeStop.id;
              return (
                <button
                  key={stop.id}
                  type="button"
                  onClick={() => setActiveStopId(stop.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium transition-all cursor-pointer border",
                    isSelected
                      ? "bg-white/15 text-white border-white/30 font-bold shadow-sm"
                      : "bg-white/5 text-slate-400 border-white/5 hover:text-white"
                  )}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: stop.color }}
                  />
                  <span>#{index + 1} ({Math.round(stop.position)}%)</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            <button
              type="button"
              onClick={() => handleAddStop(50)}
              title="Add New Stop"
              aria-label="Add Stop"
              className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={config.stops.length <= 2}
              onClick={() => handleRemoveStop(activeStop.id)}
              title="Delete Active Stop"
              aria-label="Delete Active Stop"
              className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-rose-400 hover:text-rose-300 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Scrubber Slider Controls */}
      <div className="flex flex-col gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
        {/* Scrubber 1: Angle (for Linear & Conic) */}
        {config.type !== "radial" && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <RotateCw className="w-3 h-3 text-indigo-400" />
                Angle Scrubber
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={Math.round(config.angle)}
                  onChange={(e) => handleAngleChange(parseFloat(e.target.value) || 0)}
                  className="w-12 bg-white/10 px-1.5 py-0.5 text-right font-mono text-xs text-white rounded-md outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <span className="text-slate-400 text-xs">°</span>
              </div>
            </div>

            {/* Angle Slider Track */}
            <input
              type="range"
              min="0"
              max="360"
              value={Math.round(config.angle)}
              onChange={(e) => handleAngleChange(parseFloat(e.target.value))}
              aria-label="Gradient angle scrubber"
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-ew-resize accent-indigo-500"
            />

            {/* Quick Angle Presets */}
            <div className="grid grid-cols-6 gap-1 pt-0.5">
              {[0, 45, 90, 135, 180, 270].map((ang) => (
                <button
                  key={ang}
                  type="button"
                  onClick={() => handleAngleChange(ang)}
                  className={cn(
                    "py-0.5 text-[10px] font-mono rounded transition-all cursor-pointer",
                    Math.round(config.angle) === ang
                      ? "bg-indigo-600 text-white font-bold"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  )}
                >
                  {ang}°
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scrubber 2: Stop Position Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Stop Position</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(activeStop.position)}
                onChange={(e) => handlePositionChange(parseFloat(e.target.value) || 0)}
                className="w-12 bg-white/10 px-1.5 py-0.5 text-right font-mono text-xs text-white rounded-md outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <span className="text-slate-400 text-xs">%</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(activeStop.position)}
            onChange={(e) => handlePositionChange(parseFloat(e.target.value))}
            aria-label="Color stop position scrubber"
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-ew-resize accent-indigo-500"
          />
        </div>

        {/* Scrubber 3: Stop Opacity Slider */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Opacity</span>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                value={Math.round(activeStop.opacity ?? 100)}
                onChange={(e) => handleOpacityChange(parseFloat(e.target.value) || 0)}
                className="w-12 bg-white/10 px-1.5 py-0.5 text-right font-mono text-xs text-white rounded-md outline-none focus:ring-1 focus:ring-indigo-400"
              />
              <span className="text-slate-400 text-xs">%</span>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(activeStop.opacity ?? 100)}
            onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
            aria-label="Color stop opacity scrubber"
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-ew-resize accent-indigo-500"
          />
        </div>
      </div>

      {/* 4. New Rich Color Picker for Active Stop */}
      <div className="flex flex-col gap-2.5 p-3 rounded-2xl bg-white/[0.03] border border-white/5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200">Color Picker</span>
          {typeof window !== "undefined" && "EyeDropper" in window && (
            <button
              type="button"
              onClick={handleEyeDropper}
              className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              <Pipette className="w-3 h-3" />
              <span>Eyedropper</span>
            </button>
          )}
        </div>

        {/* Color Hex Input & Preview Tile */}
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8 rounded-xl overflow-hidden shrink-0 shadow-md ring-1 ring-white/20 cursor-pointer">
            <div className="w-full h-full" style={{ backgroundColor: activeStop.color }} />
            <input
              type="color"
              value={activeStop.color}
              onChange={(e) => handleColorChange(e.target.value)}
              aria-label="Native color picker"
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </div>

          <div className="flex-1 flex items-center bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/10">
            <span className="text-xs font-mono text-slate-400 mr-1">#</span>
            <input
              type="text"
              value={activeStop.color.replace(/^#/, "")}
              onChange={(e) => handleColorChange(e.target.value)}
              maxLength={6}
              aria-label="Hex color value"
              className="w-full bg-transparent font-mono text-xs text-white uppercase outline-none"
            />
          </div>

          {/* RGB Display Badge */}
          {(() => {
            const rgb = hexToRgb(activeStop.color);
            return (
              <span className="text-[10px] font-mono text-slate-400 px-2 py-1.5 rounded-xl bg-white/5 border border-white/5">
                {rgb.r},{rgb.g},{rgb.b}
              </span>
            );
          })()}
        </div>

        {/* Rainbow Hue Spectrum Scrubber Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Spectrum Hue</span>
            <span className="font-mono text-[10px]">{currentHsl.h}°</span>
          </div>
          <div className="relative h-3 w-full rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
              }}
            />
            <input
              type="range"
              min="0"
              max="360"
              value={currentHsl.h}
              onChange={(e) => handleHueChange(parseFloat(e.target.value))}
              aria-label="Rainbow hue spectrum scrubber"
              className="absolute inset-0 w-full opacity-0 cursor-ew-resize"
            />
          </div>
        </div>

        {/* Saturation Scrubber Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Saturation</span>
            <span className="font-mono text-[10px]">{currentHsl.s}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={currentHsl.s}
            onChange={(e) => handleSaturationChange(parseFloat(e.target.value))}
            aria-label="Color saturation scrubber"
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-ew-resize accent-indigo-500"
          />
        </div>

        {/* Lightness Scrubber Slider */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Brightness / Lightness</span>
            <span className="font-mono text-[10px]">{currentHsl.l}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={currentHsl.l}
            onChange={(e) => handleLightnessChange(parseFloat(e.target.value))}
            aria-label="Color lightness scrubber"
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-ew-resize accent-indigo-500"
          />
        </div>

        {/* Designer Vibrant Color Swatches */}
        <div className="pt-1">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
            Quick Swatches
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {VIBRANT_COLOR_SWATCHES.map((hex) => (
              <button
                key={hex}
                type="button"
                title={hex}
                onClick={() => handleColorChange(hex)}
                className={cn(
                  "w-full aspect-square rounded-lg shadow transition-transform hover:scale-125 cursor-pointer ring-1 ring-white/10",
                  activeStop.color.toLowerCase() === hex.toLowerCase() && "ring-2 ring-white scale-110"
                )}
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        </div>

        {/* Curated Multi-Color Designer Gradient Palettes */}
        <div className="pt-2 border-t border-white/5">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Curated Palettes</span>
            <span className="text-[9px] text-indigo-400">1-click apply</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {CURATED_PALETTES.map((pal) => (
              <button
                key={pal.name}
                type="button"
                onClick={() => {
                  const step = 100 / (pal.colors.length - 1);
                  const newStops: GradientStop[] = pal.colors.map((c, i) => ({
                    id: `stop-${i + 1}-${Date.now()}`,
                    color: c,
                    position: Math.round(i * step),
                    opacity: 100,
                  }));
                  setActiveStopId(newStops[0].id);
                  commitConfig({ ...config, stops: newStops });
                  showToast(`Applied ${pal.name}`, "info");
                }}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all text-left cursor-pointer group"
              >
                <div
                  className="w-8 h-5 rounded-lg shrink-0 shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${pal.colors.join(", ")})`,
                  }}
                />
                <span className="text-[11px] font-medium text-slate-300 group-hover:text-white truncate">
                  {pal.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
