"use client";

import React, { useEffect } from "react";
import { X, Command } from "lucide-react";
import { cn } from "@/lib/utils";

interface AboutShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutShortcutsModal({
  isOpen,
  onClose,
}: AboutShortcutsModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderKey = (key: string) => {
    if (key === "⌘" || key === "Cmd") {
      return (
        <Command
          className="w-3 h-3 stroke-[2.1] text-white"
          aria-label="Command"
        />
      );
    }
    if (key === "⇧" || key === "Shift") {
      return (
        <svg
          className="w-3 h-3 fill-current"
          viewBox="0 0 24 24"
          aria-label="Shift"
        >
          <path d="M12 4L4.5 13h4.5v7h6v-7h4.5L12 4z" />
        </svg>
      );
    }
    if (key === "←" || key === "Left") {
      return (
        <svg
          className="w-3 h-3 fill-current"
          viewBox="0 0 24 24"
          aria-label="Left arrow"
        >
          <path d="M4 12l9-7.5v4.5h7v6h-7v4.5L4 12z" />
        </svg>
      );
    }
    if (key === "→" || key === "Right") {
      return (
        <svg
          className="w-3 h-3 fill-current"
          viewBox="0 0 24 24"
          aria-label="Right arrow"
        >
          <path d="M20 12l-9-7.5v4.5H4v6h7v4.5l9-7.5z" />
        </svg>
      );
    }
    return key;
  };

  const shortcuts = [
    { label: "Undo", keys: ["⌘", "Z"] },
    { label: "Redo", keys: ["⇧", "⌘", "Z"] },
    { label: "Save PNG", keys: ["⌘", "S"] },
    { label: "Copy image", keys: ["⇧", "⌘", "C"] },
    { label: "Spotlight range", keys: ["⇧", "Click"] },
    { label: "Clear spotlight", keys: ["Esc"] },
    { label: "Indent code", keys: ["Tab"] },
    { label: "Outdent code", keys: ["⇧", "Tab"] },
    { label: "Resize canvas", keys: ["←", "→"] },
    { label: "Show shortcuts", keys: ["⌘", "/"] },
    { label: "Close overlay", keys: ["Esc"] },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-shortcuts-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative w-full max-w-md rounded-2xl bg-[#13151f] shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-5 sm:p-6 text-slate-200 animate-in fade-in zoom-in-95 duration-200 select-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <h2
              id="about-shortcuts-title"
              className="text-base font-bold text-white tracking-tight"
            >
              About & shortcuts
            </h2>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 text-indigo-300 border border-indigo-500/30">
              v1.0
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed">
          A focused tool for transforming code into art — customize themes,
          fonts, backgrounds, and window frames, then export as crisp PNG, Ultra
          HD, or vector SVG.
        </p>

        {/* Social Links & Author Attribution */}
        <div className="flex items-center justify-between pt-3.5 pb-2">
          {/* Social Icons */}
          <div className="flex items-center gap-2">
            {/* GitHub */}
            <a
              href="https://github.com/rajpolu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub profile"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
            </a>

            {/* X / Twitter */}
            <a
              href="https://x.com/rajpolu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (formerly Twitter) profile"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="https://linkedin.com/in/rajpolu"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile"
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </a>
          </div>

          {/* Built by RajPolu */}
          <a
            href="https://github.com/rajpolu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer group"
          >
            <svg
              className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span className="font-semibold underline decoration-white/30 underline-offset-4 group-hover:decoration-white">
              Built by RajPolu
            </span>
          </a>
        </div>

        {/* Divider */}
        <div className="border-t border-white/5 my-2" />

        {/* Shortcuts List */}
        <div className="flex flex-col">
          {shortcuts.map((shortcut) => (
            <div
              key={shortcut.label}
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-b-0 text-xs"
            >
              <span className="text-slate-200 font-medium">
                {shortcut.label}
              </span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((k, idx) => (
                  <kbd
                    key={idx}
                    className="flex items-center justify-center px-2 py-0.5 min-w-[24px] h-6 text-center text-[11px] font-mono font-semibold rounded-md bg-white/10 text-white shadow-sm"
                  >
                    {renderKey(k)}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
