# Contributing to Astrion

Thank you for your interest in contributing to Astrion — the hybrid lending protocol for Stellar. This guide will help you get set up and make your first contribution.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Naming](#branch-naming)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)
- [Project Structure](#project-structure)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. By participating, you agree to:

- Be respectful and constructive in all interactions
- Focus on the work, not the person
- Accept feedback gracefully
- Prioritize the health of the community

---

## Getting Started

### Prerequisites

| Tool | Version | Install |
|---|---|---|
| [Bun](https://bun.sh) | ≥ 1.3 | `curl -fsSL https://bun.sh/install \| bash` |
| [Node.js](https://nodejs.org) | ≥ 20 | `nvm install 20` or download from nodejs.org |
| [Git](https://git-scm.com) | latest | Platform-specific |

### Fork and clone

```bash
# Fork via GitHub UI, then:
git clone https://github.com/<your-username>/interface.git
cd interface
```

### Install dependencies

```bash
bun install
```

### Start the dev server

```bash
bun dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

### Verify your setup

```bash
bun lint        # ESLint
bun typecheck   # TypeScript
bun build       # Production build
```

All three should pass before you submit any changes.

---

## Development Workflow

```
main ← PR ← your-branch
```

1. **Sync** — pull the latest `main`
2. **Branch** — create a feature/fix branch off `main`
3. **Code** — make your changes
4. **Check** — run lint + typecheck
5. **Commit** — write a conventional commit message
6. **Push** — push your branch
7. **PR** — open a pull request against `main`

---

## Branch Naming

Use the following prefixes:

| Prefix | Use case | Example |
|---|---|---|
| `feat/` | New features | `feat/supply-modal` |
| `fix/` | Bug fixes | `fix/health-factor-color` |
| `chore/` | Tooling, deps, config | `chore/upgrade-tanstack` |
| `docs/` | Documentation only | `docs/api-integration-guide` |
| `refactor/` | Code restructuring | `refactor/market-data-layer` |
| `style/` | UI/CSS changes only | `style/sidebar-spacing` |
| `test/` | Adding or fixing tests | `test/lending-pool-hooks` |

```bash
git checkout -b feat/supply-modal
```

---

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/). Every commit message must be structured as:

```
<type>: <short description>
```

### Types

| Type | Description |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Formatting, missing semicolons, etc. (no logic change) |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `perf` | Performance improvement |
| `test` | Adding or correcting tests |
| `chore` | Build process, dependency updates, tooling |
| `ci` | CI/CD configuration changes |
| `revert` | Reverts a previous commit |

### Examples

```
feat: add supply/withdraw modal for core markets
fix: correct health factor color thresholds below 1.2
chore: upgrade shadcn button component to v2
docs: add oracle integration notes to architecture section
refactor: extract market card into reusable component
```

### Rules

- Use lowercase for the type and description
- Keep the subject line under 72 characters
- Use imperative mood ("add" not "added" or "adds")
- Do not end the subject line with a period
- Separate subject from body with a blank line (if body is needed)

---

## Pull Request Process

### Before opening a PR

- [ ] Your branch is up to date with `main`
- [ ] `bun lint` passes with no errors
- [ ] `bun typecheck` passes with no errors
- [ ] `bun build` completes successfully
- [ ] You've tested your changes locally in the browser

### PR template

When opening a PR, include:

```markdown
## What

Brief description of what changed and why.

## Screenshots

Include screenshots for any UI changes (before/after if applicable).

## Checklist

- [ ] Lint passes
- [ ] Typecheck passes
- [ ] Build succeeds
- [ ] Tested in browser (dark + light mode)
- [ ] Mobile responsive (if UI change)
```

### Review process

1. At least one maintainer review is required
2. All CI checks must pass
3. Resolve all review comments before merging
4. Squash and merge is preferred for clean history

---

## Code Style

### General rules

| Rule | Detail |
|---|---|
| **Formatter** | Prettier — run `bun format` |
| **Linter** | ESLint — run `bun lint` |
| **Imports** | Use workspace imports (`@workspace/ui/...`) over relative paths when crossing package boundaries |
| **Comments** | Only for non-obvious intent — the code should be self-documenting |
| **Types** | Prefer explicit types over `any`. Use TypeScript's type system fully. |

### React conventions

- Use functional components exclusively
- Use named exports (no default exports)
- Co-locate component files with their feature
- Keep components focused — one responsibility per component
- Extract hooks into `hooks/` directories within feature folders

### File naming

| Type | Convention | Example |
|---|---|---|
| Components | `kebab-case.tsx` | `supply-modal.tsx` |
| Hooks | `use-*.ts` | `use-market-data.ts` |
| Types | `*.ts` in `types/` | `market.ts` |
| Utilities | `kebab-case.ts` | `format-currency.ts` |
| Data/mock | descriptive `.ts` | `mock-markets.ts` |

### CSS / Styling

- Use Tailwind CSS v4 utility classes
- Use the design tokens defined in the global CSS
- Avoid inline styles
- Use `cn()` utility from `@workspace/ui/lib/utils` for conditional classes

---

## Project Structure

Understanding where things live:

```
apps/web/src/
├── features/           # Feature-based modules
│   ├── lending/        # Core lending protocol
│   │   ├── components/ # UI components for this feature
│   │   ├── data/       # Data fetching / mock layer
│   │   └── types/      # TypeScript types
│   ├── earn/           # Staking, vesting, rewards
│   ├── trade/          # Trading interface
│   └── referrals/      # Referral program
│
├── routes/             # TanStack Router file-based routes
├── styles/             # Global CSS and design tokens
└── ui/                 # Shared UI components
    ├── Navbar.tsx       # App + landing navbar
    ├── theme-provider.tsx
    ├── theme-toggle.tsx
    └── landing/         # Landing page sections
```

### Where to put new code

| What you're building | Where it goes |
|---|---|
| New lending feature | `features/lending/components/` |
| New page | `routes/` (file-based routing) |
| Reusable UI component | `packages/ui/` or `ui/` |
| New data hook | `features/<feature>/hooks/` |
| Shared types | `features/<feature>/types/` |
| Global styles | `styles/` |

---

## Reporting Issues

### Bug reports

Open an issue with:

- **Title**: Clear, concise summary
- **Environment**: Browser, OS, screen size
- **Steps to reproduce**: Numbered list
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots**: If applicable

### Feature requests

Open an issue with:

- **Title**: `[Feature] Brief description`
- **Problem**: What problem does this solve?
- **Proposed solution**: How would you approach it?
- **Alternatives considered**: What else did you think about?

---

## Questions?

- Open a [GitHub Discussion](https://github.com/Astrion-Market/interface/discussions)
- Reach out on [Twitter](https://twitter.com/astrionmarket)
- Join our [Discord](https://discord.gg/astrionmarket)

---

<p align="center">
  Thank you for helping build the credit layer for Stellar. 💙
</p>
