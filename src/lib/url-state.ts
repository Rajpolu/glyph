import LZString from "lz-string";
import { SnippetState, DEFAULT_STATE } from "./presets";

export function encodeSnippetState(state: SnippetState): string {
  try {
    const json = JSON.stringify(state);
    return LZString.compressToEncodedURIComponent(json);
  } catch (err) {
    console.error("Failed to encode state:", err);
    return "";
  }
}

export function decodeSnippetState(hash: string): SnippetState | null {
  try {
    if (!hash) return null;
    const cleanHash = hash.startsWith("#") ? hash.slice(1) : hash;
    if (!cleanHash) return null;

    const json = LZString.decompressFromEncodedURIComponent(cleanHash);
    if (!json) return null;

    const parsed = JSON.parse(json);
    return {
      ...DEFAULT_STATE,
      ...parsed,
    };
  } catch (err) {
    console.error("Failed to decode state:", err);
    return null;
  }
}
