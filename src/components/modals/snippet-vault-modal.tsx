"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  SavedSnippet,
  loadVault,
  saveToVault,
  deleteFromVault,
  exportVaultToJson,
  importVaultFromJson,
  exportCollectionToShareUrl,
  importCollectionFromShareUrl,
  mergeSnippetsIntoVault,
} from "@/lib/vault";
import { SnippetState } from "@/lib/presets";
import {
  X,
  Search,
  Bookmark,
  Trash2,
  Copy,
  Download,
  Upload,
  Plus,
  FolderOpen,
  Calendar,
  Share2,
  CheckSquare,
  Square,
  Link,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SnippetVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: SnippetState;
  onLoadSnippet: (state: SnippetState) => void;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

export function SnippetVaultModal({
  isOpen,
  onClose,
  currentState,
  onLoadSnippet,
  showToast,
}: SnippetVaultModalProps) {
  const [snippets, setSnippets] = useState<SavedSnippet[]>(loadVault);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Save current snippet form state
  const [isSavingCurrent, setIsSavingCurrent] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saveTags, setSaveTags] = useState("");

  // Multi-select / share collection state
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Import from link state
  const [showImportLink, setShowImportLink] = useState(false);
  const [importLinkValue, setImportLinkValue] = useState("");

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setSnippets(loadVault());
        setSaveTitle(currentState.title || "My Code Snippet");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, currentState.title]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-detect ?collection= param on mount and prompt import
  useEffect(() => {
    if (!isOpen || !mounted) return;
    const params = new URLSearchParams(window.location.search);
    const collection = params.get("collection");
    if (collection) {
      const timer = setTimeout(() => {
        const result = importCollectionFromShareUrl(collection);
        if (result.success && result.snippets.length > 0) {
          const added = mergeSnippetsIntoVault(result.snippets);
          setSnippets(loadVault());
          showToast(`Auto-imported ${added} snippets from share link!`, "success");
          // Clean the URL param
          const url = new URL(window.location.href);
          url.searchParams.delete("collection");
          window.history.replaceState(null, "", url.toString());
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mounted, showToast]);

  if (!isOpen || !mounted) return null;

  // Extract all unique tags
  const allTags = Array.from(
    new Set(snippets.flatMap((s) => s.tags || []))
  );

  const filteredSnippets = snippets.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.state.code.toLowerCase().includes(search.toLowerCase()) ||
      s.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesTag = !selectedTag || s.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = saveTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const saved = saveToVault(saveTitle, tagsArray, currentState);
    setSnippets(loadVault());
    setIsSavingCurrent(false);
    setSaveTags("");
    showToast(`Saved "${saved.title}" to Vault!`, "success");
  };

  const handleDelete = (id: string, title: string) => {
    const updated = deleteFromVault(id);
    setSnippets(updated);
    selectedIds.delete(id);
    setSelectedIds(new Set(selectedIds));
    showToast(`Deleted "${title}"`, "info");
  };

  const handleExportJson = () => {
    const jsonStr = exportVaultToJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `glyph-vault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported Vault backup JSON", "success");
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importVaultFromJson(content);
      if (res.success) {
        setSnippets(loadVault());
        showToast(`Imported ${res.count} snippets to Vault!`, "success");
      } else {
        showToast(res.error || "Failed to import JSON", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Toggle selection mode
  const handleToggleSelectMode = () => {
    setIsSelectMode((prev) => !prev);
    setSelectedIds(new Set());
  };

  // Toggle individual snippet selection
  const handleToggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Share selected snippets as a collection URL
  const handleShareCollection = () => {
    if (selectedIds.size === 0) return;
    const compressed = exportCollectionToShareUrl(Array.from(selectedIds));
    if (!compressed) {
      showToast("Nothing to share", "error");
      return;
    }
    const shareUrl = `${window.location.origin}${window.location.pathname}?collection=${compressed}`;
    navigator.clipboard.writeText(shareUrl).then(
      () => showToast(`Shared ${selectedIds.size} snippet(s) — URL copied!`, "success"),
      () => showToast("Could not copy URL to clipboard", "error")
    );
  };

  // Import snippets from a pasted share URL
  const handleImportFromLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importLinkValue.trim()) return;

    // Accept either full URL or just the compressed param value
    let compressed = importLinkValue.trim();
    try {
      const url = new URL(compressed);
      const param = url.searchParams.get("collection");
      if (param) compressed = param;
    } catch {
      // Not a URL — treat as raw compressed value
    }

    const result = importCollectionFromShareUrl(compressed);
    if (!result.success) {
      showToast(result.error || "Invalid share link", "error");
      return;
    }
    const added = mergeSnippetsIntoVault(result.snippets);
    setSnippets(loadVault());
    setImportLinkValue("");
    setShowImportLink(false);
    showToast(`Imported ${added} snippet(s) from link!`, "success");
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vault-modal-title"
      className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[#13151f] border border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.85)] p-5 sm:p-6 text-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="vault-modal-title"
                className="text-base font-bold text-white tracking-tight"
              >
                Snippet Vault &amp; Library
              </h2>
              <p className="text-xs text-slate-400">
                Organize, save, and reload your favorite code snippets anytime.
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

        {/* Top Actions: Search, Filter, Save Current, Backup */}
        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, tag, or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 rounded-xl outline-none focus:ring-1 focus:ring-purple-400"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsSavingCurrent(!isSavingCurrent)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Save Current</span>
            </button>

            {/* Select / Multi-select toggle */}
            <button
              type="button"
              onClick={handleToggleSelectMode}
              title={isSelectMode ? "Exit Select mode" : "Select snippets to share"}
              className={cn(
                "p-2 rounded-xl transition-colors cursor-pointer",
                isSelectMode
                  ? "bg-purple-600/30 text-purple-300 hover:bg-purple-600/40"
                  : "text-slate-400 hover:text-white bg-white/5 hover:bg-white/10"
              )}
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>

            {/* Import from link */}
            <button
              type="button"
              onClick={() => setShowImportLink((v) => !v)}
              title="Import collection from share link"
              className={cn(
                "p-2 rounded-xl transition-colors cursor-pointer",
                showImportLink
                  ? "bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/40"
                  : "text-slate-400 hover:text-white bg-white/5 hover:bg-white/10"
              )}
            >
              <Link className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              title="Backup Vault to JSON"
              className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <label
              title="Import Vault from JSON"
              className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer flex items-center justify-center"
            >
              <Upload className="w-3.5 h-3.5" />
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportJson}
              />
            </label>
          </div>
        </div>

        {/* Import from Link form */}
        {showImportLink && (
          <form
            onSubmit={handleImportFromLink}
            className="p-3.5 rounded-2xl bg-white/5 border border-indigo-500/20 flex flex-col gap-2 animate-in fade-in"
          >
            <div className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <Link className="w-3 h-3" />
              Import Collection from Share Link
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste collection share URL or compressed value…"
                value={importLinkValue}
                onChange={(e) => setImportLinkValue(e.target.value)}
                className="flex-1 bg-black/30 px-3 py-1.5 text-xs text-white rounded-xl outline-none focus:ring-1 focus:ring-indigo-400 placeholder-slate-600"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                Import
              </button>
            </div>
          </form>
        )}

        {/* Save Current Snippet Form Drawer */}
        {isSavingCurrent && (
          <form
            onSubmit={handleSaveCurrent}
            className="p-3.5 rounded-2xl bg-white/5 border border-purple-500/20 flex flex-col gap-2.5 animate-in fade-in"
          >
            <div className="text-xs font-semibold text-purple-300">
              Save Active Canvas into Vault
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Snippet title (e.g. Auth middleware)"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                required
                className="bg-black/30 px-3 py-1.5 text-xs text-white rounded-xl outline-none focus:ring-1 focus:ring-purple-400"
              />
              <input
                type="text"
                placeholder="Tags (comma separated, e.g. react, tips, v2)"
                value={saveTags}
                onChange={(e) => setSaveTags(e.target.value)}
                className="bg-black/30 px-3 py-1.5 text-xs text-white rounded-xl outline-none focus:ring-1 focus:ring-purple-400"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsSavingCurrent(false)}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-xl cursor-pointer"
              >
                Confirm Save
              </button>
            </div>
          </form>
        )}

        {/* Tag Filters Strip */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setSelectedTag(null)}
              className={cn(
                "px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap",
                !selectedTag
                  ? "bg-purple-600/30 text-purple-300 font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              All ({snippets.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={cn(
                  "px-2.5 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap",
                  selectedTag === tag
                    ? "bg-purple-600/30 text-purple-300 font-semibold ring-1 ring-purple-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Snippets List View */}
        <div className="flex-1 overflow-y-auto max-h-[48vh] flex flex-col gap-2.5 pr-1">
          {filteredSnippets.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-500">
              <FolderOpen className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-xs">No snippets saved in this view.</p>
              <p className="text-[11px] text-slate-600">
                Click &ldquo;Save Current&rdquo; to store the active code canvas into your Vault.
              </p>
            </div>
          ) : (
            filteredSnippets.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group p-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3",
                  isSelectMode && selectedIds.has(item.id)
                    ? "bg-purple-500/10 border-purple-500/30"
                    : "bg-white/[0.03] hover:bg-white/[0.06] border-white/5 hover:border-white/10"
                )}
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  {/* Checkbox in select mode */}
                  {isSelectMode && (
                    <button
                      type="button"
                      onClick={() => handleToggleSelect(item.id)}
                      className="mt-0.5 shrink-0 text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                    >
                      {selectedIds.has(item.id) ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-white truncate">
                        {item.title}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                        {item.state.language}
                      </span>
                      {item.state.isCarousel && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300">
                          Deck ({item.state.slides?.length || 1})
                        </span>
                      )}
                    </div>

                    {/* Code snippet peek preview */}
                    <div className="text-[11px] font-mono text-slate-400 truncate mt-1 max-w-md opacity-70">
                      {item.state.code.split("\n")[0] || "// Empty snippet"}
                    </div>

                    {/* Metadata and Tags */}
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[10px] text-purple-300 bg-purple-500/10 px-1.5 py-0.2 rounded"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {isSelectMode ? (
                    <button
                      type="button"
                      onClick={() => handleToggleSelect(item.id)}
                      className={cn(
                        "px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer",
                        selectedIds.has(item.id)
                          ? "bg-purple-600/40 text-purple-200 hover:bg-purple-600/60"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      )}
                    >
                      {selectedIds.has(item.id) ? "Deselect" : "Select"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onLoadSnippet(item.state);
                        onClose();
                        showToast(`Loaded "${item.title}" into canvas`, "success");
                      }}
                      className="px-3 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer"
                    >
                      Load
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      saveToVault(`${item.title} (Copy)`, item.tags, item.state);
                      setSnippets(loadVault());
                      showToast(`Duplicated "${item.title}"`, "info");
                    }}
                    title="Duplicate Snippet"
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.title)}
                    title="Delete Snippet"
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Floating action bar for multi-select */}
        {isSelectMode && selectedIds.size > 0 && (
          <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-purple-900/40 border border-purple-500/30 animate-in fade-in slide-in-from-bottom-2">
            <span className="text-xs text-purple-200 font-medium">
              {selectedIds.size} snippet{selectedIds.size !== 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSelectMode(false);
                  setSelectedIds(new Set());
                }}
                className="px-3 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleShareCollection}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-xl cursor-pointer transition-all"
              >
                <Share2 className="w-3 h-3" />
                Share {selectedIds.size} selected
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
