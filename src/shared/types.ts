// ─── Storage shapes ───────────────────────────────────────────────────────────

export interface SiteProtectedClasses {
  siteSlug: string;
  displayName: string;
  protectedClasses: string[];
  updatedAt: number;
}

export interface GlobalSettings {
  enabled: boolean;
  lockMode: "overlay" | "disable";
  showBadge: boolean;
}

export const DEFAULT_SETTINGS: GlobalSettings = {
  enabled: true,
  lockMode: "overlay",
  showBadge: true,
};

// ─── Message types ────────────────────────────────────────────────────────────

export type Message =
  | { type: "PING" }
  | { type: "PONG"; siteSlug: string }
  | { type: "GET_SITE_SLUG" }
  | { type: "SITE_SLUG_RESPONSE"; siteSlug: string }
  | { type: "ADD_CLASS"; siteSlug: string; className: string }
  | { type: "REMOVE_CLASS"; siteSlug: string; className: string }
  | { type: "SETTINGS_UPDATED"; settings: GlobalSettings }
  | { type: "FORCE_CHECK" };
