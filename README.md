# Webflow Class Guard

A Chrome extension that protects global CSS classes from accidental edits in the Webflow Designer.

---

## Quick Start

No build step needed — a pre-built version is included in the `dist/` folder.

1. Download or clone this repo
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer Mode** using the toggle in the top-right corner
4. Click **Load unpacked** and select the `dist/` folder
5. Open any Webflow project in the Designer
6. Click the Class Guard icon in the Chrome toolbar to get started

**To protect a class:**
- Right-click any class pill in the Webflow selector bar and choose **Protect this class**, or
- Open the popup, type a class name, and click **Protect**

**To use a framework preset (MAST or Lumos):**
- Open the popup and select your framework under **Framework preset** — all core framework classes are protected instantly

**To unlock temporarily:**
- Use the master toggle in the popup to disable protection without losing your list, or
- Click **Unlock in Class Guard** on the lock overlay to open the popup directly

---

## What it does

When you select an element in Webflow whose active class is on your protected list, a lock overlay appears over the style panel — blocking any style changes until you either switch to a different class or temporarily disable protection.

**Combo class aware** — protecting `.section` only locks the panel when `.section` itself is the active editing target. If you're editing a combo class like `.section.section-hero`, the panel stays fully unlocked.

---

## Features

- Lock overlay on the style panel when a protected class is active
- Right-click any class pill in the Designer → **Protect this class**
- Popup to add/remove protected classes by name
- Built-in presets for MAST and Lumos framework classes
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
│   │   ├── AddClassForm.tsx    # Input to add a class by name
│   │   └── FrameworkSelector.tsx  # Framework preset picker
│   ├── popup.css
│   ├── index.html
│   └── main.tsx
└── shared/
    ├── constants.ts            # DOM selectors, config constants, framework presets
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
wcg_site_<siteSlug>  →  { siteSlug, displayName, protectedClasses: string[], activeFramework: string | null, updatedAt }
wcg_settings         →  { enabled, lockMode, showBadge }
```

The site slug is extracted from the Designer URL — from the subdomain on `*.design.webflow.com` or from the path on `webflow.com/design/*`.

---

## Permissions

| Permission | Why it's needed |
|---|---|
| `storage` | Saves protected class lists and settings per Webflow project |
| `activeTab` | Lets the popup communicate with the active Webflow Designer tab |
| Host: `*.design.webflow.com` | Injects the content script into the Webflow Designer |
| Host: `webflow.com/design/*` | Injects the content script into the legacy Designer URL format |

No data is collected, transmitted, or logged. Everything stays in Chrome's built-in storage. See [PRIVACY.md](./PRIVACY.md) for the full privacy policy.

---

## Tech stack

- [Vite 5](https://vitejs.dev/) + [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin)
- TypeScript
- React 18 (popup only)
- Manifest V3

---

## Credits

Developed by [Paper Tiger](https://papertiger.com).

Framework presets:
- **MAST** — created by Corey Moen at [No Code Supply](https://nocodesupply.co)
- **Lumos** — created by [Timothy Ricks](https://timothyricks.com)

Class Guard is not affiliated with either framework.
