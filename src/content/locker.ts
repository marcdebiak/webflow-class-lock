import { SELECTORS } from "../shared/constants";
import type { GlobalSettings } from "../shared/types";

const OVERLAY_ID = "wcg-lock-overlay";

/**
 * Applies and removes the lock UI on the Webflow style panel body.
 *
 * Two strategies (controlled by settings.lockMode):
 *  - "overlay"  : Injects a semi-transparent overlay div that blocks pointer
 *                 events. This is the default — it's obvious and non-destructive.
 *  - "disable"  : Sets pointer-events:none + opacity on the panel body directly.
 *                 Less visible but doesn't alter the DOM structure.
 */
export class StylePanelLocker {
  private lockedClass: string | null = null;
  private settings: GlobalSettings;

  constructor(settings: GlobalSettings) {
    this.settings = settings;
  }

  updateSettings(settings: GlobalSettings): void {
    const wasLocked = this.lockedClass;
    if (wasLocked) this.unlock();
    this.settings = settings;
    if (wasLocked) this.lock(wasLocked);
  }

  lock(className: string): void {
    if (!this.settings.enabled) return;
    if (this.lockedClass === className) return;

    this.unlock(); // Remove any existing lock first

    const panelBody = document.querySelector(SELECTORS.STYLE_PANEL_BODY) as HTMLElement | null;
    if (!panelBody) {
      console.warn("[WCG] Style panel body not found — cannot apply lock.");
      return;
    }

    if (this.settings.lockMode === "overlay") {
      this.applyOverlay(panelBody, className);
    } else {
      this.applyDisable(panelBody);
    }

    this.lockedClass = className;
  }

  unlock(): void {
    if (!this.lockedClass) return;

    // Remove overlay
    document.getElementById(OVERLAY_ID)?.remove();

    // Restore disable mode
    const panelBody = document.querySelector(SELECTORS.STYLE_PANEL_BODY) as HTMLElement | null;
    if (panelBody) {
      panelBody.style.removeProperty("pointer-events");
      panelBody.style.removeProperty("opacity");
      panelBody.removeAttribute("data-wcg-locked");
    }

    this.lockedClass = null;
  }

  get isLocked(): boolean {
    return this.lockedClass !== null;
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  private applyOverlay(panelBody: HTMLElement, className: string): void {
    // Ensure the panel is positioned so the overlay can anchor to it
    const pos = getComputedStyle(panelBody).position;
    if (pos === "static") {
      panelBody.style.position = "relative";
      panelBody.setAttribute("data-wcg-position-override", "true");
    }

    // Position the overlay to start BELOW the selector-widget so the class
    // pills remain clickable, letting the user switch to an unprotected class.
    const selectorWidget = panelBody.querySelector(
      '[data-automation-id="selector-widget"]'
    ) as HTMLElement | null;
    const topOffset = selectorWidget
      ? selectorWidget.offsetTop + selectorWidget.offsetHeight
      : 0;

    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;
    overlay.setAttribute("data-wcg", "true");
    overlay.style.top = `${topOffset}px`;
    overlay.innerHTML = `
      <span class="wcg-lock-overlay__icon">&#x1F512;</span>
      <div class="wcg-lock-overlay__content">
        <strong class="wcg-lock-overlay__class">.${className}</strong>
        <span class="wcg-lock-overlay__label">is protected</span>
      </div>
      <button class="wcg-lock-overlay__hint" data-wcg="true">
        Unlock in Class Guard ↗
      </button>
    `;

    panelBody.appendChild(overlay);
  }

  private applyDisable(panelBody: HTMLElement): void {
    panelBody.style.pointerEvents = "none";
    panelBody.style.opacity = "0.35";
    panelBody.setAttribute("data-wcg-locked", "true");
  }
}
