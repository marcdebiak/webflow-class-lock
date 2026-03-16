import { useEffect, useState, useCallback } from "react";
import {
  getProtectedClasses,
  addProtectedClass,
  removeProtectedClass,
  getSettings,
  saveSettings,
} from "../shared/storage";
import type { GlobalSettings, Message } from "../shared/types";
import { SiteIndicator } from "./components/SiteIndicator";
import { ClassList } from "./components/ClassList";
import { AddClassForm } from "./components/AddClassForm";

type ContentScriptStatus = "active" | "inactive" | "loading";

export function Popup() {
  const [siteSlug, setSiteSlug] = useState<string | null>(null);
  const [csStatus, setCsStatus] = useState<ContentScriptStatus>("loading");
  const [protectedClasses, setProtectedClasses] = useState<string[]>([]);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Bootstrap: ping active tab content script ─────────────────────────────

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (!tab?.id) {
          setCsStatus("inactive");
          return;
        }

        // Ping the content script with a short timeout
        const response = await Promise.race<Message | null>([
          chrome.tabs.sendMessage(tab.id, { type: "PING" } as Message),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 500)),
        ]).catch(() => null);

        if (cancelled) return;

        if (response?.type === "PONG") {
          setSiteSlug(response.siteSlug);
          setCsStatus("active");

          const [classes, s] = await Promise.all([
            getProtectedClasses(response.siteSlug),
            getSettings(),
          ]);
          setProtectedClasses(classes);
          setSettings(s);
        } else {
          setCsStatus("inactive");
          // Still load settings for the toggle display
          setSettings(await getSettings());
        }
      } catch (err) {
        if (!cancelled) {
          setError(String(err));
          setCsStatus("inactive");
        }
      }
    }

    bootstrap();
    return () => { cancelled = true; };
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────

  const handleAdd = useCallback(
    async (className: string) => {
      if (!siteSlug) return;
      await addProtectedClass(siteSlug, className);
      setProtectedClasses(await getProtectedClasses(siteSlug));
    },
    [siteSlug]
  );

  const handleRemove = useCallback(
    async (className: string) => {
      if (!siteSlug) return;
      await removeProtectedClass(siteSlug, className);
      setProtectedClasses(await getProtectedClasses(siteSlug));
    },
    [siteSlug]
  );

  const handleToggleEnabled = useCallback(async () => {
    if (!settings) return;
    const updated = { ...settings, enabled: !settings.enabled };
    await saveSettings(updated);
    setSettings(updated);

    // Broadcast to content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      chrome.tabs
        .sendMessage(tab.id, { type: "SETTINGS_UPDATED", settings: updated } as Message)
        .catch(() => {}); // Ignore if content script not active
    }
  }, [settings]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="popup">
      <header className="popup__header">
        <div className="popup__header-left">
          <span className="popup__icon">🔒</span>
          <span className="popup__title">Class Guard</span>
        </div>
        {settings && (
          <label className="toggle" title={settings.enabled ? "Protection on" : "Protection off"}>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={handleToggleEnabled}
            />
            <span className="toggle__track" />
          </label>
        )}
      </header>

      <SiteIndicator siteSlug={siteSlug} status={csStatus} />

      {csStatus === "inactive" && (
        <div className="popup__notice">
          Open a Webflow project in the Designer to manage protected classes.
        </div>
      )}

      {csStatus === "active" && siteSlug && (
        <>
          <ClassList
            classes={protectedClasses}
            onRemove={handleRemove}
          />
          <AddClassForm
            existingClasses={protectedClasses}
            onAdd={handleAdd}
          />
        </>
      )}

      {error && (
        <div className="popup__error">{error}</div>
      )}

      <footer className="popup__footer">
        Right-click a class pill in the designer to protect it quickly.
      </footer>
    </div>
  );
}
