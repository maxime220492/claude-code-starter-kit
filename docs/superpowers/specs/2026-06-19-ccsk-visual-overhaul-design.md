# The Claude Code Starter Kit — Visual Overhaul (Landing + Course)

**Date:** 2026-06-19
**Status:** Approved (design), pending implementation plan
**Scope:** Two repos — `claude-code-starter-kit-landing` (public, GitHub Pages) and `claude-code-starter-kit-gumroad` (course build).

## Goal

Turn a text-heavy landing page and course into a visually-driven experience using real
illustrations, while keeping the existing terminal aesthetic. Top priority is the **course's
pedagogical quality**: learners must genuinely understand what they are doing, how to read an
agent's replies, and the dev basics — not just follow steps. The 31-tool "Toolbox" becomes
4 annotated category posters.

## Constraints & success criteria

- **Keep the terminal identity**, push it (depth, glow, real icons, schematic annotations). No new art direction.
- Every public file stays **secret-free** (no keys, no personal paths, no real names). Re-scan before publish.
- Illustrations render **anywhere** (course pulls them from `https://maxime220492.github.io/...`).
- Course illustrations must **teach**, not decorate: each one removes confusion at a known stuck point.
- Done = new/refreshed PNGs committed to `img/`, landing sections wired to them, `build-course.js`
  regenerated with the 4 posters + pedagogy images, both repos pushed, security re-scan clean.

## Reference (creator intent)

Inspiration video "Pourquoi j'utilise Claude Code uniquement dans le terminal"
(youtube 815DM3oAJGU). Confirms the angle and gives the mental models to illustrate:
- The terminal is **just another interface**. GUI = click-apps (Notion, VLC, Safari);
  CLI = text-apps (Claude Code, …), closer to the machine → more power.
- **3 ways to run Claude Code**: terminal (best), desktop app, cloud.ai web.
- The **slash command deck**: `/rewind`, `/compact`, `/context`, `/agents`, `/model`, `/effort`,
  status line, session resume — present in terminal, missing/limited elsewhere.

## Architecture — the illustration pipeline (unchanged, extended)

```
_illus/<name>.html   (standalone, fixed-size, dark theme, inline SVG)
   │  Chrome headless screenshot @2x
   ▼
img/<name>.png       (committed; published on GitHub Pages)
   │
   ├── landing index.html      → <img src="img/<name>.png">
   └── course build-course.js  → https://maxime220492.github.io/.../img/<name>.png
```

- **Render command (validated):**
  `chrome --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2
  --window-size=W,H --screenshot=<abs out.png> <abs in.html>`
  Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe`. Absolute paths required
  (shell cwd resets between calls). A small build script (`_illus/render.mjs` or a `.sh`) loops
  over all `_illus/*.html` with their declared sizes so re-rendering is one command.
- Each `_illus/*.html` declares its canvas size in a top comment (`<!-- size:1100x560 -->`)
  so the render loop reads dimensions per file.
- `_illus/` and `shots/` stay git-ignored; only `img/*.png` is published.

## Components

### 1. Style system (shared illustration kit)
A shared CSS snippet (`_illus/_kit.css`, inlined per file to keep files standalone) defining the
tokens already in use: bg `#0b0e15`/`#0d1320`, line `#232b3d`, cy `#22d3ee`, am `#fbbf24`,
gr `#4ade80`, rd `#f87171`; fonts Archivo (900/800), Inter, JetBrains Mono; the rounded-card
frame with radial glow; the bot mascot SVG; a reusable "node + cable" and "labelled chip" motif.
Each illustration is a focused file under 800 lines.

### 2. The 4 Toolbox category posters
Each ~1100×620, same frame: eyebrow + concept line + a schematic showing the tools with **real
per-tool icon SVGs** and a one-line role. Data is the canonical `HUB` list in `build-course.js`.

| File | Concept (metaphor) | Tools shown |
|------|--------------------|-------------|
| `tb-mcp.png` | "Connectors — plugs that wire your agent to the world." Central agent hub, cables to labelled sockets. | GitHub, Context7, Playwright, Notion, Filesystem, Figma, Supabase, Exa, Sequential-Thinking |
| `tb-skills.png` | "Skills — manuals you hand it to work better." Shelf of skill cards/manuals. | Superpowers, frontend-design, Document Skills, web-artifacts-builder, git-commit-writer, code-reviewer, web-design-guidelines, readme-generator |
| `tb-tools.png` | "Tools — the workbench instruments around the agent." Workbench with instruments. | ccusage, ccstatusline, Happy Coder, PM2, Claude Squad, tmux, Git worktrees, Claude Flow |
| `tb-repos.png` | "Repos — chests to grab everything else from." GitHub chests/vaults. | awesome-claude-code, awesome-claude-code-toolkit, Anthropic Skills, awesome-claude-skills, MCP servers, awesome-cli-coding-agents |

Starter vs power level shown via cy (starter) / am (power) accenting, matching the course.

### 3. Landing illustrations (wired into sections)
| File | Section | Purpose |
|------|---------|---------|
| `interface-gui-vs-cli.png` | "Terminal vs App" | The video's core schematic: click-apps vs text-apps, "closer to the machine". Replaces bullet text. |
| `three-ways.png` | near hero / vs | 3 ways to run Claude Code, terminal highlighted. |
| `command-deck.png` | curriculum / vault teaser | Slash-command deck preview (teaser of course). |
| `toolbox-strip.png` | new mini-section before pricing | 4-poster preview → "what's in the Vault". |
| refresh `c-workbench`, `a-brain-hands`, `install-steps` | manifesto / roadmap / setup | Re-wire the orphaned illustrations (currently in `img/` but unreferenced) and refresh to the pushed style. |

### 4. Course pedagogy (the priority)
Beyond wiring the 4 posters into the Power Vault lessons:
| File | Lesson target | Teaches |
|------|---------------|---------|
| `anatomy-reply.png` | M3 "Reading Its Replies" | Annotated real Claude Code reply: permission prompt, tool call, file path, `localhost`, diff. |
| `dev-basics.png` | M2 "What Claude Code Is" / Survival Card | Visual glossary: CLI vs GUI, folder/path, localhost, repo/git, package/install. |
| `claude-md.png` | M3 "Give It a Memory" | The CLAUDE.md memory model, visualized. |
| `three-ways.png` (reuse) | M2 "What Claude Code Is" | Same asset reused. |

Plus a **pedagogical pass** of Modules 2–4 lesson markdown/build: insert each visual at the
right spot, tighten explanations so the "why" precedes every "do this". No copy invented as
fact (keep the honest framing already in place).

### 5. Build & publish
- `build-course.js`: extend `HUB` rendering so each category section shows its poster above its
  cards; reference posters + pedagogy images by github.io URL; regenerate `course/index.html`.
- Landing: edit `index.html` to add `<img>` tags + the new toolbox strip section; minor `styles.css`
  additions for figure framing/captions.
- Re-render all `_illus` → `img/`; security re-scan (`grep` for keys/paths/real name) on every
  published file; commit + push both repos.

## Data flow

`HUB` array (single source of truth in `build-course.js`) → poster `_illus` HTML reads the same
names/desc/levels → rendered PNG → referenced by both course and landing. Changing a tool means
editing `HUB` and re-rendering its poster.

## Error handling / risks

- **Font flash in headless**: add a short `--virtual-time-budget` or a `<link>`-loaded check; if a
  poster renders before fonts load, bump budget and re-render. Validated render already shows fonts load.
- **Icon fidelity**: per-tool icons are hand-built simplified SVGs (no external logo fetch → no
  trademark/asset risk, no network dependency at render). Recognizable, not pixel-accurate logos.
- **Oversized files**: each `_illus` file focused; posters split helper SVGs into a `<defs>` block.
- **Course/landing drift**: posters live in `img/` only once; both surfaces reference the same URL.
- **Secret leak**: mandatory re-scan gate before any push (already part of the project's discipline).

## Testing / verification

- Render every `_illus` file; visually inspect each PNG (Read tool) for layout, font, contrast.
- Open landing `index.html` and `course/index.html` locally (Chrome) and screenshot key sections
  to confirm images load and sit correctly at desktop + mobile widths.
- Security: grep all published files for secrets/paths/real name → must be clean.
- Accessibility: every `<img>` has descriptive `alt`.

## Out of scope (YAGNI)

- No new art direction, no animation work beyond the existing hero terminal.
- No Gumroad settings, no TikTok upload (separate launch checklist).
- No license-key / member-auth system.
- No rewrite of lessons that already test well; only the pedagogy pass on M2–M4 visuals + framing.
