# CI Pipeline Configuration

This document explains how to customize the CI pipeline behavior.

## Skipping E2E Tests

End-to-end (E2E) tests are valuable but can sometimes be time-consuming or unnecessary for certain changes. You can skip E2E tests in the pipeline by adding a flag to your commit message or PR title.

### How to Skip E2E Tests

Add `[skip e2e]` or `[skip-e2e]` to your commit message or PR title:

#### In a Commit Message:

```bash
git commit -m "fix: update button styling [skip e2e]"
```

#### In a PR Title:

Simply include `[skip e2e]` anywhere in your PR title:

```
[skip e2e] Update documentation for deployment process
```

### When to Skip E2E Tests

Consider skipping E2E tests when:

- Making documentation-only changes
- Updating styles that don't affect functionality
- Making minor text changes
- Working on CI/CD configuration files that don't affect the application
- Making other changes that don't impact user-facing functionality

### Limitations

- If you skip E2E tests, make sure your changes truly don't require them
- The Pipeline workflow will still run all other checks (linting, type checking, unit tests)
- Deployment workflows will still run normally if triggered
- On the main branch, consider running E2E tests regardless of skip flags

## Other Pipeline Configurations

### Deployment Targeting

For information about configuring deployment targets, see [Deployment Configuration](deployment-config.md).
