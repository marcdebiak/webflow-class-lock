# Webflow Class Guard

A Chrome extension that protects global CSS classes from accidental edits in the Webflow Designer.

---

## What it does

When you select an element in Webflow whose active class is on your protected list, a lock overlay appears over the style panel — blocking any style changes until you either switch to a different class or temporarily disable protection.

**Combo class aware** — protecting `.section` only locks the panel when `.section` itself is the active editing target. If you're editing a combo class like `.section.section-hero`, the panel stays fully unlocked.

---

## Features

- 🔒 Lock overlay on the style panel when a protected class is active
- Right-click any class pill in the Designer → **Protect this class**
- Popup to add/remove protected classes by name
- Per-site storage — each Webflow project has its own independent list
- Master on/off toggle to disable protection temporarily without losing your list
- Works on both current (`*.design.webflow.com`) and legacy (`webflow.com/design/*`) Designer URLs

---

## Development

### Prerequisites

- Node.js 18+
- Chrome

### Install dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

Output goes to `dist/`.

### Watch mode

```bash
npm run dev
```

Rebuilds on file changes. You still need to manually reload the extension in Chrome after each build.

### Load the extension in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer Mode** (top-right toggle)
3. Click **Load unpacked** → select the `dist/` folder
4. Open any Webflow project in the Designer

After rebuilding, click the **reload ↺** icon on the extension card and close/reopen the Webflow tab.

---

## Project structure

```
src/
├── background/
│   └── service-worker.ts       # Handles storage writes from context menu
├── content/
│   ├── index.ts                # Bootstrap — wires observer, locker, context menu
│   ├── observer.ts             # Detects the active class in the selector bar
│   ├── locker.ts               # Applies/removes the lock overlay
│   ├── contextMenu.ts          # Right-click menu on class pills
│   └── styles/
│       └── lock-overlay.css    # Injected styles for the overlay and toast
├── popup/
│   ├── Popup.tsx               # Root popup component
│   ├── components/
│   │   ├── SiteIndicator.tsx   # Shows current site + connection status
│   │   ├── ClassList.tsx       # List of protected classes with remove buttons
│   │   └── AddClassForm.tsx    # Input to add a class by name
│   ├── popup.css
│   ├── index.html
│   └── main.tsx
└── shared/
    ├── constants.ts            # DOM selectors and config constants
    ├── storage.ts              # chrome.storage.sync wrappers
    └── types.ts                # Shared TypeScript types and message shapes
```

---

## DOM selectors

The extension identifies Webflow Designer elements using `data-automation-id` attributes. All confirmed selectors are in `src/shared/constants.ts`:

| Constant | Selector | What it targets |
|---|---|---|
| `SELECTOR_BAR` | `[data-automation-id="selector-widget"]` | Container holding all class pills |
| `CLASS_PILL` | `[data-automation-id="style-rule-token-wrapper"]` | Each individual class pill |
| `CLASS_PILL_TEXT` | `[data-automation-id="style-rule-token-text"]` | Text content inside a pill |
| `ACTIVE_CLASS_PILL` | `null` (detected via inline style) | Active pill has `cursor: text` |
| `STYLE_PANEL_BODY` | `[data-automation-id="StylePanel"]` | Main style panel container |

If Webflow updates their Designer UI and the extension stops working, these are the first things to check. You can override selectors at runtime without rebuilding by writing to `chrome.storage.sync` under the key `wcg_selectorOverrides`.

---

## Storage schema

Protected classes are stored in `chrome.storage.sync`, scoped per Webflow project:

```
wcg_site_<siteSlug>  →  { siteSlug, displayName, protectedClasses: string[], updatedAt }
wcg_settings         →  { enabled, lockMode, showBadge }
```

The site slug is extracted from the Designer URL — from the subdomain on `*.design.webflow.com` or from the path on `webflow.com/design/*`.

---

## Permissions

| Permission | Why it's needed |
|---|---|
| `storage` | Saves protected class lists and settings per Webflow project |
| `contextMenus` | Adds "Protect this class" to the right-click menu on class pills |
| `activeTab` | Lets the popup communicate with the active Webflow Designer tab |
| Host: `*.design.webflow.com` | Injects the content script into the Webflow Designer |
| Host: `webflow.com/design/*` | Injects the content script into the legacy Designer URL format |

No data is collected, transmitted, or logged. Everything stays in Chrome's local storage.

---

## Tech stack

- [Vite 5](https://vitejs.dev/) + [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin)
- TypeScript
- React 18 (popup only)
- Manifest V3
