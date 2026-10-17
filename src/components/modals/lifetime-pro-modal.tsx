"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Sparkles,
  Check,
  Shield,
  Layers,
  GitCompare,
  Focus,
  Film,
  Key,
  Flame,
} from "lucide-react";
import { useProLicense } from "@/lib/license";
import { fireConfetti } from "@/lib/export-image";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/brand-logo";

interface LifetimeProModalProps {
  isOpen: boolean;
  onClose: () => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
  highlightedFeature?: string | null;
}

export function LifetimeProModal({
  isOpen,
  onClose,
  showToast,
  highlightedFeature,
}: LifetimeProModalProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [licenseKeyInput, setLicenseKeyInput] = useState("");
  const [showKeyDrawer, setShowKeyDrawer] = useState(false);
  const { isPro, licenseKey, activate, revoke } = useProLicense();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = activate(licenseKeyInput);
    if (res.success) {
      fireConfetti();
      showToast(res.message, "success");
      setLicenseKeyInput("");
      setShowKeyDrawer(false);
    } else {
      showToast(res.message, "error");
    }
  };

  const handleQuickDemoUnlock = () => {
    const res = activate("GLYPH-PRO-LIFETIME");
    if (res.success) {
      fireConfetti();
      showToast("🎉 Lifetime Pro unlocked with demo key!", "success");
      setShowKeyDrawer(false);
    }
  };

  const handleRevoke = () => {
    revoke();
    showToast("License deactivated.", "info");
  };

  const features = [
    {
      id: "carousel",
      icon: <Layers className="w-4 h-4 text-pink-400" />,
      title: "Multi-Slide Carousel Studio",
      desc: "Create swipeable LinkedIn & Instagram decks with PDF and Batch PNG export.",
    },
    {
      id: "secrets",
      icon: <Shield className="w-4 h-4 text-purple-400" />,
      title: "Secrets Auto-Redaction",
      desc: "Auto-detect and blur API keys, tokens, connection strings, and passwords.",
    },
    {
      id: "focus",
      icon: <Focus className="w-4 h-4 text-indigo-400" />,
      title: "Line Spotlight Focus",
      desc: "Gutter click-to-spotlight key lines with dimming and range selection.",
    },
    {
      id: "diff",
      icon: <GitCompare className="w-4 h-4 text-emerald-400" />,
      title: "Git Diff Syntax Highlighting",
      desc: "Native +/- line diff coloring across all languages and syntax themes.",
    },
    {
      id: "watermark",
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      title: "Custom Brand Kit Watermarks",
      desc: "Upload custom logos or custom text handles with custom positioning.",
    },
    {
      id: "webm",
      icon: <Film className="w-4 h-4 text-cyan-400" />,
      title: "Animated WebM Video Export",
      desc: "Record 2.5s wipe-reveal video clips client-side for Twitter/X and demos.",
    },
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lifetime-pro-modal-title"
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl bg-[#0e1017] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.85)] p-5 sm:p-7 text-slate-200 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Glow ambient background pill */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-36 bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-indigo-500/20 blur-3xl pointer-events-none rounded-full" />

        {/* Header Row */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 p-0.5 border border-white/10 shadow-lg flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-[#12141c] rounded-[14px] flex items-center justify-center">
                <BrandLogo className="w-5 h-5 shrink-0" size={20} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2
                  id="lifetime-pro-modal-title"
                  className="text-lg font-extrabold text-white tracking-tight"
                >
                  Glyph Lifetime Pro
                </h2>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 shadow-sm text-[10px] font-medium tracking-tight">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  <span className="text-slate-200 font-semibold">Lifetime Deal</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pay once, own forever. Zero subscriptions, zero recurring fees.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contextual Superpower Callout (if opened via feature trigger) */}
        {highlightedFeature && !isPro && (
          <div className="relative z-10 p-3.5 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-transparent border border-indigo-400/30 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(99,102,241,0.1)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                <BrandLogo className="w-4 h-4 shrink-0" size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Pro Superpower: {highlightedFeature}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-400/25 text-indigo-300 font-extrabold uppercase tracking-wide">
                    INCLUDED
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Unlock this feature + all creator studio tools forever with Lifetime Pro.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Pro Status Banner (if already activated) */}
        {isPro ? (
          <div className="relative z-10 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Lifetime Pro Active</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">
                    {licenseKey || "ACTIVE"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  All Pro creator studio features are unlocked on this browser.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRevoke}
              className="text-[11px] text-slate-400 hover:text-rose-300 px-2.5 py-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              Deactivate
            </button>
          </div>
        ) : (
          /* Limited Time Pricing Card */
          <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  $29
                </span>
                <span className="text-sm line-through text-slate-500 font-medium">
                  $79
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-emerald-400" />
                  Save 63% Launch Deal
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <span>One-time payment</span>
                <span>•</span>
                <span className="text-slate-300">Lifetime access to all updates</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 sm:items-end">
              <button
                type="button"
                onClick={handleQuickDemoUnlock}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white text-black hover:bg-slate-100 font-bold text-xs shadow-lg shadow-white/10 hover:shadow-white/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center"
              >
                <span>Get Pro</span>
              </button>
              <span className="text-[10px] text-slate-500 text-center sm:text-right">
                Instant activation • 14-day refund guarantee
              </span>
            </div>
          </div>
        )}

        {/* Feature Grid */}
        <div className="relative z-10 flex flex-col gap-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
            Everything Included in Lifetime Pro
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {features.map((feat) => {
              const isTargeted =
                highlightedFeature &&
                (feat.title.toLowerCase().includes(highlightedFeature.toLowerCase()) ||
                  highlightedFeature.toLowerCase().includes(feat.id) ||
                  (feat.id === "carousel" && highlightedFeature.toLowerCase().includes("carousel")));
              return (
                <div
                  key={feat.title}
                  className={cn(
                    "p-3 rounded-xl border transition-all flex items-start gap-2.5",
                    isTargeted
                      ? "bg-amber-500/10 border-amber-400/60 shadow-[0_0_15px_rgba(251,191,36,0.15)] ring-1 ring-amber-400/30"
                      : "bg-white/[0.03] border-white/5 hover:border-white/10"
                  )}
                >
                  <div
                    className={cn(
                      "p-1.5 rounded-lg shrink-0 mt-0.5",
                      isTargeted ? "bg-amber-400/20" : "bg-white/5"
                    )}
                  >
                    {feat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white flex items-center justify-between">
                      <span>{feat.title}</span>
                      {isTargeted && (
                        <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded">
                          Selected
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
                      {feat.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* License Key Drawer Toggle / Input */}
        <div className="relative z-10 pt-1 border-t border-white/5 flex flex-col gap-2.5">
          {!showKeyDrawer ? (
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Already purchased a key or want to test?</span>
              <button
                type="button"
                onClick={() => setShowKeyDrawer(true)}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 cursor-pointer flex items-center gap-1"
              >
                <Key className="w-3 h-3" />
                <span>Enter license key</span>
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleActivate}
              className="p-3 rounded-2xl bg-white/5 border border-indigo-500/20 flex flex-col gap-2 animate-in fade-in"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-300">
                  Activate License Key
                </span>
                <button
                  type="button"
                  onClick={() => setShowKeyDrawer(false)}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. GLYPH-PRO-LIFETIME"
                  value={licenseKeyInput}
                  onChange={(e) => setLicenseKeyInput(e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 px-3 py-1.5 text-xs text-white uppercase font-mono rounded-xl outline-none focus:ring-1 focus:ring-indigo-400"
                />
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all cursor-pointer shadow-md shadow-indigo-500/20"
                >
                  Activate
                </button>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                <span>Demo Key: <code className="text-indigo-300 font-mono">GLYPH-PRO-LIFETIME</code></span>
                <button
                  type="button"
                  onClick={handleQuickDemoUnlock}
                  className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2"
                >
                  Click to Auto-Fill & Unlock
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
