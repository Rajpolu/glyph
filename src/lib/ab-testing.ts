import { useSyncExternalStore } from "react";

export type ProVariant = "A" | "B";

const AB_STORAGE_KEY = "glyph_ab_pro_variant_v1";

/**
 * Returns current variant ("A" or "B")
 * Variant A: Subtle Frosted Gold Pill ("✦ Pro · $29" / quiet luxury)
 * Variant B: Neon Amber/Pink Gradient Action Pill ("⚡ Get Pro ($29)" / bold high-visibility)
 */
export function getProVariant(): ProVariant {
  if (typeof window === "undefined") return "A";
  try {
    // Check URL override: ?ab=a or ?ab=b
    const params = new URLSearchParams(window.location.search);
    const queryVar = params.get("ab")?.toUpperCase();
    if (queryVar === "A" || queryVar === "B") {
      localStorage.setItem(AB_STORAGE_KEY, queryVar);
      return queryVar as ProVariant;
    }

    const saved = localStorage.getItem(AB_STORAGE_KEY);
    if (saved === "A" || saved === "B") {
      return saved as ProVariant;
    }

    // Stable 50/50 split assignment
    const assigned: ProVariant = Math.random() < 0.5 ? "A" : "B";
    localStorage.setItem(AB_STORAGE_KEY, assigned);
    return assigned;
  } catch {
    return "A";
  }
}

export function setProVariant(variant: ProVariant): void {
  try {
    localStorage.setItem(AB_STORAGE_KEY, variant);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("glyph_ab_variant_change"));
    }
  } catch {
    // ignore
  }
}

function subscribeVariant(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("glyph_ab_variant_change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("glyph_ab_variant_change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getVariantSnapshot(): ProVariant {
  return getProVariant();
}

function getVariantServerSnapshot(): ProVariant {
  return "A";
}

export function useProVariant() {
  const variant = useSyncExternalStore(
    subscribeVariant,
    getVariantSnapshot,
    getVariantServerSnapshot
  );

  const toggleVariant = () => {
    const next: ProVariant = variant === "A" ? "B" : "A";
    setProVariant(next);
  };

  return { variant, setVariant: setProVariant, toggleVariant };
}
