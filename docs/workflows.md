# CI/CD Workflows Overview

This document provides an overview of the CI/CD workflows in this project and how they interact with each other.

## Workflow Structure

The project uses a multi-stage CI/CD pipeline with separate concerns:

1. **CI Pipeline**: Testing and validation
2. **Deployment Workflows**: Building and deploying to different platforms

This separation allows for:

- Independent testing without deployment
- Multiple deployment targets from the same tested codebase
- Manual triggering of deployments after successful tests

## CI Pipeline Workflow

File: `.github/workflows/ci.yml`

The CI pipeline runs on every push and pull request:

- Lint code with ESLint
- Type check with TypeScript
- Run unit and integration tests with Jest
- Run end-to-end tests with Playwright
- Upload test coverage and Playwright reports as artifacts

## Deployment Workflows

The project supports multiple deployment targets, each with its own workflow:

### Firebase Deployment

File: `.github/workflows/firebase-hosting-merge.yml`

Triggered by:

- Successful completion of the CI Pipeline workflow
- Manual trigger via workflow_dispatch

Steps:

1. Build the application
2. Deploy to Firebase Hosting

### AWS S3 Deployment

File: `.github/workflows/deploy-s3.yml`

Triggered by:

- Successful completion of the CI Pipeline workflow
- Manual trigger via workflow_dispatch

Steps:

1. Build the application
2. Configure AWS credentials
3. Deploy to S3 bucket
4. Invalidate CloudFront cache (if configured)

### Vercel Deployment

File: `.github/workflows/deploy-vercel.yml`

Triggered by:

- Successful completion of the CI Pipeline workflow
- Manual trigger via workflow_dispatch

Steps:

1. Install Vercel CLI
2. Deploy to Vercel (build is handled by Vercel)

## Workflow Dependencies

The workflows are designed to run in a specific order:

```
                ┌─────────────────┐
                │                 │
                │   CI Pipeline   │
                │                 │
                └────────┬────────┘
                         │
                         │ (on success)
                         ▼
         ┌───────────────┼───────────────┐
         │               │               │
┌────────▼─────────┐ ┌───▼────────────┐ ┌▼──────────────┐
│                  │ │                │ │               │
│ Firebase Deploy  │ │  AWS S3 Deploy │ │ Vercel Deploy │
│                  │ │                │ │               │
└──────────────────┘ └────────────────┘ └───────────────┘
```

Each deployment workflow can also be triggered manually via the GitHub Actions UI.

## Secrets Management

Each workflow requires different secrets:

- **Firebase**: `FIREBASE_SERVICE_ACCOUNT`, Firebase environment variables
- **AWS S3**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `S3_BUCKET`, `CLOUDFRONT_DISTRIBUTION_ID` (optional)
- **Vercel**: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

## Local Development

For local development and testing of workflows:

```bash
# Run the CI pipeline locally
npm run ci-local

# Test, build, and deploy to a specific platform
npm run test:all && npm run build:prod && npm run deploy:firebase
npm run test:all && npm run build:prod && npm run deploy:s3
npm run test:all && npm run deploy:vercel
```

## VS Code Tasks

The project includes VS Code tasks for running workflows:

- **Test and Build**: Run all tests and build the application
- **Full CI/CD Pipeline (Firebase)**: Run tests, build, and deploy to Firebase
- **Full CI/CD Pipeline (AWS S3)**: Run tests, build, and deploy to AWS S3

## Adding a New Deployment Target

To add a new deployment target:

1. Create a deployment script in the `scripts/` directory
2. Add deployment commands to `package.json`
3. Create a GitHub Actions workflow in `.github/workflows/`
4. Update this documentation to include the new deployment workflow
