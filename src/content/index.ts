import "./styles/lock-overlay.css";
import { ActiveClassObserver } from "./observer";
import { StylePanelLocker } from "./locker";
import { initContextMenu } from "./contextMenu";
import {
  extractSiteSlug,
  getAllProtectedClasses,
  getSettings,
} from "../shared/storage";
import type { Message, GlobalSettings } from "../shared/types";

let observer: ActiveClassObserver | null = null;
let locker: StylePanelLocker | null = null;
let cleanupContextMenu: (() => void) | null = null;
let currentSettings: GlobalSettings | null = null;

// ─── Designer detection ───────────────────────────────────────────────────────

/**
 * Returns true when the current page is an active designer session.
 * The content script also runs on the Webflow project dashboard
 * (e.g. outerspace-webflow.design.webflow.com/) where no selector
 * widget exists. We detect the designer by waiting for the selector
 * bar — if it never appears we exit silently.
 */
function isDesignerUrl(): boolean {
  const host = location.hostname;
  const path = location.pathname;
  // New format: <slug>.design.webflow.com  (any path — it's a SPA)
  if (host.endsWith(".design.webflow.com")) return true;
  // Old format: webflow.com/design/<slug>
  if (host === "webflow.com" && path.startsWith("/design/")) return true;
  return false;
}

// ─── Bootstrap ────────────────────────────────────────────────────────────────

async function init(): Promise<void> {
  if (!isDesignerUrl()) return;
  const siteSlug = extractSiteSlug();
  currentSettings = await getSettings();

  locker = new StylePanelLocker(currentSettings);

  observer = new ActiveClassObserver(async (activeClass) => {
    if (!locker || !currentSettings?.enabled) {
      locker?.unlock();
      return;
    }

    if (!activeClass) {
      locker.unlock();
      return;
    }

    const protectedClasses = await getAllProtectedClasses(siteSlug);

    if (protectedClasses.includes(activeClass)) {
      locker.lock(activeClass);
    } else {
      locker.unlock();
    }
  });

  await observer.start();

  cleanupContextMenu = initContextMenu(siteSlug);

  console.log(
    `[WCG] Webflow Class Guard active on site: ${siteSlug}. ` +
      `Protection: ${currentSettings.enabled ? "ON" : "OFF"}.`
  );
}

// ─── SPA navigation handling ──────────────────────────────────────────────────

let lastHref = location.href;

new MutationObserver(() => {
  if (location.href !== lastHref) {
    lastHref = location.href;
    onNavigate();
  }
}).observe(document.body, { childList: true, subtree: false });

function onNavigate(): void {
  // The designer's panels may have been recreated — restart the observer.
  observer?.stop();
  observer?.start().catch(console.error);
}

// ─── Message listener (from popup / service worker) ──────────────────────────

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    handleMessage(message).then(sendResponse).catch(() => sendResponse(null));
    return true;
  }
);

async function handleMessage(message: Message): Promise<unknown> {
  switch (message.type) {
    case "PING":
      return { type: "PONG", siteSlug: extractSiteSlug() };

    case "GET_SITE_SLUG":
      return { type: "SITE_SLUG_RESPONSE", siteSlug: extractSiteSlug() };

    case "SETTINGS_UPDATED":
      currentSettings = message.settings;
      locker?.updateSettings(message.settings);
      if (!message.settings.enabled) locker?.unlock();
      else observer?.forceCheck();
      return { ok: true };

    case "FORCE_CHECK":
      observer?.forceCheck();
      return { ok: true };

    default:
      // Storage changes (ADD_CLASS / REMOVE_CLASS) are handled by the service
      // worker — we just need to re-check the active class when storage changes.
      return null;
  }
}

// ─── Re-check when storage changes (class added/removed via popup) ────────────

chrome.storage.onChanged.addListener((changes) => {
  const siteKey = `wcg_site_${extractSiteSlug()}`;
  if (changes[siteKey] || changes["wcg_settings"]) {
    observer?.forceCheck();
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────

init().catch((err) => {
  console.error("[WCG] Init failed:", err);
});
