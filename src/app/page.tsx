"use client";

import React, { useState, useEffect, useRef } from "react";
import { SnippetState, DEFAULT_STATE } from "@/lib/presets";
import { decodeSnippetState } from "@/lib/url-state";
import { Navbar } from "@/components/navbar";
import { ControlsSidebar } from "@/components/sidebar/controls-sidebar";
import { CodeCanvas } from "@/components/canvas/code-canvas";
import { ToastProvider, useToast } from "@/components/ui/toast";
import { exportToPng, copyImageToClipboard, fireConfetti } from "@/lib/export-image";
import { AboutShortcutsModal } from "@/components/modals/about-shortcuts-modal";

function SnippetApp() {
  const [state, setState] = useState<SnippetState>(DEFAULT_STATE);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Sync state with URL hash on mount and when hash changes
  useEffect(() => {
    const handleHash = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        const decoded = decodeSnippetState(window.location.hash);
        if (decoded) {
          setState(decoded);
        }
      }
    };

    const timer = setTimeout(handleHash, 0);
    window.addEventListener("hashchange", handleHash);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("hashchange", handleHash);
    };
  }, []);

  const updateState = (updates: Partial<SnippetState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  // Full state replacement for Vault loads — merges on DEFAULT_STATE base so
  // any fields added after a snippet was saved still have valid defaults.
  const replaceState = (incoming: SnippetState) => {
    setState({ ...DEFAULT_STATE, ...incoming });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + S -> Save PNG
      if (isMeta && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (canvasRef.current) {
          exportToPng(
            canvasRef.current,
            `${state.title.replace(/\.[^/.]+$/, "") || "snippet"}-2x.png`,
            2
          )
            .then(() => {
              showToast("Saved PNG snippet!", "success");
            })
            .catch((err) => {
              console.error("Save PNG failed:", err);
              showToast("Failed to save image", "error");
            });
        }
      }

      // Cmd/Ctrl + Shift + C -> Copy Image
      if (isMeta && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        if (canvasRef.current) {
          copyImageToClipboard(canvasRef.current, 2)
            .then(() => {
              fireConfetti();
              showToast("Image copied to clipboard! (2x Retina)", "success");
            })
            .catch((err) => {
              console.error("Copy image failed:", err);
              showToast("Failed to copy image to clipboard", "error");
            });
        }
      }

      // Cmd/Ctrl + / or ? -> Toggle About & Shortcuts modal
      if (
        (isMeta && e.key === "/") ||
        (!isMeta &&
          e.key === "?" &&
          !(
            e.target instanceof HTMLInputElement ||
            e.target instanceof HTMLTextAreaElement
          ))
      ) {
        e.preventDefault();
        setShowAboutModal((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.title, showToast]);

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navigation */}
      <Navbar
        canvasRef={canvasRef}
        state={state}
        onChange={updateState}
        onLoadSnippet={replaceState}
        onOpenAbout={() => setShowAboutModal(true)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Controls Sidebar with New Gradient Editor Tool */}
      <ControlsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        state={state}
        onChange={updateState}
      />

      {/* Main Interactive Canvas Area (Fluid Auto Layout) */}
      <main className="flex-1 flex flex-col items-center justify-center py-4 sm:py-8 px-2 sm:px-6 w-full max-w-full overflow-x-hidden">
        <CodeCanvas
          canvasRef={canvasRef}
          state={state}
          onChange={updateState}
        />
      </main>

      {/* About & Shortcuts Modal Overlay */}
      <AboutShortcutsModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />

      {/* Borderless Soft Footer matching Navbar structure & padding */}
      <footer className="w-full bg-[#090a0f]/80 backdrop-blur-2xl shadow-[0_-4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 h-16 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">Glyph</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/10">v1.0</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">Code into art</span>
          </div>
          <div className="font-medium text-slate-300 flex items-center gap-1.5">
            <span>Built by</span>
            <a
              href="https://github.com/rajpolu"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-white hover:text-indigo-400 underline decoration-indigo-500/50 underline-offset-4 transition-colors"
            >
              RajPolu
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <SnippetApp />
    </ToastProvider>
  );
}
