# Next.js App with Flexible Deployment Options

This is a Next.js application with a comprehensive testing, building, and deployment structure.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Next.js 15 with App Router
- React 18
- TypeScript
- Tailwind CSS
- Comprehensive test suite (Jest, Playwright)
- Multiple deployment options (Firebase, AWS S3, Vercel)
- GitHub Actions workflows for CI/CD

## Testing

This project includes a comprehensive testing setup:

```bash
# Run unit and integration tests with Jest
npm test

# Run tests in watch mode
npm run test:watch

# Run end-to-end tests with Playwright
npm run test:e2e

# Run all tests (linting, type checking, unit, and e2e tests)
npm run test:all
```

## Building

The project has different build scripts for different purposes:

```bash
# Standard production build
npm run build:prod

# Build with bundle analysis
npm run build:analyze
```

## Deployment Options

This project supports multiple deployment targets:

### Firebase Hosting

```bash
# Deploy to Firebase (requires prior build)
npm run deploy:firebase

# Build and deploy to Firebase in one command
npm run deploy:firebase:full
```

### AWS S3 / CloudFront

```bash
# Deploy to S3 (requires prior build)
npm run deploy:s3

# Build and deploy to S3 in one command
npm run deploy:s3:full
```

Environment variables required:

- `S3_BUCKET` - The name of your S3 bucket
- `CLOUDFRONT_DISTRIBUTION_ID` (optional) - For cache invalidation

### Vercel

```bash
# Deploy to Vercel
npm run deploy:vercel
```

## CI/CD Pipeline

This project uses GitHub Actions for CI/CD with separate workflows:

1. **CI Pipeline** - Runs on every push and pull request:

   - Linting
   - Type checking
   - Unit and integration tests
   - End-to-end tests

2. **Deployment Workflows** - Run after successful CI or manual trigger:
   - Firebase deployment
   - AWS S3 deployment
   - Vercel deployment

## Node.js Version

This project uses Node.js 22. The version is defined in:

- `.nvmrc` file - for nvm users
- `package.json` `engines` field - for npm/yarn
- `package.json` `volta` field - for Volta users

When using nvm, you can switch to the correct Node.js version with:

```bash
nvm use
```

All GitHub Actions workflows are configured to use the Node.js version specified in `.nvmrc`.

## Project Structure

- `/src/app` - Application pages and layouts
- `/src/components` - React components
- `/src/contexts` - React contexts
- `/src/config` - Application configuration
- `/src/lib` - Utility functions
- `/src/services` - Service layer
- `/src/store` - State management
- `/e2e` - End-to-end tests
- `/scripts` - Utility scripts
- `/.github/workflows` - CI/CD workflows

## Documentation

- [Deployment Options](docs/deployment-options.md) - Detailed information about deployment options
- [CI Simulation](docs/ci-simulation.md) - How to simulate CI locally

## Node.js Version

This project uses Node.js 22. The version is defined in:

- `.nvmrc` file - for nvm users
- `package.json` `engines` field - for npm/yarn
- `package.json` `volta` field - for Volta users

When using nvm, you can switch to the correct Node.js version with:

```bash
nvm use
```

All GitHub Actions workflows are configured to use the Node.js version specified in `.nvmrc`.

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
