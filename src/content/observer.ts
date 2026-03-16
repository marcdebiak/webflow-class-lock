import {
  SELECTORS,
  POLL_INTERVAL_MS,
  ELEMENT_WAIT_TIMEOUT_MS,
} from "../shared/constants";

type ClassChangeCallback = (className: string | null) => void;

/**
 * Watches the Webflow designer's selector bar for the currently active class.
 *
 * Uses two complementary strategies:
 *  1. MutationObserver on the selector bar subtree (fast, event-driven).
 *  2. Polling watchdog every POLL_INTERVAL_MS ms (catches React state changes
 *     that don't emit DOM mutations).
 */
export class ActiveClassObserver {
  private mutationObserver: MutationObserver | null = null;
  private pollingTimer: ReturnType<typeof setInterval> | null = null;
  private lastActiveClass: string | null = null;
  private selectorOverrides: Partial<typeof SELECTORS> = {};

  constructor(private onClassChange: ClassChangeCallback) {}

  async start(): Promise<void> {
    // Load any runtime selector overrides from storage
    try {
      const result = await chrome.storage.sync.get("wcg_selectorOverrides");
      if (result["wcg_selectorOverrides"]) {
        this.selectorOverrides = result["wcg_selectorOverrides"];
      }
    } catch {
      // Storage not available (e.g., during unit tests) — use defaults
    }

    const selectorBar = await this.waitForElement(this.sel("SELECTOR_BAR"));
    if (!selectorBar) {
      // This is expected on non-designer pages (e.g. the project dashboard).
      // Only log at debug level — not a real error unless you're inside the designer.
      console.debug("[WCG] Selector bar not found — not in designer view.");
      return;
    }

    this.observeElement(selectorBar);
    this.startPollingWatchdog();
    this.checkActiveClass(); // Initial read
  }

  stop(): void {
    this.mutationObserver?.disconnect();
    this.mutationObserver = null;
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  /** Force an immediate re-check (e.g. after storage changes).
   *
   * Resets the cached active class so checkActiveClass() always fires
   * onClassChange — even when the active class name hasn't changed but
   * its protected status has (e.g. right-click → protect on the current class).
   */
  forceCheck(): void {
    this.lastActiveClass = null;
    this.checkActiveClass();
  }

  // ─── Private ────────────────────────────────────────────────────────────────

  private observeElement(selectorBar: Element): void {
    this.mutationObserver = new MutationObserver(() => {
      this.checkActiveClass();
    });
    this.mutationObserver.observe(selectorBar, {
      childList: true,
      subtree: true,
      attributes: true,
      // "style" catches the blue background toggling on the active pill.
      // Webflow does not use aria-selected — active state is inline style only.
      attributeFilter: ["style", "class", "aria-selected", "aria-pressed"],
    });
  }

  private startPollingWatchdog(): void {
    this.pollingTimer = setInterval(
      () => this.checkActiveClass(),
      POLL_INTERVAL_MS
    );
  }

  private checkActiveClass(): void {
    const activePill = this.findActivePill();
    const className = activePill ? this.readClassName(activePill) : null;

    if (className !== this.lastActiveClass) {
      this.lastActiveClass = className;
      this.onClassChange(className);
    }
  }

  private findActivePill(): Element | null {
    const pillSelector = this.sel("CLASS_PILL");
    if (!pillSelector) return null;

    const pills = Array.from(document.querySelectorAll(pillSelector));

    // Helper: pills that have actual class name text (excludes icon-only pills
    // like the breakpoint indicator which has no text content).
    const textPills = pills.filter((p) => {
      const textSelector = this.sel("CLASS_PILL_TEXT");
      const textEl = textSelector ? p.querySelector(textSelector) : p;
      return textEl?.textContent?.trim();
    });

    // Strategy 1: In Webflow, ALL editable class pills in a combo get
    // cursor:text — so we take the LAST cursor:text pill, which is always
    // the active combo class. Taking the first would incorrectly lock on
    // the protected base class even when a combo class is being edited.
    const cursorTextPills = textPills.filter(
      (p) => (p as HTMLElement).style.cursor === "text"
    );
    if (cursorTextPills.length > 0) {
      return cursorTextPills[cursorTextPills.length - 1];
    }

    // Strategy 2: last pill with a blue background (future-proofing if
    // Webflow changes cursor behaviour).
    const bluePills = textPills.filter((p) =>
      (p as HTMLElement).style.background?.includes("blue")
    );
    if (bluePills.length > 0) return bluePills[bluePills.length - 1];

    // Strategy 3: aria-selected / aria-pressed (future-proofing)
    const ariaPill = textPills.findLast(
      (p) =>
        p.getAttribute("aria-selected") === "true" ||
        p.getAttribute("aria-pressed") === "true"
    );
    if (ariaPill) return ariaPill;

    // Strategy 4: bare fallback — the last text pill.
    return textPills[textPills.length - 1] ?? null;
  }

  private readClassName(pill: Element): string | null {
    const textSelector = this.sel("CLASS_PILL_TEXT");
    const textEl = textSelector ? pill.querySelector(textSelector) : null;
    const raw = (textEl ?? pill).textContent?.trim() ?? null;
    return raw ? raw.replace(/^\./, "") : null;
  }

  /** Get a selector, applying any runtime overrides. */
  private sel(key: keyof typeof SELECTORS): string | null {
    const override = (this.selectorOverrides as Record<string, string | null>)[key];
    if (override !== undefined) return override;
    return SELECTORS[key] as string | null;
  }

  /** Wait for an element to appear in the DOM, with timeout. */
  private waitForElement(
    selector: string | null
  ): Promise<Element | null> {
    if (!selector) return Promise.resolve(null);

    return new Promise((resolve) => {
      const existing = document.querySelector(selector);
      if (existing) return resolve(existing);

      const timer = setTimeout(() => {
        obs.disconnect();
        resolve(null);
      }, ELEMENT_WAIT_TIMEOUT_MS);

      const obs = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearTimeout(timer);
          obs.disconnect();
          resolve(el);
        }
      });

      obs.observe(document.body, { childList: true, subtree: true });
    });
  }
}
