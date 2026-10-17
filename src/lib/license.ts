import { useSyncExternalStore } from "react";

const LICENSE_STORAGE_KEY = "glyph_pro_license_v1";

// Demo/Lifetime test keys that unlock immediately for evaluation
const VALID_PRO_KEYS = new Set([
  "GLYPH-PRO-LIFETIME",
  "GLYPH-PRO-2026",
  "GLYPH-EARLY-CREATOR",
  "GLYPH-VIP",
]);

export interface ProLicenseInfo {
  isPro: boolean;
  licenseKey: string | null;
  activatedAt: number | null;
}

const DEFAULT_LICENSE: ProLicenseInfo = {
  isPro: false,
  licenseKey: null,
  activatedAt: null,
};

function subscribeLicense(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("glyph_pro_status_change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("glyph_pro_status_change", callback);
    window.removeEventListener("storage", callback);
  };
}

let cachedLicense: ProLicenseInfo = DEFAULT_LICENSE;
let lastRawLicenseValue: string | null = null;

function getLicenseSnapshot(): ProLicenseInfo {
  if (typeof window === "undefined") return DEFAULT_LICENSE;
  try {
    const raw = localStorage.getItem(LICENSE_STORAGE_KEY);
    if (raw !== lastRawLicenseValue) {
      lastRawLicenseValue = raw;
      cachedLicense = loadProLicense();
    }
  } catch {
    return DEFAULT_LICENSE;
  }
  return cachedLicense;
}

function getLicenseServerSnapshot(): ProLicenseInfo {
  return DEFAULT_LICENSE;
}

/**
 * Custom React hook for live Pro license status across tabs and modals
 */
export function useProLicense() {
  const license = useSyncExternalStore(
    subscribeLicense,
    getLicenseSnapshot,
    getLicenseServerSnapshot
  );

  return {
    isPro: license.isPro,
    licenseKey: license.licenseKey,
    activatedAt: license.activatedAt,
    activate: activateProLicense,
    revoke: revokeProLicense,
  };
}

export function loadProLicense(): ProLicenseInfo {
  if (typeof window === "undefined") {
    return { isPro: false, licenseKey: null, activatedAt: null };
  }
  try {
    const raw = localStorage.getItem(LICENSE_STORAGE_KEY);
    if (!raw) return { isPro: false, licenseKey: null, activatedAt: null };
    const parsed = JSON.parse(raw);
    return {
      isPro: Boolean(parsed?.isPro),
      licenseKey: parsed?.licenseKey || null,
      activatedAt: parsed?.activatedAt || null,
    };
  } catch {
    return { isPro: false, licenseKey: null, activatedAt: null };
  }
}

export function activateProLicense(keyInput: string): { success: boolean; message: string } {
  const cleanKey = keyInput.trim().toUpperCase();
  if (!cleanKey) {
    return { success: false, message: "Please enter a license key." };
  }

  // Key validation: either predefined test keys or standard format GLYPH-XXXX-XXXX-XXXX
  const isMatch =
    VALID_PRO_KEYS.has(cleanKey) ||
    /^GLYPH-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(cleanKey);

  if (!isMatch) {
    return {
      success: false,
      message: "Invalid license key. Try demo key: GLYPH-PRO-LIFETIME",
    };
  }

  const payload: ProLicenseInfo = {
    isPro: true,
    licenseKey: cleanKey,
    activatedAt: Date.now(),
  };

  try {
    localStorage.setItem(LICENSE_STORAGE_KEY, JSON.stringify(payload));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("glyph_pro_status_change"));
    }
    return { success: true, message: "Lifetime Pro activated successfully!" };
  } catch {
    return { success: false, message: "Failed to store license. Check browser storage." };
  }
}

export function revokeProLicense(): void {
  try {
    localStorage.removeItem(LICENSE_STORAGE_KEY);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("glyph_pro_status_change"));
    }
  } catch {
    // Ignore error
  }
}
