# Blank Next.js App

This is a blank Next.js application with minimal setup.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- Minimal dependencies

## Project Structure

- `/src/app` - Application pages and layouts
- `/src/components` - React components
- `/src/lib` - Utility functions
- `/public` - Static assets

## Development Workflow

### Git Hooks

This project uses Husky and lint-staged to enforce code quality checks before commits and pushes. To set up or repair the git hooks, run:

```bash
npm run setup-hooks
```

To validate that the hooks are correctly installed, run:

```bash
npm run validate-hooks
```

### Pre-commit Hook

The pre-commit hook runs the following checks:

- Linting (ESLint) on staged files
- Prettier formatting on staged files
- Type checking (TypeScript)
- Unit and integration tests

### Pre-push Hook

The pre-push hook runs:

- End-to-end tests with Playwright

### Post-merge Hook

The post-merge hook automatically:

- Installs dependencies when package.json changes after pulling

### Commit Message Hook

The commit-msg hook enforces:

- Conventional commit message format (e.g., `feat(auth): add login functionality`)
- Types: build, chore, ci, docs, feat, fix, perf, refactor, revert, style, test

### Skipping Hooks

In emergency situations, you can skip git hooks by setting the `SKIP_HOOKS` environment variable:

```bash
# Skip hooks for a single commit
SKIP_HOOKS=1 git commit -m "Emergency fix"

# Skip hooks for a single push
SKIP_HOOKS=1 git push
```

### Commit Tools

This project provides several tools to help create proper commit messages:

1. **Interactive Commitizen** - Run this for a guided commit process:

   ```bash
   npm run commit
   ```

2. **Commit Helper Script** - A shorthand for creating conventional commits:

   ```bash
   # Format: ./commit.sh <type> [scope] <message>
   ./commit.sh feat "add login functionality"
   ./commit.sh fix api "handle null response"
   ```

3. **Automatic Commit Helper** - Simply run `git commit` without a message to trigger the interactive commitizen tool.

### VS Code Integration

VS Code tasks are provided for easy access to quality checks:

1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux) and type "Run Task"
2. Select one of the following tasks:
   - **Run All Quality Checks** - Runs all checks in sequence
   - **Lint** - Runs ESLint
   - **Type Check** - Runs TypeScript type checker
   - **Run Tests** - Runs Jest tests
   - **Run E2E Tests** - Runs Playwright E2E tests
   - **Commit (Interactive)** - Launches interactive commit tool
   - **Validate Git Hooks** - Checks that all hooks are properly configured
   - **Run CI Pipeline Locally** - Simulates the CI pipeline locally

### Running CI Checks Locally

To simulate the entire CI pipeline locally before pushing your changes, run:

```bash
npm run ci-local
```

This will run all the checks in the same order as the CI pipeline, helping you catch issues before pushing your code.

#### Advanced CI Simulation Scripts

For more granular control over CI testing, you can use these additional scripts (they're added to `.gitignore` and are meant for local development only):

```bash
# Run only unit tests in CI mode
npm run test:ci

# Run tests with GitHub Actions environment variables set
npm run test:github-actions

# Run only StoryEditor component tests in CI mode
npm run test:story-editor
```

For more details about these scripts and how they simulate CI environments, see the documentation in `docs/ci-simulation.md`.

These hooks and tools ensure that code quality is maintained and prevent pushing code that doesn't pass the CI pipeline checks.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
