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

Second reference, short jn-uAU7KOpI: a rapid `/command → payoff` reel (`/brainstorm`,
`/writing-plans`, `/frontend-design`, `/execute`, `/skillator`, `/firecrawl`, …) selling a
ready-to-use arsenal. Drives the new landing "Your arsenal" section (3b) and `command-deck.png`.

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
| `command-deck.png` | new "Your arsenal" section | Slash-command reel: `/command → what it does` pairs, in the spirit of short jn-uAU7KOpI. |
| `toolbox-strip.png` | "Your arsenal" section | 4-poster preview (MCP/Skills/Tools/Repos) → "what's in the Vault". |
| refresh `c-workbench`, `a-brain-hands`, `install-steps` | manifesto / roadmap / setup | Re-wire the orphaned illustrations (currently in `img/` but unreferenced) and refresh to the pushed style. |

### 3b. The "Your arsenal" landing section (new — explicit selling point)
A dedicated section that **sells what the kit hands you**: a curated arsenal, framed honestly.
Required so the landing makes the Vault's value unmistakable (creator request, ref short jn-uAU7KOpI).
- **Headline angle:** "You don't just learn it. You get the whole kit handed to you." — the best
  **MCP connectors, skills, tools, GitHub repos, and — above all — the Claude Code commands** that
  run it day to day.
- **Command reel (centerpiece):** `command-deck.png` styled like the short — a stack of
  `/brainstorm → refine any idea`, `/writing-plans → a real plan first`, `/frontend-design →
  no generic-AI look`, `/execute → it does the task`, `/firecrawl → live web data`, etc. Pulls
  real commands/skills the course actually teaches or links.
- **Arsenal grid:** five labelled lanes — **Commands · MCP · Skills · Tools · Repos** — each with
  its icon and a 1-line payoff, previewing `toolbox-strip.png`.
- **Honesty guardrail:** we **hand-pick and point you to** the best of each, **teach the commands**,
  and ship **copy-paste briefings** so you wield them in seconds. No false "one-command installs
  20 agents" claim; the value is curation + teaching + briefings, stated plainly. Keep the page's
  existing honest tone (refund chip, real cost box).

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

### 6. Course content — "The 6 Power Phrases" (new lesson)
A new Power Vault lesson consolidating the high-leverage phrases beginners should type, in plain
English with copy-paste lines. Four of six already map to existing kit concepts — cross-link, don't
duplicate.
1. **"Launch sub-agents"** — run work in parallel / get independent perspectives. Phrase: "Launch [X] sub-agents to handle this." (ties to `/agents`, Claude Flow).
2. **"Write me an implementation spec"** — force a plan before code; make it list the key decisions so you can override them first. Phrase: "Write me an implementation spec to build X, and outline the key decisions at each step so I can override them." (ties to M5 Plan-Review-Execute).
3. **"Interview me"** — when you can't write the spec yourself, let it ask you. Phrase: "Work with me to identify the core problem, who it's for and not for, and the key decisions; then summarize it back as an implementation spec."
4. **"Verify before you build"** — no task is done without a feedback loop. 3 layers: CLAUDE.md forces a verify plan; enable verify tools (browser MCP / validators); mark Human Validation Zones (payments, anything risky). (ties to CLAUDE.md lesson + honesty).
5. **"Based on this conversation, build me a skill"** — build skills from workflows you just did, add a "gotchas" section so quality compounds. (ties to `/skillator`, Skills poster).
6. **"Automate this" — the cautionary one** — automation = operational debt + "AI slop" at scale. Prefer augmentation. Two filters before automating: the **Taste Test** (needs subjective taste → augment, don't automate) and the **80/20 Output** (would 80%-of-a-human be fine? then automate). (reinforces M6 honesty).
Reuse/extend `command-deck.png` to surface these phrases visually.

### 7. Persuasion pass — honest influence (decision: Option 1)
Apply sales psychology **through truth**, never dark patterns. **Central frame:** you gain *an AI
employee / a tool that makes you broadly more productive* — the empowering message leads. "Missing
the AI train" appears only as a light, understandable nudge, never fear-mongering. No fake
countdowns, fake scarcity, or fake reviews (those would betray the page's honesty, which is itself
the strongest trust lever). Mapping to sections:
- **Believe / conviction** → keep the "built by the agent itself" authenticity; tighten verbs to read as genuine conviction.
- **Sell yourself first** → strengthen "Who's behind this": a real beginner who figured it out, answers your emails personally → trust before product.
- **Pain → escape (light)** → the existing "Pain" section, reframed as *cost of staying at half-power / doing by hand what an employee could do*, then the positive payoff. Empowerment, not dread.
- **NO = information** → FAQ already does objection-handling; keep honest, answer the real blockers.
- **Be fearless** → confident, non-apologetic CTA copy.
- **Strategic silence** → CTA gets breathing room (whitespace), price stated plainly without over-justifying.
- **Power-phrases teaser** → a one-line hint in the "Your arsenal" section: "you'll learn the exact phrases pros type." Links the new lesson to the landing.

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
