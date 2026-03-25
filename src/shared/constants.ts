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

// ─── Framework presets ────────────────────────────────────────────────────────

export interface FrameworkPreset {
  id: string;
  name: string;
  author: string;
  classes: string[];
}

export const FRAMEWORK_PRESETS: Record<string, FrameworkPreset> = {
  "mast": {
    id: "mast",
    name: "MAST",
    author: "No Code Supply",
    classes: [
      // Page structure
      "page-wrapper",
      "page-main",
      // Section & container
      "section",
      "container",
      // cc- combo class modifiers
      "cc-nav",
      "cc-narrow",
      "cc-footer",
      "cc-themed",
      // Grid — base
      "row",
      "col",
      "col-shrink",
      // Row gap
      "row-gutterless",
      "row-gap-md",
      "row-gap-sm",
      "row-gap-button",
      "row-gap-0",
      // Row justification
      "row-justify-center",
      "row-justify-end",
      "row-justify-between",
      "row-justify-around",
      // Row alignment
      "row-align-center",
      "row-align-end",
      "row-content-center",
      "row-content-end",
      "row-content-between",
      // Column edge-bleed helpers
      "col-lg-contain-left",
      "col-lg-contain-right",
      // Responsive columns — desktop (lg)
      "col-lg-1","col-lg-2","col-lg-3","col-lg-4","col-lg-5","col-lg-6",
      "col-lg-7","col-lg-8","col-lg-9","col-lg-10","col-lg-11","col-lg-12",
      // Responsive columns — tablet (md)
      "col-md-1","col-md-2","col-md-3","col-md-4","col-md-5","col-md-6",
      "col-md-7","col-md-8","col-md-9","col-md-10","col-md-11","col-md-12",
      // Responsive columns — mobile landscape (sm)
      "col-sm-1","col-sm-2","col-sm-3","col-sm-4","col-sm-5","col-sm-6",
      "col-sm-7","col-sm-8","col-sm-9","col-sm-10","col-sm-11","col-sm-12",
      // Responsive columns — mobile portrait (xs)
      "col-xs-1","col-xs-2","col-xs-3","col-xs-4","col-xs-5","col-xs-6",
      "col-xs-7","col-xs-8","col-xs-9","col-xs-10","col-xs-11","col-xs-12",
      // Column offsets (lg)
      "col-lg-offset-1","col-lg-offset-2","col-lg-offset-3",
      "col-lg-offset-4","col-lg-offset-5","col-lg-offset-6",
      // Column offsets (md)
      "col-md-offset-1","col-md-offset-2","col-md-offset-3",
      "col-md-offset-4","col-md-offset-5","col-md-offset-6",
      // Column offsets (sm)
      "col-sm-offset-1","col-sm-offset-2","col-sm-offset-3",
      "col-sm-offset-4","col-sm-offset-5","col-sm-offset-6",
      // Column offsets (xs)
      "col-xs-offset-1","col-xs-offset-2","col-xs-offset-3",
      "col-xs-offset-4","col-xs-offset-5","col-xs-offset-6",
      // Column reordering
      "col-lg-first","col-lg-last",
      "col-md-first","col-md-last",
      "col-sm-first","col-sm-last",
      "col-xs-first","col-xs-last",
      // Spacing utilities
      "u-mt-0","u-mt-sm","u-mt-md","u-mt-lg","u-mt-auto",
      "u-mb-0","u-mb-sm","u-mb-md","u-mb-lg","u-mb-auto",
      "u-m-0","u-mlr-auto",
      "u-pt-0","u-pb-0","u-p-0",
      // Display / visibility utilities
      "u-d-none","u-d-block","u-d-flex","u-d-inline-flex","u-d-contents",
      "u-md-d-none","u-sm-d-none","u-xs-d-none",
      "u-md-d-block","u-sm-d-block","u-xs-d-block",
      "u-sr-only",
      "anti-flicker",
      // Position & overflow
      "u-position-relative",
      "u-position-sticky",
      "u-overflow-hidden",
      "u-overflow-visible",
      "u-z-index-1",
      // Sizing
      "u-w-100","u-h-100","u-minh-100vh",
      "u-aspect-1x1","u-aspect-16x9","u-aspect-4x3",
      // Text alignment
      "u-text-center","u-text-right","u-text-left",
      "u-text-clamp-1","u-text-clamp-2","u-text-clamp-3",
      "u-text-balance","u-text-pretty",
      // Cover helpers
      "u-img-cover","u-link-cover","u-border",
      // Typography base classes
      "h1","h2","h3","h4","h5","h6",
      "paragraph-xl","paragraph-lg","paragraph-sm",
      "eyebrow","rich-text",
    ],
  },

  "lumos": {
    id: "lumos",
    name: "Lumos",
    author: "Timothy Ricks",
    classes: [
      // Component elements
      "u-layout-wrapper",
      "u-layout",
      "u-layout-column-1", "u-layout-column-2",
      "u-grid-wrapper",
      "u-grid",
      "u-content-wrapper",
      "u-background-slot",
      "u-video",
      "u-image-wrapper", "u-image",
      "u-iframe-wrapper", "u-iframe",
      "u-overlay",
      "u-eyebrow-wrapper", "u-eyebrow-layout", "u-eyebrow-marker", "u-eyebrow-text",
      "u-text", "u-heading",
      "u-button-wrapper",
      "u-section", "u-section-spacer",
      "u-container-small", "u-container-full",
      "u-svg", "u-path",
      "u-embed-css", "u-embed-js",
      // Color & theme
      "u-theme-inherit", "u-theme-light", "u-theme-dark", "u-theme-brand",
      "u-heading-accent",
      "u-color-inherit", "u-color-faded",
      "u-background-transparent", "u-background-1", "u-background-2", "u-background-skeleton",
      // Typography
      "u-text-style-display",
      "u-text-style-h1", "u-text-style-h2", "u-text-style-h3",
      "u-text-style-h4", "u-text-style-h5", "u-text-style-h6",
      "u-text-style-large", "u-text-style-main", "u-text-style-small",
      "u-rich-text",
      "u-line-height-small", "u-line-height-medium", "u-line-height-large", "u-line-height-huge",
      "u-letter-spacing-tight", "u-letter-spacing-normal",
      "u-sr-only",
      "u-line-clamp-1", "u-line-clamp-2", "u-line-clamp-3", "u-line-clamp-4",
      "u-margin-trim", "u-ignore-trim",
      "u-weight-regular", "u-weight-medium", "u-weight-bold",
      "u-alignment-inherit", "u-alignment-start", "u-alignment-center", "u-alignment-end",
      "u-text-transform-none", "u-text-transform-uppercase",
      "u-text-transform-capitalize", "u-text-transform-lowercase",
      "u-text-wrap-default", "u-text-wrap-balance", "u-text-wrap-pretty",
      "u-text-trim-off",
      // Flexbox
      "u-flex-horizontal-wrap", "u-flex-horizontal-nowrap",
      "u-flex-vertical-wrap", "u-flex-vertical-nowrap",
      "u-flex-grow", "u-flex-shrink", "u-flex-noshrink",
      "u-align-self-inherit", "u-align-self-start", "u-align-self-center",
      "u-align-self-end", "u-align-self-stretch",
      "u-align-items-inherit", "u-align-items-start", "u-align-items-center",
      "u-align-items-end", "u-align-items-stretch",
      "u-justify-content-inherit", "u-justify-content-start", "u-justify-content-center",
      "u-justify-content-end", "u-justify-content-between", "u-justify-content-around",
      // Grid
      "u-grid-custom", "u-grid-subgrid",
      "u-grid-autofit", "u-grid-autofill",
      "u-grid-breakout",
      "u-column-span-full", "u-column-span-indent",
      "u-column-span-1","u-column-span-2","u-column-span-3","u-column-span-4",
      "u-column-span-5","u-column-span-6","u-column-span-7","u-column-span-8",
      "u-column-span-9","u-column-span-10","u-column-span-11","u-column-span-12",
      "u-row-span-1","u-row-span-2","u-row-span-3","u-row-span-4","u-row-span-5","u-row-span-6",
      "u-row-start-auto",
      "u-row-start-1","u-row-start-2","u-row-start-3","u-row-start-4","u-row-start-5","u-row-start-6",
      "u-column-start-auto",
      "u-column-start-1","u-column-start-2","u-column-start-3","u-column-start-4",
      "u-column-start-5","u-column-start-6","u-column-start-7","u-column-start-8",
      "u-column-start-9","u-column-start-10","u-column-start-11","u-column-start-12",
      // Spacing — gap
      "u-gap-inherit","u-gap-gutter",
      "u-gap-0","u-gap-1","u-gap-2","u-gap-3","u-gap-4","u-gap-5","u-gap-6","u-gap-7","u-gap-8",
      "u-gap-row-inherit","u-gap-row-gutter",
      "u-gap-row-0","u-gap-row-1","u-gap-row-2","u-gap-row-3","u-gap-row-4",
      "u-gap-row-5","u-gap-row-6","u-gap-row-7","u-gap-row-8",
      // Spacing — margin
      "u-margin-top-gutter","u-margin-top-text","u-margin-top-auto",
      "u-margin-top-0","u-margin-top-1","u-margin-top-2","u-margin-top-3","u-margin-top-4",
      "u-margin-top-5","u-margin-top-6","u-margin-top-7","u-margin-top-8",
      "u-margin-bottom-gutter","u-margin-bottom-text","u-margin-bottom-auto",
      "u-margin-bottom-0","u-margin-bottom-1","u-margin-bottom-2","u-margin-bottom-3","u-margin-bottom-4",
      "u-margin-bottom-5","u-margin-bottom-6","u-margin-bottom-7","u-margin-bottom-8",
      "u-margin-inline-auto",
      // Spacing — padding
      "u-padding-top-sitemargin","u-padding-top-gutter","u-padding-top-small","u-padding-top-main","u-padding-top-large",
      "u-padding-top-0","u-padding-top-1","u-padding-top-2","u-padding-top-3","u-padding-top-4",
      "u-padding-top-5","u-padding-top-6","u-padding-top-7","u-padding-top-8",
      "u-padding-bottom-sitemargin","u-padding-bottom-gutter","u-padding-bottom-small","u-padding-bottom-main","u-padding-bottom-large",
      "u-padding-bottom-0","u-padding-bottom-1","u-padding-bottom-2","u-padding-bottom-3","u-padding-bottom-4",
      "u-padding-bottom-5","u-padding-bottom-6","u-padding-bottom-7","u-padding-bottom-8",
      "u-padding-right-sitemargin","u-padding-right-gutter",
      "u-padding-right-0","u-padding-right-1","u-padding-right-2","u-padding-right-3","u-padding-right-4",
      "u-padding-right-5","u-padding-right-6","u-padding-right-7","u-padding-right-8",
      "u-padding-left-sitemargin","u-padding-left-gutter",
      "u-padding-left-0","u-padding-left-1","u-padding-left-2","u-padding-left-3","u-padding-left-4",
      "u-padding-left-5","u-padding-left-6","u-padding-left-7","u-padding-left-8",
      "u-padding-inline-sitemargin","u-padding-inline-gutter",
      "u-padding-inline-0","u-padding-inline-1","u-padding-inline-2","u-padding-inline-3","u-padding-inline-4",
      "u-padding-inline-5","u-padding-inline-6","u-padding-inline-7","u-padding-inline-8",
      "u-padding-block-sitemargin","u-padding-block-gutter","u-padding-block-small","u-padding-block-main","u-padding-block-large",
      "u-padding-block-0","u-padding-block-1","u-padding-block-2","u-padding-block-3","u-padding-block-4",
      "u-padding-block-5","u-padding-block-6","u-padding-block-7","u-padding-block-8",
      "u-padding-sitemargin","u-padding-gutter","u-padding-small","u-padding-main","u-padding-large",
      "u-padding-0","u-padding-1","u-padding-2","u-padding-3","u-padding-4",
      "u-padding-5","u-padding-6","u-padding-7","u-padding-8",
      // Sizing
      "u-min-width-auto",
      "u-min-height-screen",
      "u-max-width-none", "u-max-width-full",
      "u-radius-none","u-radius-inherit","u-radius-small","u-radius-main","u-radius-round",
      "u-height-full","u-height-auto",
      "u-object-fit-cover","u-object-fit-contain",
      "u-ratio-auto","u-ratio-1-1","u-ratio-16-9","u-ratio-3-1",
      "u-ratio-2-3","u-ratio-2-1","u-ratio-5-4","u-ratio-4-5",
      "u-cover-absolute","u-cover",
      "u-width-full","u-width-auto",
      // Visibility & display
      "u-overflow-visible","u-overflow-hidden","u-overflow-clip",
      "u-overflow-x-auto","u-overflow-y-auto","u-overflow-hidden-left",
      "u-display-block","u-display-inline","u-display-inline-block",
      "u-display-inline-flex","u-display-inline-grid","u-display-contents","u-display-none",
      "u-hide-if-empty","u-hide-if-empty-cms",
      "u-zindex-negative","u-zindex-unset","u-zindex-0","u-zindex-1","u-zindex-2","u-zindex-3",
      "u-position-static","u-position-relative","u-position-absolute",
      "u-position-sticky","u-position-fixed",
      // Miscellaneous
      "u-pointer-on","u-pointer-off",
    ],
  },
};

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
