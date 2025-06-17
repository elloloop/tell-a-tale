#!/usr/bin/env node
/**
 * S3 deployment script
 *
 * This script deploys the static build output to an AWS S3 bucket.
 *
 * Prerequisites:
 * - AWS CLI configured with appropriate credentials
 * - S3 bucket created and configured for static website hosting
 * - Build output in the 'out' directory (run 'npm run build:prod' first)
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Configuration
const S3_BUCKET = process.env.S3_BUCKET || 'your-s3-bucket-name';
const DISTRIBUTION_ID = process.env.CLOUDFRONT_DISTRIBUTION_ID;

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BUILD_DIR = path.join(path.dirname(__dirname), 'out');

// Check if build directory exists
if (!fs.existsSync(BUILD_DIR)) {
  console.error('Build directory does not exist. Run "npm run build:prod" first.');
  process.exit(1);
}

// Deploy to S3
console.log(`📤 Deploying to S3 bucket: ${S3_BUCKET}`);
try {
  execSync(`aws s3 sync ${BUILD_DIR} s3://${S3_BUCKET} --delete`, { stdio: 'inherit' });
  console.log('✅ S3 deployment completed successfully');
} catch (error) {
  console.error('❌ S3 deployment failed:', error.message);
  process.exit(1);
}

// Invalidate CloudFront cache if distribution ID is provided
if (DISTRIBUTION_ID) {
  console.log(`🔄 Invalidating CloudFront cache for distribution: ${DISTRIBUTION_ID}`);
  try {
    execSync(
      `aws cloudfront create-invalidation --distribution-id ${DISTRIBUTION_ID} --paths "/*"`,
      { stdio: 'inherit' }
    );
    console.log('✅ CloudFront invalidation created successfully');
  } catch (error) {
    console.error('❌ CloudFront invalidation failed:', error.message);
    process.exit(1);
  }
}

console.log('🎉 Deployment completed successfully!');
