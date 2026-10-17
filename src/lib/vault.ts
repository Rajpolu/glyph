import { SnippetState } from "./presets";
import LZString from "lz-string";

export interface SavedSnippet {
  id: string;
  title: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  state: SnippetState;
}

const VAULT_STORAGE_KEY = "glyph_snippet_vault_v1";

export function loadVault(): SavedSnippet[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load snippet vault from localStorage:", err);
    return [];
  }
}

export function saveToVault(
  title: string,
  tags: string[],
  state: SnippetState
): SavedSnippet {
  const current = loadVault();
  const newSnippet: SavedSnippet = {
    id: `snip_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: title.trim() || state.title || "Untitled Snippet",
    tags: tags.map((t) => t.trim().toLowerCase()).filter(Boolean),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    state: JSON.parse(JSON.stringify(state)),
  };

  const updated = [newSnippet, ...current];
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to persist snippet to vault:", err);
  }

  return newSnippet;
}

export function deleteFromVault(id: string): SavedSnippet[] {
  const current = loadVault();
  const filtered = current.filter((s) => s.id !== id);
  try {
    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error("Failed to delete snippet from vault:", err);
  }
  return filtered;
}

export function exportVaultToJson(): string {
  const snippets = loadVault();
  return JSON.stringify(
    {
      app: "glyph",
      version: 1,
      exportedAt: new Date().toISOString(),
      snippets,
    },
    null,
    2
  );
}

export function importVaultFromJson(jsonStr: string): {
  success: boolean;
  count: number;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonStr);
    const incoming: SavedSnippet[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.snippets)
      ? parsed.snippets
      : [];

    if (incoming.length === 0) {
      return { success: false, count: 0, error: "No valid snippets found in JSON." };
    }

    const current = loadVault();
    const existingIds = new Set(current.map((s) => s.id));
    const merged = [...current];

    let addedCount = 0;
    for (const item of incoming) {
      if (item && item.state && item.state.code) {
        const id = existingIds.has(item.id)
          ? `snip_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
          : item.id || `snip_${Date.now()}`;
        merged.unshift({
          ...item,
          id,
          createdAt: item.createdAt || Date.now(),
          updatedAt: Date.now(),
        });
        existingIds.add(id);
        addedCount++;
      }
    }

    localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(merged));
    return { success: true, count: addedCount };
  } catch (err: unknown) {
    return {
      success: false,
      count: 0,
      error: err instanceof Error ? err.message : "Malformed JSON file.",
    };
  }
}

/**
 * Compresses a subset of vault snippets into a URL-safe share string.
 * Returns the full query string value (without the leading '?').
 */
export function exportCollectionToShareUrl(snippetIds: string[]): string {
  const vault = loadVault();
  const selected = vault.filter((s) => snippetIds.includes(s.id));
  if (selected.length === 0) return "";
  const compressed = LZString.compressToEncodedURIComponent(
    JSON.stringify(selected)
  );
  return compressed;
}

/**
 * Decompresses and validates a collection share string (the value of ?collection=).
 * Returns the parsed snippets array and a success flag.
 */
export function importCollectionFromShareUrl(compressed: string): {
  success: boolean;
  snippets: SavedSnippet[];
  error?: string;
} {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
    if (!decompressed) {
      return { success: false, snippets: [], error: "Invalid or corrupted share link." };
    }
    const parsed = JSON.parse(decompressed);
    if (!Array.isArray(parsed)) {
      return { success: false, snippets: [], error: "Share data is not an array of snippets." };
    }
    // Validate each item has at minimum: id, state.code
    const valid: SavedSnippet[] = parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        item.state &&
        typeof item.state.code === "string"
    );
    if (valid.length === 0) {
      return { success: false, snippets: [], error: "No valid snippets found in share link." };
    }
    return { success: true, snippets: valid };
  } catch (err: unknown) {
    return {
      success: false,
      snippets: [],
      error: err instanceof Error ? err.message : "Failed to parse share link.",
    };
  }
}

/**
 * Merges an array of imported snippets into the vault, deduplicating by id.
 * Returns the count of newly added snippets.
 */
export function mergeSnippetsIntoVault(incoming: SavedSnippet[]): number {
  const current = loadVault();
  const existingIds = new Set(current.map((s) => s.id));
  const merged = [...current];
  let added = 0;

  for (const item of incoming) {
    const id = existingIds.has(item.id)
      ? `snip_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
      : item.id;
    merged.unshift({
      ...item,
      id,
      updatedAt: Date.now(),
    });
    existingIds.add(id);
    added++;
  }

  try {
    localStorage.setItem(
      "glyph_snippet_vault_v1",
      JSON.stringify(merged)
    );
  } catch (err) {
    console.error("Failed to merge snippets into vault:", err);
  }

  return added;
}
