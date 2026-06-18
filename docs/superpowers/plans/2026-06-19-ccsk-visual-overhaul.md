# CCSK Visual Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace text-heavy sections of the Claude Code Starter Kit landing + course with real illustrations in the existing terminal aesthetic, add an explicit "Your arsenal" selling section (commands/MCP/skills/tools/repos), and lift the course's pedagogical clarity.

**Architecture:** Standalone `_illus/*.html` files (fixed-size, dark theme, inline SVG) are rendered to `img/*.png` via Chrome headless @2x, committed, and published on GitHub Pages. Landing `index.html` references them locally; course `build-course.js` references them by `https://maxime220492.github.io/...` URL. One asset hub, two surfaces.

**Tech Stack:** Static HTML/CSS/SVG, Node 25 (render script), Chrome headless, git (two repos).

## Global Constraints

- Repos: `C:/Users/maxim/claude-code-starter-kit-landing` (public, GH Pages) and `C:/Users/maxim/claude-code-starter-kit-gumroad` (course build). Absolute paths required (shell cwd resets between Bash calls).
- Keep the terminal identity. Tokens (verbatim): bg `#0b0e15`, panel `#0d1320`, line `#232b3d`, cy `#22d3ee`, am `#fbbf24`, gr `#4ade80`, rd `#f87171`, text `#e8eef7`, mut `#9aa6bb`. Fonts: Archivo (900/800), Inter (400/500/600), JetBrains Mono (400/600).
- Each `_illus/*.html` is standalone (inlined CSS + Google Fonts link), declares its canvas as a **first-line comment** `<!-- size:WxH -->`, and stays under 800 lines.
- Tool icons are **hand-built simplified SVGs** — recognizable, NOT pixel-accurate logos. No external logo fetch, no network dependency at render.
- Chrome: `C:/Program Files/Google/Chrome/Application/chrome.exe`. `_illus/` and `shots/` are git-ignored; only `img/*.png` is published.
- **Honesty guardrail:** the arsenal pitch = "we hand-pick the best + teach the commands + ship copy-paste briefings". NO "one command installs 20 agents" claim. Keep refund chip + honest cost box intact.
- **Security gate:** before any push, grep every published file for secrets / personal paths (`C:/Users/maxim`, `maxim`) / real name. Must be clean. The course `index.html` already carries `noindex`; landing is public.
- Tool data source of truth: the `HUB` array in `build-course.js` (31 tools, categories mcp/skills/tools/repos). Copy names/desc/level verbatim into posters.

---

### Task 0: Render pipeline + shared kit

**Files:**
- Create: `claude-code-starter-kit-landing/_illus/render.mjs`
- Create: `claude-code-starter-kit-landing/_illus/_kit.css` (reference snippet, inlined per illustration)

**Interfaces:**
- Produces: `node _illus/render.mjs [name]` — renders all `_illus/*.html` (or one by `name`) to `img/<name>.png` @2x, reading `<!-- size:WxH -->` from each file's first line.

- [ ] **Step 1: Write `_illus/render.mjs`**

```js
// Renders every _illus/*.html to img/<name>.png via Chrome headless @2x.
// Reads canvas size from the file's first-line comment: <!-- size:1100x620 -->
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const outDir = resolve(root, 'img');

const only = process.argv[2];
const files = readdirSync(here).filter(f => f.endsWith('.html') && (!only || f === `${only}.html`));
if (!files.length) { console.error('no matching _illus html'); process.exit(1); }

for (const f of files) {
  const name = basename(f, '.html');
  const html = readFileSync(resolve(here, f), 'utf8');
  const m = html.match(/<!--\s*size:(\d+)x(\d+)\s*-->/i);
  if (!m) { console.error(`SKIP ${f}: missing <!-- size:WxH --> first-line comment`); continue; }
  const [w, h] = [m[1], m[2]];
  const out = resolve(outDir, `${name}.png`);
  execFileSync(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars',
    '--force-device-scale-factor=2', '--virtual-time-budget=1500',
    `--window-size=${w},${h}`, `--screenshot=${out}`, resolve(here, f),
  ], { stdio: 'inherit' });
  console.log(`OK ${name}.png (${w}x${h})`);
}
```

- [ ] **Step 2: Write `_illus/_kit.css`** — the shared token block (copy of the Global Constraints tokens + the `.card` frame with radial-glow + the bot mascot SVG markup as a comment) so every illustration inlines the same look. Keep it a reference; illustrations inline it.

- [ ] **Step 3: Smoke-test the renderer on an existing file**

Run: `cd /c/Users/maxim/claude-code-starter-kit-landing && node _illus/render.mjs c-workbench` (after adding `<!-- size:1100x560 -->` as its first line)
Expected: `OK c-workbench.png (1100x560)`, file mtime updated in `img/`.

- [ ] **Step 4: Visually inspect** `img/c-workbench.png` (Read tool). Expected: fonts loaded, mascots + glow correct.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/maxim/claude-code-starter-kit-landing && git add _illus/render.mjs _illus/_kit.css img/c-workbench.png && git commit -m "build: add _illus render pipeline (chrome headless @2x)"
```

---

### Task 1: Poster `tb-mcp.png` — Connectors

**Files:**
- Create: `_illus/tb-mcp.html` (`<!-- size:1180x680 -->`)
- Output: `img/tb-mcp.png`

**Interfaces:**
- Consumes: render pipeline from Task 0.
- Produces: `img/tb-mcp.png` referenced later by landing arsenal strip + course MCP lesson.

- [ ] **Step 1: Author `_illus/tb-mcp.html`.** Layout:
  - Eyebrow `// CONNECTORS · MCP`, headline "Plugs that wire your agent to the world."
  - Center: the bot mascot as a hub; 9 cyan "cables" radiating to labelled **socket** nodes, each socket = a simplified icon + name + 3-word role. Power-level tools (Figma, Supabase, Exa, Sequential Thinking) accented amber, starters cyan.
  - The 9 (verbatim names/roles condensed from `HUB`): GitHub MCP (read repos, PRs), Context7 (live docs), Playwright (real browser), Notion (notes/pages), Filesystem (safe file edits), Figma (design→code, power), Supabase (db/auth/storage, power), Exa Search (search by meaning, power), Sequential Thinking (step-by-step reason, power).
  - Footer line: "One connection each. You add only the ones your work needs."
- [ ] **Step 2: Render.** Run: `node _illus/render.mjs tb-mcp` → Expected `OK tb-mcp.png (1180x680)`.
- [ ] **Step 3: Visually inspect** `img/tb-mcp.png`. Expected: 9 sockets legible, no overlap, hub centered, amber/cyan levels correct.
- [ ] **Step 4: Commit** `git add _illus/tb-mcp.html img/tb-mcp.png && git commit -m "feat(illus): MCP connectors poster"`

---

### Task 2: Poster `tb-skills.png` — Skills

**Files:** Create `_illus/tb-skills.html` (`<!-- size:1180x680 -->`); Output `img/tb-skills.png`.

- [ ] **Step 1: Author.** Metaphor: a shelf of "manual / skill cards" the agent reads. 8 cards, each = simplified icon + name + 3-word payoff: Superpowers (plan/test/debug), frontend-design (pro-looking pages), Document Skills (Word/PDF/PPT/Excel), web-artifacts-builder (single-file demos), git-commit-writer (tidy commits), code-reviewer (self-review code), web-design-guidelines (clean UI rules), readme-generator (polished README). All starter (cyan) except none power here.
- [ ] **Step 2: Render** `node _illus/render.mjs tb-skills`.
- [ ] **Step 3: Inspect** `img/tb-skills.png` — 8 cards aligned, icons distinct, text legible.
- [ ] **Step 4: Commit** `git add _illus/tb-skills.html img/tb-skills.png && git commit -m "feat(illus): Skills poster"`

---

### Task 3: Poster `tb-tools.png` — Tools

**Files:** Create `_illus/tb-tools.html` (`<!-- size:1180x680 -->`); Output `img/tb-tools.png`.

- [ ] **Step 1: Author.** Metaphor: a workbench with instruments around the agent. 8 tools: ccusage (live usage), ccstatusline (custom status bar), Happy Coder (control from phone), PM2 (keep apps running, power), Claude Squad (parallel agents, power), tmux (split terminal, power), Git worktrees (multi-version work, power), Claude Flow / ruflo (agent swarm + memory, power). Mark power = amber.
- [ ] **Step 2: Render** `node _illus/render.mjs tb-tools`.
- [ ] **Step 3: Inspect** `img/tb-tools.png`.
- [ ] **Step 4: Commit** `git add _illus/tb-tools.html img/tb-tools.png && git commit -m "feat(illus): Tools poster"`

---

### Task 4: Poster `tb-repos.png` — Repos

**Files:** Create `_illus/tb-repos.html` (`<!-- size:1180x680 -->`); Output `img/tb-repos.png`.

- [ ] **Step 1: Author.** Metaphor: GitHub "chests/vaults" to grab from. 6 repos: awesome-claude-code (the curated list), awesome-claude-code-toolkit (agents/skills/plugins bundle), Anthropic Skills (official free skills), awesome-claude-skills (curated community skills), MCP servers (official connectors home), awesome-cli-coding-agents (map of CLI agents, power).
- [ ] **Step 2: Render** `node _illus/render.mjs tb-repos`.
- [ ] **Step 3: Inspect** `img/tb-repos.png`.
- [ ] **Step 4: Commit** `git add _illus/tb-repos.html img/tb-repos.png && git commit -m "feat(illus): Repos poster"`

---

### Task 5: `interface-gui-vs-cli.png` — the core mental model

**Files:** Create `_illus/interface-gui-vs-cli.html` (`<!-- size:1180x620 -->`); Output `img/interface-gui-vs-cli.png`.

- [ ] **Step 1: Author.** Two columns. LEFT "Graphical interface — you click": icons of Notion/VLC/Safari-style click-apps, cursor, "buttons & menus · easy · limited". RIGHT "Text interface (CLI) — you direct": a terminal with `claude` typed, icons for Claude Code & other CLIs, "closer to the machine · far more power". A center arrow/depth gradient implying "closer to the machine = more power". Caption from the video idea: "The terminal is just another interface. Same computer, more reach."
- [ ] **Step 2: Render** `node _illus/render.mjs interface-gui-vs-cli`.
- [ ] **Step 3: Inspect** `img/interface-gui-vs-cli.png`.
- [ ] **Step 4: Commit** `git add _illus/interface-gui-vs-cli.html img/interface-gui-vs-cli.png && git commit -m "feat(illus): GUI vs CLI interface model"`

---

### Task 6: `three-ways.png` — 3 ways to run Claude Code

**Files:** Create `_illus/three-ways.html` (`<!-- size:1180x560 -->`); Output `img/three-ways.png`.

- [ ] **Step 1: Author.** Three cards: (1) **Terminal** — highlighted cyan, "every command, every update, full control · this kit". (2) **Desktop app** — dim, "limited: no /agents, no resume, capped customisation". (3) **cloud.ai web** — dim, "only with an external repo · niche". Badge "← what you'll use" on terminal.
- [ ] **Step 2: Render** `node _illus/render.mjs three-ways`.
- [ ] **Step 3: Inspect** `img/three-ways.png`.
- [ ] **Step 4: Commit** `git add _illus/three-ways.html img/three-ways.png && git commit -m "feat(illus): three ways to run Claude Code"`

---

### Task 7: `command-deck.png` — the command reel (arsenal centerpiece)

**Files:** Create `_illus/command-deck.html` (`<!-- size:1180x720 -->`); Output `img/command-deck.png`.

- [ ] **Step 1: Author.** In the spirit of short jn-uAU7KOpI: a vertical stack of `/command → plain-language payoff` rows, mono command in cyan, payoff in text. Rows (use commands the course teaches/links — keep honest): `/rewind → undo back to any earlier point`, `/compact → free up the agent's memory mid-task`, `/context → see how full its memory is`, `/agents → call in specialists`, `/model → pick the brain for the job`, `/plan → it drafts before it acts`, `/brainstorm → refine a fuzzy idea`, `/frontend-design → no generic-AI look`. Header "The daily keys — type one, it acts." Footer "Taught in plain English in the kit, with copy-paste briefings."
- [ ] **Step 2: Render** `node _illus/render.mjs command-deck`.
- [ ] **Step 3: Inspect** `img/command-deck.png` — rows aligned, mono legible, fits height.
- [ ] **Step 4: Commit** `git add _illus/command-deck.html img/command-deck.png && git commit -m "feat(illus): command deck reel"`

---

### Task 8: `toolbox-strip.png` — 4-poster + commands preview

**Files:** Create `_illus/toolbox-strip.html` (`<!-- size:1180x420 -->`); Output `img/toolbox-strip.png`.

- [ ] **Step 1: Author.** Five labelled lanes in a row: **Commands · MCP · Skills · Tools · Repos**, each with its icon + count + 1-line payoff (Commands "the daily keys", MCP "9 connectors", Skills "8 skills", Tools "8 tools", Repos "6 repos to mine"). Title "Your arsenal, curated and explained." This is the compact teaser of the four posters.
- [ ] **Step 2: Render** `node _illus/render.mjs toolbox-strip`.
- [ ] **Step 3: Inspect** `img/toolbox-strip.png`.
- [ ] **Step 4: Commit** `git add _illus/toolbox-strip.html img/toolbox-strip.png && git commit -m "feat(illus): arsenal toolbox strip"`

---

### Task 9: `anatomy-reply.png` — decode an agent reply (course pedagogy)

**Files:** Create `_illus/anatomy-reply.html` (`<!-- size:1180x760 -->`); Output `img/anatomy-reply.png`.

- [ ] **Step 1: Author.** A realistic (fabricated, generic) Claude Code reply block with **callout annotations** pointing to: the permission prompt ("it asks before acting"), a tool call line ("it's using a tool, not guessing"), a file path like `~/ai-projects/site/index.html` ("where the file lives on your PC"), `localhost:3000` ("a preview on YOUR machine, not the internet"), a diff `+ added / - removed` ("what it changed, in green/red"). No real paths/secrets — use `you@your-pc ~/ai-projects`.
- [ ] **Step 2: Render** `node _illus/render.mjs anatomy-reply`.
- [ ] **Step 3: Inspect** `img/anatomy-reply.png` — annotations point clearly, no real personal data.
- [ ] **Step 4: Commit** `git add _illus/anatomy-reply.html img/anatomy-reply.png && git commit -m "feat(illus): anatomy of an agent reply"`

---

### Task 10: `dev-basics.png` — visual glossary (course pedagogy)

**Files:** Create `_illus/dev-basics.html` (`<!-- size:1180x680 -->`); Output `img/dev-basics.png`.

- [ ] **Step 1: Author.** Five mini-cards, each term + icon + one-sentence plain definition: **CLI vs GUI** (text you type vs buttons you click), **Folder / path** (the address of a file), **localhost** (a site running only on your PC), **repo / git** (a project's save history), **package / install** (a ready-made part the agent adds itself). Header "The five words that unlock everything."
- [ ] **Step 2: Render** `node _illus/render.mjs dev-basics`.
- [ ] **Step 3: Inspect** `img/dev-basics.png`.
- [ ] **Step 4: Commit** `git add _illus/dev-basics.html img/dev-basics.png && git commit -m "feat(illus): dev basics glossary"`

---

### Task 11: `claude-md.png` — the memory model (course pedagogy)

**Files:** Create `_illus/claude-md.html` (`<!-- size:1180x600 -->`); Output `img/claude-md.png`.

- [ ] **Step 1: Author.** A `CLAUDE.md` file card feeding into the bot's "memory", showing 3 sample lines ("Always answer in plain English", "My projects live in ~/ai-projects", "Ask before deleting anything"). Caption "Write it once. It remembers across every session."
- [ ] **Step 2: Render** `node _illus/render.mjs claude-md`.
- [ ] **Step 3: Inspect** `img/claude-md.png`.
- [ ] **Step 4: Commit** `git add _illus/claude-md.html img/claude-md.png && git commit -m "feat(illus): CLAUDE.md memory model"`

---

### Task 12: Refresh orphaned illustrations + add size comments

**Files:** Modify `_illus/c-workbench.html`, `_illus/a-brain-hands.html`, `_illus/b-browser-vs-terminal.html`, `_illus/install-steps.html` (add `<!-- size:WxH -->` first line; light polish to match pushed style). Outputs: re-render to `img/`.

- [ ] **Step 1:** Read each, add the size comment (workbench 1100x560; brain-hands, browser-vs-terminal, install-steps — read their `body{width/height}` to get exact size). Light polish only (glow/spacing), no metaphor change.
- [ ] **Step 2: Render all** `node _illus/render.mjs` (no arg = all).
- [ ] **Step 3: Inspect** the 4 refreshed PNGs.
- [ ] **Step 4: Commit** `git add _illus/*.html img/*.png && git commit -m "chore(illus): size comments + polish on existing illustrations"`

---

### Task 13: Wire landing — Terminal-vs-App + 3-ways

**Files:** Modify `claude-code-starter-kit-landing/index.html` (vs-section ~L56-81), `styles.css` (figure/caption styles).

- [ ] **Step 1:** In `styles.css`, add reusable figure styling:

```css
.illus{display:block;width:100%;height:auto;margin:26px auto;border:1px solid var(--line,#232b3d);border-radius:16px;box-shadow:0 24px 60px -30px rgba(0,0,0,.85)}
.illus-cap{text-align:center;color:#9aa6bb;font-size:14px;margin:-10px 0 8px}
figure.illus-fig{margin:0}
```

- [ ] **Step 2:** In `index.html`, inside `.vs-section`, after the `.vs-grid` div, insert:

```html
<figure class="illus-fig"><img class="illus" src="img/interface-gui-vs-cli.png" alt="Graphical interface (click apps like Notion, VLC, Safari) versus the text interface / CLI where you direct Claude Code, closer to the machine and far more powerful." loading="lazy"></figure>
```

- [ ] **Step 3:** After the vs-section `.caption`, insert a 3-ways figure:

```html
<figure class="illus-fig"><img class="illus" src="img/three-ways.png" alt="Three ways to run Claude Code: the terminal (full control, used in this kit), the desktop app (limited), and the cloud web version (niche)." loading="lazy"></figure>
```

- [ ] **Step 4: Verify** — open `index.html` in Chrome, screenshot the vs-section, confirm both images load + sit well at 1440 and 375 widths.
- [ ] **Step 5: Commit** `git add index.html styles.css && git commit -m "feat(landing): illustrate Terminal-vs-App with GUI/CLI + 3-ways"`

---

### Task 14: Wire landing — the "Your arsenal" section (spec §3b)

**Files:** Modify `index.html` (insert a new `<section>` after the CURRICULUM section, before "WHAT YOU GET"), `styles.css` (arsenal styles).

**Interfaces:** Consumes `img/command-deck.png`, `img/toolbox-strip.png`.

- [ ] **Step 1:** Add `styles.css` block for the arsenal lane chips (reuse existing tokens; minimal new CSS — the heavy lifting is in the two images).
- [ ] **Step 2:** Insert the section in `index.html`:

```html
<!-- ════════ YOUR ARSENAL ════════ -->
<section class="wrap arsenal">
  <p class="eyebrow center reveal"><span class="cy">//</span> WHAT YOU'RE HANDED</p>
  <h2 class="center reveal">You don't just learn it. <span class="cy">You get the whole kit.</span></h2>
  <p class="sub center reveal">The hard part isn't the agent, it's knowing which commands, connectors and skills are worth your time. This kit hands you the curated shortlist, explains each one in plain English, and gives you copy-paste briefings so you wield them in seconds.</p>
  <figure class="illus-fig reveal d1"><img class="illus" src="img/command-deck.png" alt="A deck of the daily Claude Code commands: /rewind, /compact, /context, /agents, /model, /plan, /brainstorm, /frontend-design, each with what it does in plain English." loading="lazy"></figure>
  <p class="caption center reveal">The daily keys pros actually use, decoded, with a briefing for each.</p>
  <figure class="illus-fig reveal d1"><img class="illus" src="img/toolbox-strip.png" alt="Your curated arsenal: the daily commands, 9 MCP connectors, 8 skills, 8 tools, and 6 GitHub repos to mine, each explained." loading="lazy"></figure>
  <p class="caption center reveal">Plus the best MCP connectors, skills, tools and GitHub repos, hand-picked and explained, in the Power Vault, which keeps growing, free, forever.</p>
</section>
```

- [ ] **Step 3: Verify** — screenshot the new section in Chrome at 1440 + 375. Confirm honest framing (no "installs 20 agents" claim), images load.
- [ ] **Step 4: Commit** `git add index.html styles.css && git commit -m "feat(landing): add 'Your arsenal' section (commands + curated kit)"`

---

### Task 15: Wire landing — re-home the orphaned illustrations

**Files:** Modify `index.html` (manifesto, roadmap/timeline, after-pay/setup spots).

- [ ] **Step 1:** In the MANIFESTO section, after its closing paragraph, add `a-brain-hands.png` (figure + alt "You describe the goal in plain words; the agent does the technical work with its hands.").
- [ ] **Step 2:** In the TIMELINE/roadmap section, add `install-steps.png` (figure + alt describing the install carousel) under the timeline.
- [ ] **Step 3:** In the MANIFESTO or "is/is not" area, add `c-workbench.png` (figure + alt "Your agent works in whatever folder you launch it from; it asks permission before reaching elsewhere.").
- [ ] **Step 4: Verify** — full-page screenshot in Chrome; confirm no broken images, balanced rhythm (not image-stacked).
- [ ] **Step 5: Commit** `git add index.html && git commit -m "feat(landing): re-home workbench/brain-hands/install illustrations"`

---

### Task 16: Wire course — category posters in the Toolbox hub

**Files:** Modify `claude-code-starter-kit-gumroad/build-course.js` (toolbox hub view ~L332-399), regenerate `course/index.html`.

**Interfaces:** Consumes posters via `https://maxime220492.github.io/claude-code-starter-kit/img/tb-<cat>.png`. (Confirm the exact GH Pages base path by checking how existing lesson images are referenced in `build-course.js`.)

- [ ] **Step 1:** Read `build-course.js` L277-399 to learn the hub render (`renderHub`/filters) and the exact github.io base used by existing images.
- [ ] **Step 2:** In the hub view, when a category filter is active (or as section headers in the "all" view), render the matching poster above its cards:

```js
const POSTER = {mcp:'tb-mcp', skills:'tb-skills', tools:'tb-tools', repos:'tb-repos'};
// inside the hub render, per category group:
const base = 'https://maxime220492.github.io/claude-code-starter-kit/img';
const posterHtml = POSTER[cat] ? `<img class="hub-poster" src="${base}/${POSTER[cat]}.png" alt="${cat} category overview" loading="lazy">` : '';
```

Add `.hub-poster{display:block;width:100%;height:auto;margin:6px 0 22px;border:1px solid var(--line);border-radius:14px}` to the course `<style>`.

- [ ] **Step 3:** Regenerate: `cd /c/Users/maxim/claude-code-starter-kit-gumroad && node build-course.js`. Expected: `course/index.html` rewritten.
- [ ] **Step 4: Verify** — open `course/index.html`, navigate to The Toolbox, switch category filters, confirm each poster shows above its cards (images 404 until landing repo is pushed — note that; verify markup + local fallback by temporarily pointing one to the local `../claude-code-starter-kit-landing/img/`).
- [ ] **Step 5: NO git here.** The course dir is NOT a git repo and deploys manually to Netlify. Deliverable = regenerated `course/index.html` + edited `build-course.js` saved on disk. Deployment happens in Task 18 (manual Netlify upload). Do not `git init` or commit this repo.

---

### Task 17: Wire course — pedagogy images into Modules 2–4 + Power Vault

**Files:** Modify the lesson sources `build-course.js` reads (determine in Step 1 whether it embeds `course-export/*.md` or inline strings), regenerate `course/index.html`.

- [ ] **Step 1:** Read `build-course.js` to find how lesson bodies are loaded (inline vs `course-export/*.md`). Identify insertion points:
  - M2 "What Claude Code Is" → `three-ways.png` + `dev-basics.png`
  - M2 Survival Card / install → `dev-basics.png` (if not already placed)
  - M3 "Reading Its Replies" → `anatomy-reply.png`
  - M3 "Give It a Memory" → `claude-md.png`
- [ ] **Step 2:** Insert image references at those points (markdown `![alt](https://maxime220492.github.io/.../img/<name>.png)` or the build's image syntax), each with descriptive alt. Tighten the surrounding sentence so the "why" precedes the visual (pedagogy pass — light copy edits only, no invented facts).
- [ ] **Step 3:** Regenerate `node build-course.js`.
- [ ] **Step 4: Verify** — open `course/index.html`, visit each edited lesson, confirm image placement + that explanation reads "why before do".
- [ ] **Step 5: NO git here.** Same as Task 16: course dir is not git-tracked. Deliverable = saved `build-course.js` + regenerated `course/index.html`. Manual Netlify deploy in Task 18.

---

### Task 18: Security re-scan + cross-surface verification

**Files:** none (verification + the two pushes).

- [ ] **Step 1: Security scan** both published artifacts:

Run (landing): `cd /c/Users/maxim/claude-code-starter-kit-landing && grep -rinE "maxim|C:\\\\?/?Users|sk-|ghp_|supabase.*key|password|secret" index.html styles.css app.js img/ 2>/dev/null | grep -v "maxime210995@gmail.com\|maxime220492" || echo CLEAN`
Run (course): `cd /c/Users/maxim/claude-code-starter-kit-gumroad && grep -rinE "maxim|C:\\\\?/?Users|sk-|ghp_|password|secret" course/index.html build-course.js | grep -v "maxime220492\|maxime210995@gmail.com" || echo CLEAN`
Expected: `CLEAN` (allow only the intentional public email + the github.io username). Investigate any other hit before pushing.

- [ ] **Step 2: Render sanity** — `node _illus/render.mjs` (all) once more; spot-check 3 PNGs (Read tool) for regressions.
- [ ] **Step 3: Landing full-page verify** — open `index.html` in Chrome at 1440 + 375; screenshot top-to-bottom; confirm every `<img>` loads, alt present, no layout breakage, honest tone intact.
- [ ] **Step 4: Push landing** `cd /c/Users/maxim/claude-code-starter-kit-landing && git push` → wait, then hard-refresh `https://maxime220492.github.io/claude-code-starter-kit/` and confirm new images live.
- [ ] **Step 5: Course verify after landing is live** — reopen `course/index.html`; confirm posters + pedagogy images now resolve from github.io. The course is NOT auto-deployed: hand Maxime the regenerated `course/index.html` (and `course/` folder) for **manual Netlify upload** (drag-and-drop to the existing members site `claudecodekit-ccsk-members-…netlify.app`). Give exact upload instructions.
- [ ] **Step 6: Final commit (landing only, if any verify fixes)** and report: list every new/changed asset, the live landing URL, and the manual step left for the course.

---

## Self-Review

**Spec coverage:**
- §1 style system → Task 0 (`_kit.css`) + tokens in Global Constraints. ✓
- §2 four posters → Tasks 1–4. ✓
- §3 landing illustrations (gui/cli, three-ways, command-deck, toolbox-strip, refresh orphans) → Tasks 5,6,7,8,12,13,15. ✓
- §3b "Your arsenal" section → Task 14. ✓
- §4 course pedagogy (anatomy-reply, dev-basics, claude-md, posters in vault, M2–4 pass) → Tasks 9,10,11,16,17. ✓
- §5 build & publish (build-course.js, landing wiring, re-render, scan, push) → Tasks 16,17,18. ✓
- Reference mental models (gui/cli, 3-ways, command reel) → Tasks 5,6,7. ✓
- Honesty guardrail → enforced in Task 14 Step 3 + Task 18 Step 3. ✓
- Security gate → Task 18 Step 1. ✓

**Placeholder scan:** Each illustration task specifies exact content (names, labels, metaphor, size, level colors) and a render+inspect verification; wiring tasks include real HTML/CSS/JS snippets and exact insertion anchors. Two deliberate discovery steps (Task 16 Step 1, Task 17 Step 1) read `build-course.js` to confirm the GH-Pages base path and lesson-loading mechanism before editing — folded into their tasks, not deferred work.

**Type/name consistency:** Poster filenames `tb-mcp/tb-skills/tb-tools/tb-repos.png` consistent across Tasks 1–4, 16, 8. `three-ways.png` authored in Task 6, reused in Tasks 13 + 17. `command-deck.png`/`toolbox-strip.png` authored Tasks 7–8, consumed Task 14. Render command `node _illus/render.mjs [name]` consistent throughout. Size-comment convention `<!-- size:WxH -->` defined Task 0, used by every illustration task.
