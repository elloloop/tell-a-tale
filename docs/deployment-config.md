# Deployment Configuration

This document explains how to configure deployment targets for the project.

## Overview

The project uses a deployment orchestrator to determine which platforms to deploy to. You have four methods to configure deployment targets (in order of priority):

1. **Environment Variables** - Override targets using GitHub repository environment variables
2. **Manual selection** - Choose a target when manually triggering the workflow
3. **Configuration file** - Define targets in `deploy-config.json`
4. **Auto-detection** - Based on configuration files present in the project (fallback)

## Environment Variables (Highest Priority)

You can configure deployment targets using GitHub repository environment variables, which take precedence over other methods:

| Environment Variable       | Description                        | Value                                                |
| -------------------------- | ---------------------------------- | ---------------------------------------------------- |
| DEPLOY_TARGET_OVERRIDE     | Override all other settings        | firebase, aws-s3, vercel, github-pages, netlify, all |
| DEPLOY_TARGET_FIREBASE     | Enable/disable Firebase deployment | true/false                                           |
| DEPLOY_TARGET_AWS_S3       | Enable/disable AWS S3 deployment   | true/false                                           |
| DEPLOY_TARGET_VERCEL       | Enable/disable Vercel deployment   | true/false                                           |
| DEPLOY_TARGET_GITHUB_PAGES | Enable/disable GitHub Pages        | true/false                                           |
| DEPLOY_TARGET_NETLIFY      | Enable/disable Netlify deployment  | true/false                                           |

### Using DEPLOY_TARGET_OVERRIDE

If `DEPLOY_TARGET_OVERRIDE` is set, it will override all other settings and deploy only to the specified target:

```
DEPLOY_TARGET_OVERRIDE=firebase  # Only deploy to Firebase
DEPLOY_TARGET_OVERRIDE=all       # Deploy to all platforms
```

### Using Individual Target Variables

You can enable or disable specific targets independently:

```
DEPLOY_TARGET_FIREBASE=true
DEPLOY_TARGET_AWS_S3=true
DEPLOY_TARGET_VERCEL=false
```

To set these in your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to Settings > Secrets and variables > Actions
3. Click on "New repository variable"
4. Add the variables you need
   | DEPLOY_VERCEL | Deploy to Vercel | true/false, 1/0 |
   | DEPLOY_GITHUB_PAGES | Deploy to GitHub Pages | true/false, 1/0 |
   | DEPLOY_NETLIFY | Deploy to Netlify | true/false, 1/0 |

To set up environment variables:

1. Go to your GitHub repository settings
2. Navigate to Settings > Secrets and variables > Actions
3. Select the "Variables" tab
4. Click "New repository variable"
5. Add the desired variables with values `true` or `false`

Example: Setting `DEPLOY_FIREBASE=true` and `DEPLOY_VERCEL=true` will deploy only to Firebase and Vercel, regardless of what configuration files are present in the project.

## Auto-detection (Default)

If no environment variables are set, the deployment orchestrator detects which platforms to deploy to based on the presence of certain files:

| Platform     | Detection Method                                             |
| ------------ | ------------------------------------------------------------ |
| Firebase     | Presence of `firebase.json`                                  |
| AWS S3       | Presence of `scripts/deploy-s3.js`                           |
| Vercel       | Presence of `vercel.json` or `deploy:vercel` in package.json |
| GitHub Pages | Not auto-detected (must be specified)                        |
| Netlify      | Not auto-detected (must be specified)                        |

    "vercel": false,
    "github-pages": false,
    "netlify": false

},
"environments": {
"production": {
"targets": {
"firebase": true,
"aws-s3": true
}
},
"staging": {
"targets": {
"vercel": true

## Manual Selection

You can manually trigger a deployment and select a specific target:

1. Go to the GitHub Actions tab
2. Select "Deployment Orchestrator" workflow
3. Click "Run workflow"
4. Select a deployment target from the dropdown:
   - `auto`: Use environment variables or auto-detection
   - `firebase`: Only deploy to Firebase
   - `aws-s3`: Only deploy to AWS S3
   - `vercel`: Only deploy to Vercel
   - `github-pages`: Only deploy to GitHub Pages
   - `netlify`: Only deploy to Netlify
   - `all`: Deploy to all platforms

## Priority Order

The deployment orchestrator determines targets in this order:

1. Manually selected target (if specifically selected when triggering the workflow)
2. Environment variables (if any are set)
3. Auto-detection based on project files (fallback)

## Example Scenarios

### Scenario 1: Environment Variables Override

Setting GitHub environment variables:

- `DEPLOY_FIREBASE=true`
- `DEPLOY_VERCEL=true`

Result: Will deploy only to Firebase and Vercel, even if AWS S3 configuration is present in the repo.

### Scenario 2: Auto-detection Fallback

No environment variables are set, but the repo contains:

- `firebase.json`
- `scripts/deploy-s3.js`

Result: Will auto-detect and deploy to both Firebase and AWS S3.

### Scenario 3: Manual Override for One-time Deployment

1. Manually triggering workflow
2. Selecting `vercel` as the target

Result: Will deploy only to Vercel for this run, regardless of environment variables or auto-detection.

## Setting Up Environment Variables

1. Go to your GitHub repository
2. Navigate to Settings > Secrets and variables > Actions
3. Select the "Variables" tab
4. Click "New repository variable"
5. Create variables for each platform you want to configure:
   - `DEPLOY_FIREBASE`: true/false
   - `DEPLOY_AWS_S3`: true/false
   - `DEPLOY_VERCEL`: true/false
   - `DEPLOY_GITHUB_PAGES`: true/false
   - `DEPLOY_NETLIFY`: true/false

This allows you to set default deployment targets at the repository level, while still having the flexibility to override them when needed.
