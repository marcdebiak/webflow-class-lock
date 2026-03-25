import {
  addProtectedClass,
  removeProtectedClass,
  getSettings,
  saveSettings,
} from "../shared/storage";
import type { Message } from "../shared/types";

// ─── Install / startup ────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  // Nothing extra needed on install — storage is lazy-initialised on first use.
  console.log("[WCG] Webflow Class Guard installed.");
});

// ─── Message handler ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  handleMessage(message).then(sendResponse).catch((err) => {
    console.error("[WCG] Message handler error:", err);
    sendResponse(null);
  });
  return true; // Keep the message channel open for async response
});

async function handleMessage(message: Message): Promise<unknown> {
  switch (message.type) {
    case "ADD_CLASS":
      await addProtectedClass(message.siteSlug, message.className);
      return { ok: true };

    case "REMOVE_CLASS":
      await removeProtectedClass(message.siteSlug, message.className);
      return { ok: true };

    case "SETTINGS_UPDATED":
      await saveSettings(message.settings);
      // Broadcast to all Webflow designer tabs
      await broadcastToDesignerTabs(message);
      return { ok: true };

    case "OPEN_POPUP":
      // chrome.action.openPopup() requires Chrome 99+ and propagates the
      // user gesture from the content script click through the message.
      await chrome.action.openPopup().catch(() => {
        // Silently fail on older Chrome versions — the user can click the icon.
      });
      return { ok: true };

    default:
      return null;
  }
}

// ─── Badge management ─────────────────────────────────────────────────────────

chrome.storage.onChanged.addListener(async (changes) => {
  const settings = await getSettings();
  if (!settings.showBadge) {
    chrome.action.setBadgeText({ text: "" });
    return;
  }

  // Update badge on any site storage change (count of all protected classes
  // for the currently active tab's site is handled by the popup directly)
  const settingsChanged = changes["wcg_settings"];
  if (settingsChanged) {
    const newSettings = settingsChanged.newValue as { enabled?: boolean } | undefined;
    if (newSettings?.enabled === false) {
      chrome.action.setBadgeText({ text: "OFF" });
      chrome.action.setBadgeBackgroundColor({ color: "#888888" });
    } else {
      chrome.action.setBadgeText({ text: "" });
    }
  }
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function broadcastToDesignerTabs(message: Message): Promise<void> {
  const tabs = await chrome.tabs.query({
    url: [
      "https://*.design.webflow.com/*",
      "https://webflow.com/design/*",
    ],
  });

  for (const tab of tabs) {
    if (tab.id != null) {
      chrome.tabs.sendMessage(tab.id, message).catch(() => {
        // Tab may not have the content script loaded yet — ignore
      });
    }
  }
}
