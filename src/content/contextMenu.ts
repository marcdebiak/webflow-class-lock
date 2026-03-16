import { SELECTORS } from "../shared/constants";
import type { Message } from "../shared/types";

const MENU_ID = "wcg-context-menu";

/**
 * Intercepts right-clicks on class pills in the Webflow designer selector bar
 * and shows a custom context menu with a "Protect this class" option.
 *
 * Uses capture-phase event listener to intercept before Webflow's own handlers.
 */
export function initContextMenu(siteSlug: string): () => void {
  const handler = (e: MouseEvent) => handleContextMenu(e, siteSlug);
  document.addEventListener("contextmenu", handler, true);

  // Dismiss menu on outside click or Escape
  const dismissOnClick = (e: MouseEvent) => {
    const menu = document.getElementById(MENU_ID);
    if (menu && !menu.contains(e.target as Node)) {
      removeMenu();
    }
  };
  const dismissOnEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") removeMenu();
  };

  document.addEventListener("click", dismissOnClick, true);
  document.addEventListener("keydown", dismissOnEsc, true);

  // Return cleanup function
  return () => {
    document.removeEventListener("contextmenu", handler, true);
    document.removeEventListener("click", dismissOnClick, true);
    document.removeEventListener("keydown", dismissOnEsc, true);
    removeMenu();
  };
}

function handleContextMenu(e: MouseEvent, siteSlug: string): void {
  const pillSelector = SELECTORS.CLASS_PILL;
  if (!pillSelector) return;

  const pill = (e.target as Element).closest(pillSelector);
  if (!pill) return;

  const className = readClassName(pill);
  if (!className) return;

  e.preventDefault();
  e.stopPropagation();

  showMenu(e.clientX, e.clientY, className, siteSlug);
}

function showMenu(
  x: number,
  y: number,
  className: string,
  siteSlug: string
): void {
  removeMenu();

  const menu = document.createElement("div");
  menu.id = MENU_ID;
  menu.setAttribute("data-wcg", "true");

  // Clamp to viewport
  const menuWidth = 220;
  const menuHeight = 80;
  const left = Math.min(x, window.innerWidth - menuWidth - 8);
  const top = Math.min(y, window.innerHeight - menuHeight - 8);

  menu.style.cssText = `
    position: fixed;
    left: ${left}px;
    top: ${top}px;
    z-index: 2147483647;
    width: ${menuWidth}px;
  `;

  menu.innerHTML = `
    <div class="wcg-ctx-header">Class Guard</div>
    <button class="wcg-ctx-item" id="wcg-ctx-protect">
      <span class="wcg-ctx-item__icon">&#x1F512;</span>
      <span class="wcg-ctx-item__text">
        Protect <strong>.${className}</strong>
      </span>
    </button>
  `;

  document.body.appendChild(menu);

  menu.querySelector("#wcg-ctx-protect")!.addEventListener("click", async () => {
    removeMenu();
    const msg: Message = { type: "ADD_CLASS", siteSlug, className };
    await chrome.runtime.sendMessage(msg);
    showConfirmationToast(`.${className} is now protected`);
  });
}

function removeMenu(): void {
  document.getElementById(MENU_ID)?.remove();
}

function readClassName(pill: Element): string | null {
  const textSelector = SELECTORS.CLASS_PILL_TEXT;
  const textEl = textSelector ? pill.querySelector(textSelector) : null;
  const raw = (textEl ?? pill).textContent?.trim() ?? null;
  return raw ? raw.replace(/^\./, "") : null;
}

function showConfirmationToast(message: string): void {
  const existing = document.getElementById("wcg-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "wcg-toast";
  toast.setAttribute("data-wcg", "true");
  toast.textContent = `🔒 ${message}`;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
