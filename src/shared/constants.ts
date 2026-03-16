/**
 * DOM selectors for the Webflow Designer.
 *
 * ⚠️  These selectors MUST be verified by inspecting the live Webflow Designer.
 *
 * HOW TO FIND THEM:
 *  1. Open any Webflow project in the designer.
 *  2. Open Chrome DevTools (F12) → Elements panel.
 *  3. Click an element on the canvas. The right-hand style panel will update.
 *  4. In DevTools, inspect the top of the right panel — the selector bar area
 *     showing coloured class pills (e.g. "heading-style", "u-container").
 *  5. For each selector below, look for a stable `data-*` or `aria-*` attribute
 *     rather than generated CSS Module class names (which change on every deploy).
 *
 * DEBUG MODE:
 *  Run this in the DevTools console to highlight matched elements:
 *
 *    const s = 'PUT_SELECTOR_HERE';
 *    document.querySelectorAll(s).forEach(el => el.style.outline = '2px solid red');
 *
 * After finding the correct selectors, update this file and rebuild the extension.
 * You can also override selectors at runtime via chrome.storage.sync under
 * the key "wcg_selectorOverrides" (see storage.ts).
 */

export const SELECTORS = {
  /**
   * The container element that wraps all class pills in the selector bar.
   * Confirmed via DOM inspection: data-automation-id="selector-widget"
   */
  SELECTOR_BAR: '[data-automation-id="selector-widget"]',

  /**
   * Each individual class pill / chip element.
   * Confirmed via DOM inspection: data-automation-id="style-rule-token-wrapper"
   */
  CLASS_PILL: '[data-automation-id="style-rule-token-wrapper"]',

  /**
   * The currently active/selected class pill.
   *
   * Webflow does NOT use an aria-selected attribute — instead the active pill
   * has an inline style `background: var(--colors-blue-background)`.
   * CSS selectors cannot match inline CSS variable values, so this is set to
   * null. Detection is handled in observer.ts via findActivePill().
   */
  ACTIVE_CLASS_PILL: null as string | null,

  /**
   * The text node / child element inside a pill holding the plain class name.
   * Confirmed via DOM inspection: data-automation-id="style-rule-token-text"
   */
  CLASS_PILL_TEXT: '[data-automation-id="style-rule-token-text"]',

  /**
   * The main style panel container.
   * Confirmed via DOM inspection: data-automation-id="StylePanel"
   *
   * The overlay is positioned to start below the selector-widget so that
   * class pills remain clickable (allowing the user to switch to an
   * unprotected class). See locker.ts for the dynamic top-offset logic.
   */
  STYLE_PANEL_BODY: '[data-automation-id="StylePanel"]',
} as const;

// Storage key constants
export const STORAGE_KEYS = {
  SETTINGS: "wcg_settings",
  SITE_PREFIX: "wcg_site_",
  SELECTOR_OVERRIDES: "wcg_selectorOverrides",
} as const;

// How often (ms) the polling watchdog re-checks the active class.
// Lower = more responsive, higher = less CPU usage.
export const POLL_INTERVAL_MS = 300;

// How long (ms) to wait for the selector bar to appear before giving up.
export const ELEMENT_WAIT_TIMEOUT_MS = 10_000;
