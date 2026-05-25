# CLAUDE.md

Guidance for AI assistants working with the bipoltrack codebase.

## Project Overview

**BipolTrack** is a progressive web app for tracking bipolar disorder mood patterns, medications, and sleep. It is a **no-build-step, single-page application** — React 18 and Babel are loaded from CDN, JSX is transpiled at runtime, and there is no npm, no bundler, and no CI pipeline.

## Repository Structure

```
bipoltrack/
├── index.html              # Production app (Argile redesign, main entry point)
├── Argile.html             # Standalone redesign with live Tweaks panel
├── Redesign.html           # Design canvas comparing multiple directions
├── index-legacy.html       # Old version (reference only — do not modify)
├── oauth.html              # Google OAuth callback handler
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker stub
│
├── variations/
│   ├── v1-argile.jsx       # Main app component (ArgileApp, 1033+ lines)
│   └── argile-extras.jsx   # News, stats, meds, report, settings screens (1784+ lines)
│
├── tweaks-panel.jsx        # Live design-tweaks side panel (useTweaks hook + components)
├── design-canvas.jsx       # Figma-ish side-by-side canvas wrapper
├── ios-frame.jsx           # iPhone frame mockup used in Argile.html
│
├── assets/                 # PNG mascot variants (brulant, sombre, stable)
├── README.md               # User-facing redesign documentation (French)
└── GUIDE-GOOGLE-DRIVE.md   # End-user OAuth setup guide (French)
```

## How to Run Locally

No build step required — serve the repo with any static HTTP server:

```bash
python3 -m http.server 8000
# Open: http://localhost:8000/Argile.html   (current design)
# Open: http://localhost:8000/              (same, via index.html)
```

`file://` works but Babel transpilation is slower over HTTP. Always use HTTP for development.

## Architecture

### Tech Stack
- **React 18.3.1** — loaded from `unpkg` CDN via `<script>` tag with SRI hash
- **Babel Standalone** — transforms JSX at runtime (no build step)
- **Vanilla CSS-in-JS** — styles injected as template literals, scoped by component
- **localStorage** — primary data store (all keys prefixed `bt_`)
- **Google Drive** — optional cloud backup (OAuth 2.0 PKCE, `drive.file` scope)

### Screens (managed in `ArgileApp` in `variations/v1-argile.jsx`)

| Screen key | Purpose |
|---|---|
| `empty` | First-time onboarding |
| `journal` | Daily mood / humeur entry |
| `corps` | Energy and body state |
| `mot` | Daily word / thoughts capture |
| `done` | Reward animation after save |
| `news` | AI summary + RSS feeds |
| `stats-deep` | Annual notebook: sparkline, projection, calendar phases |
| `history` | Full list of past entries |
| `meds` | Treatment adherence tracking |
| `report` | Printable doctor report with clinical metrics |
| `settings` | Google Drive, Claude API key, exports, patient profile |

### Design System (Argile)

```javascript
const ARGILE = {
  clay:   '#B85839',   // primary accent
  sand:   '#EDDFC4',   // warm background
  cream:  '#F8F0DC',   // light surface
  ink:    '#2B1810',   // dark text
  olive:  '#5C6A3E',   // secondary accent
};
// Fonts: Instrument Serif (display), DM Sans (body), JetBrains Mono (numeric)
```

Mood is visualised as a clay orb sliding on a 0–100 scale with three zones:

| Zone | Range | Value |
|---|---|---|
| Tristesse (sadness) | 0–35 | `"tristesse"` |
| Sérénité (peace) | 35–65 | `"sérénité"` |
| Euphorie (elation) | 65–100 | `"euphorie"` |

## Data Schema

### Entry object (v2, stored in `bt_entries`)

```javascript
{
  date:          "2025-05-25",  // YYYY-MM-DD, always UTC
  humeur:        "sérénité",    // "tristesse" | "sérénité" | "euphorie"
  mood:          50,            // 0–100 numeric (v1 used 1–10 — see migration below)
  pensees:       "clarté",      // "confusion" | "clarté" | "profusion"
  energie:       "bien-être",   // "épuisement" | "bien-être" | "agitation"
  sleep:         7.5,           // hours as decimal
  note:          "Good day",    // optional free text
  _migrated_v2:  true           // migration flag
}
```

### localStorage Keys

| Key | Type | Description |
|---|---|---|
| `bt_entries` | Array | All entry objects |
| `bt_meds` | Array | Medication/treatment objects |
| `bt_patient_name` | String | Patient name |
| `bt_patient_dob` | String | Date of birth |
| `bt_patient_doctor` | String | Doctor name |
| `bt_drive_client_id` | String | Google OAuth Client ID |
| `bt_last_synced` | String | ISO timestamp of last Drive sync |
| `bt_google_token` | String | OAuth token (sessionStorage) |
| `bt_google_token_expiry` | String | Token expiry timestamp (sessionStorage) |

### Schema Migration

`migrateData()` in `argile-extras.jsx` runs automatically on load. It upgrades v1 entries (mood 1–10) to v2 (mood 0–100 + qualitative fields):

```javascript
function normMoodTo100(entry) {
  const m = entry.mood;
  return m <= 10 ? Math.round(m * 10) : m; // 1–10 → 0–100
}
```

## Key Conventions

### Date Handling
Always use `utcDayStr(offsetDays)` — **never** `new Date().toLocaleDateString()` — to avoid timezone offset bugs:

```javascript
const today     = utcDayStr(0);  // "2025-05-25"
const yesterday = utcDayStr(1);
```

### Adding / Modifying Screens
- Main entry flow (`journal`, `corps`, `mot`, `done`): edit `variations/v1-argile.jsx`
- Auxiliary screens (`news`, `stats-deep`, `history`, `meds`, `report`, `settings`): edit `variations/argile-extras.jsx`
- Routing is a single `screen` state variable and a `goTo(screenName)` helper

### Adding an Entry Field
1. Add the field to the entry schema comment and `_migrateEntry()` in `argile-extras.jsx`
2. Add a UI element in the appropriate screen component
3. Update `saveEntry()` to persist the new field
4. Add the field to the report component if clinically relevant

### Live Tweaks Panel
`tweaks-panel.jsx` exposes a reusable side-panel for rapid design iteration:

```javascript
const [tweaks, setTweak] = useTweaks(DEFAULTS);
// Components: <TweakSelect>, <TweakRadio>, <TweakSlider>, <TweakColor>, <TweakToggle>
```

CSS classes are prefixed `.twk-*` to avoid collisions. State syncs to localStorage automatically.

### Google Drive Sync
- OAuth flow: Client ID in localStorage, token in sessionStorage
- Auto-sync fires silently after entry save when token is fresh
- Backup file: `bipoltrack-backup.json` inside `BipolTrack-Sauvegardes/` folder
- Only the 10 most recent backups are kept
- Scope: `drive.file` (app can only see files it created)

## Testing

There is no automated test suite. Manual testing workflow:

1. Start the local server: `python3 -m http.server 8000`
2. Open `http://localhost:8000/Argile.html`
3. Use the Tweaks panel (bottom-right corner) to jump to any screen
4. Inspect data in DevTools → Application → Local Storage → `bt_entries`
5. For Drive testing: add a Client ID in Settings and follow `GUIDE-GOOGLE-DRIVE.md`

## Deployment

GitHub Pages — push to `main` and enable Pages in repo Settings. No build step required.

For Google Drive OAuth, the GitHub Pages origin must be registered as an authorised JavaScript origin in Google Cloud Console.

## Important Constraints

- **No npm / no bundler** — do not introduce `package.json`, webpack, Vite, or any build tooling without explicit agreement
- **No external dependencies** — all libraries come from CDN `<script>` tags with SRI hashes; do not add new ones without updating the hash
- **French UI** — all copy, labels, and field names are in French; keep new UI text in French
- **Mobile-first** — reference viewport is 390 × 844 px (iPhone 14); desktop is secondary
- **UTC dates only** — use `utcDayStr()` everywhere, never local date APIs
- **Legacy file** — `index-legacy.html` is read-only reference; do not modify it
