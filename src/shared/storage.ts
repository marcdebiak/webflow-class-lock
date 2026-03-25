import { type SiteProtectedClasses, type GlobalSettings, DEFAULT_SETTINGS } from "./types";
import { STORAGE_KEYS, FRAMEWORK_PRESETS } from "./constants";

// ─── Site slug extraction ─────────────────────────────────────────────────────

export function extractSiteSlug(): string {
  const host = location.hostname;

  // New URL format: my-project.design.webflow.com
  const subdomainMatch = host.match(/^(.+)\.design\.webflow\.com$/);
  if (subdomainMatch) return subdomainMatch[1];

  // Old URL format: webflow.com/design/my-project
  const pathMatch = location.pathname.match(/^\/design\/([^/]+)/);
  if (pathMatch) return pathMatch[1];

  // Fallback
  return host.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
}

// ─── Protected classes ────────────────────────────────────────────────────────

function siteKey(siteSlug: string): string {
  return `${STORAGE_KEYS.SITE_PREFIX}${siteSlug}`;
}

export async function getSiteData(siteSlug: string): Promise<SiteProtectedClasses | null> {
  const key = siteKey(siteSlug);
  const result = await chrome.storage.sync.get(key);
  return (result[key] as SiteProtectedClasses | undefined) ?? null;
}

export async function getProtectedClasses(siteSlug: string): Promise<string[]> {
  const record = await getSiteData(siteSlug);
  return record?.protectedClasses ?? [];
}

/** Returns custom classes + the active framework's classes merged (no duplicates). */
export async function getAllProtectedClasses(siteSlug: string): Promise<string[]> {
  const record = await getSiteData(siteSlug);
  const custom = record?.protectedClasses ?? [];
  const frameworkClasses = record?.activeFramework
    ? (FRAMEWORK_PRESETS[record.activeFramework]?.classes ?? [])
    : [];
  return [...new Set([...frameworkClasses, ...custom])];
}

export async function setActiveFramework(
  siteSlug: string,
  frameworkId: string | null
): Promise<void> {
  const key = siteKey(siteSlug);
  const result = await chrome.storage.sync.get(key);
  const record: SiteProtectedClasses = result[key] ?? {
    siteSlug,
    displayName: siteSlug,
    protectedClasses: [],
    activeFramework: null,
    updatedAt: Date.now(),
  };
  record.activeFramework = frameworkId;
  record.updatedAt = Date.now();
  await chrome.storage.sync.set({ [key]: record });
}

export async function addProtectedClass(
  siteSlug: string,
  className: string
): Promise<void> {
  const key = siteKey(siteSlug);
  const result = await chrome.storage.sync.get(key);
  const record: SiteProtectedClasses = result[key] ?? {
    siteSlug,
    displayName: siteSlug,
    protectedClasses: [],
    activeFramework: null,
    updatedAt: Date.now(),
  };

  const normalised = className.replace(/^\./, "").trim().toLowerCase();
  if (!normalised || record.protectedClasses.includes(normalised)) return;

  record.protectedClasses = [...record.protectedClasses, normalised];
  record.updatedAt = Date.now();
  await chrome.storage.sync.set({ [key]: record });
}

export async function removeProtectedClass(
  siteSlug: string,
  className: string
): Promise<void> {
  const key = siteKey(siteSlug);
  const result = await chrome.storage.sync.get(key);
  const record = result[key] as SiteProtectedClasses | undefined;
  if (!record) return;

  record.protectedClasses = record.protectedClasses.filter(
    (c) => c !== className
  );
  record.updatedAt = Date.now();
  await chrome.storage.sync.set({ [key]: record });
}

export async function getAllSiteRecords(): Promise<SiteProtectedClasses[]> {
  const all = await chrome.storage.sync.get(null);
  return Object.entries(all)
    .filter(([key]) => key.startsWith(STORAGE_KEYS.SITE_PREFIX))
    .map(([, value]) => value as SiteProtectedClasses);
}

// ─── Global settings ──────────────────────────────────────────────────────────

export async function getSettings(): Promise<GlobalSettings> {
  const result = await chrome.storage.sync.get(STORAGE_KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...(result[STORAGE_KEYS.SETTINGS] ?? {}) };
}

export async function saveSettings(
  settings: Partial<GlobalSettings>
): Promise<void> {
  const current = await getSettings();
  await chrome.storage.sync.set({
    [STORAGE_KEYS.SETTINGS]: { ...current, ...settings },
  });
}
