# Deployment Options

This document provides detailed information about the deployment options available in this project.

## Overview

The project supports multiple deployment targets, each with its own workflow:

1. **Firebase Hosting** - For serverless web app hosting
2. **AWS S3 / CloudFront** - For scalable static site hosting with CDN
3. **Vercel** - For Next.js-optimized deployments

## Deployment Process

All deployments follow a similar process:

1. **Build**: Create a production-ready build of the application
2. **Deploy**: Push the built assets to the target platform
3. **Verify**: Confirm the deployment was successful

## Firebase Hosting

Firebase Hosting provides fast and secure hosting for web applications.

### Setup

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase: `firebase init hosting`

### Configuration

The Firebase configuration is in `firebase.json`:

```json
{
  "hosting": {
    "site": "your-site-name",
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
  }
}
```

### Deployment

```bash
# Deploy to Firebase (requires prior build)
npm run deploy:firebase

# Build and deploy in one command
npm run deploy:firebase:full
```

### CI/CD

The GitHub Actions workflow for Firebase deployment is in `.github/workflows/firebase-hosting-merge.yml`.

Required secrets:

- `FIREBASE_SERVICE_ACCOUNT` - Firebase service account credentials
- Firebase environment variables (API keys, etc.)

## AWS S3 / CloudFront

AWS S3 provides highly scalable object storage, and CloudFront provides a global CDN.

### Setup

1. Create an S3 bucket configured for static website hosting
2. (Optional) Create a CloudFront distribution pointing to the S3 bucket
3. Configure AWS credentials locally or in CI/CD

### Configuration

The S3 deployment is configured through environment variables:

- `S3_BUCKET` - The name of your S3 bucket
- `CLOUDFRONT_DISTRIBUTION_ID` (optional) - For cache invalidation

### Deployment

```bash
# Deploy to S3 (requires prior build)
npm run deploy:s3

# Build and deploy in one command
npm run deploy:s3:full
```

### CI/CD

The GitHub Actions workflow for S3 deployment is in `.github/workflows/deploy-s3.yml`.

Required secrets:

- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_REGION` - AWS region
- `S3_BUCKET` - S3 bucket name
- `CLOUDFRONT_DISTRIBUTION_ID` (optional) - CloudFront distribution ID

## Vercel

Vercel is optimized for Next.js applications and provides serverless functions, edge computing, and global CDN.

### Setup

1. Install Vercel CLI: `npm install -g vercel`
2. Login to Vercel: `vercel login`
3. Link project: `vercel link`

### Deployment

```bash
# Deploy to Vercel (builds and deploys in one step)
npm run deploy:vercel
```

### CI/CD

The GitHub Actions workflow for Vercel deployment is in `.github/workflows/deploy-vercel.yml`.

Required secrets:

- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID

## Choosing a Deployment Option

| Feature        | Firebase                          | AWS S3/CloudFront            | Vercel                |
| -------------- | --------------------------------- | ---------------------------- | --------------------- |
| Best for       | Quick setup, Firebase integration | Custom domains, high traffic | Next.js optimizations |
| Cost           | Free tier available               | Pay per use                  | Free tier available   |
| CI/CD          | Easy integration                  | Requires more setup          | Seamless integration  |
| SSR Support    | Limited                           | No                           | Yes                   |
| API Routes     | No                                | No                           | Yes                   |
| Custom domains | Yes                               | Yes (via CloudFront)         | Yes                   |

## Adding a New Deployment Target

To add a new deployment target:

1. Create a deployment script in `scripts/`
2. Add deployment commands to `package.json`
3. Create a GitHub Actions workflow in `.github/workflows/`
4. Update documentation to include the new deployment option
