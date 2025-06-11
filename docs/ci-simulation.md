# CI Simulation Scripts

This folder contains scripts that help simulate CI environments locally, allowing you to catch and fix CI-related issues before pushing to GitHub.

> **Note:** These scripts are added to `.gitignore` and are meant for local development only. They should not be committed to the repository. Each developer can set them up locally using the instructions in this document.

## Available Scripts

### 1. `run-ci-local.sh`

Simulates the entire CI pipeline as defined in GitHub Actions, running:

- Linting
- Type checking
- Unit tests
- E2E tests

```bash
npm run ci-local
```

### 2. `run-unit-tests.sh`

Runs only the unit tests in a CI-like environment.

```bash
npm run test:ci
```

### 3. `simulate-github-actions.sh`

The most accurate simulation of GitHub Actions, setting all the relevant environment variables.

```bash
npm run test:github-actions
```

### 4. `test-story-editor.sh`

Focused test runner that only tests the StoryEditor component in a GitHub Actions-like environment.

```bash
npm run test:story-editor
```

## Why Use These Scripts?

1. **Catch CI Issues Early**: Find and fix problems before they fail in GitHub Actions.
2. **Save Time**: Avoid waiting for CI builds to discover issues.
3. **Identical Environment**: Tests run in conditions very similar to the actual CI environment.
4. **Focused Testing**: Target specific components that have been problematic in CI.

## Environment Variables

These scripts set environment variables like `CI=true` and `GITHUB_ACTIONS=true` which can affect how tests behave. Some testing frameworks change their behavior in CI environments, so it's important to test with these variables set.

## Troubleshooting CI Failures

If a test is failing in GitHub Actions but passing locally:

1. Run `npm run test:github-actions` to see if you can reproduce the issue
2. If needed, create a focused test script like `test-story-editor.sh` for the failing component
3. Make fixes and verify with these scripts before pushing again

## Setting Up These Scripts

Since these scripts are not committed to the repository (they're in `.gitignore`), you'll need to create them locally. Here's how:

1. Create a `scripts` directory in your project root if it doesn't exist:

   ```bash
   mkdir -p scripts
   ```

2. Create each script file with the content described below and make them executable:

   ```bash
   touch scripts/run-ci-local.sh scripts/run-unit-tests.sh scripts/simulate-github-actions.sh scripts/test-story-editor.sh
   chmod +x scripts/*.sh
   ```

3. Copy the script content from the sections below into each file.

### run-ci-local.sh

```bash
#!/bin/bash
# Script to run CI tasks locally in the same order as GitHub Actions

# Set -e to exit immediately if any command fails
set -e

# Set CI environment variable to true to simulate CI environment
export CI=true

echo "=== 🔍 Running lint checks ==="
npm run lint

echo "=== ⚙️ Running type checking ==="
npm run typecheck

echo "=== 🧪 Running unit and integration tests ==="
npm test

echo "=== 🎭 Running E2E tests ==="
npx playwright install --with-deps
npm run test:e2e

echo "=== ✅ All tests passed successfully! ==="
```

### run-unit-tests.sh

```bash
#!/bin/bash
# Script to run only unit tests locally in the same way as GitHub Actions

set -e

# Set CI environment variable to true to simulate CI environment
export CI=true

echo "=== 🧪 Running unit and integration tests ==="
npm test

echo "=== ✅ Unit tests completed! ==="
```

### simulate-github-actions.sh

```bash
#!/bin/bash
# Script to run tests exactly as they would run in GitHub Actions

set -e

# GitHub Actions environment variables
export CI=true
export GITHUB_ACTIONS=true
export GITHUB_WORKSPACE=$(pwd)
export GITHUB_SHA=$(git rev-parse HEAD)
export GITHUB_REF=$(git symbolic-ref HEAD)
export GITHUB_REPOSITORY="username/tell-a-tale"  # Replace with your actual repo name
export GITHUB_EVENT_NAME="push"
export NODE_ENV=test

echo "=== 🧪 Running unit tests in GitHub Actions environment ==="
npm test

echo "=== ✅ GitHub Actions test simulation completed! ==="
```

### test-story-editor.sh

```bash
#!/bin/bash
# Script to run only the StoryEditor tests in GitHub Actions environment

set -e

# GitHub Actions environment variables
export CI=true
export GITHUB_ACTIONS=true
export GITHUB_WORKSPACE=$(pwd)
export NODE_ENV=test

echo "=== 🧪 Running StoryEditor tests in GitHub Actions environment ==="
npm test -- "StoryEditor"

echo "=== ✅ StoryEditor tests completed! ==="
```
