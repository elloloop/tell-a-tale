#!/usr/bin/env node
/**
 * Next.js Bundle Analysis Script
 *
 * This script analyzes the Next.js build and generates reports on bundle sizes.
 * It's useful for identifying large dependencies and opportunities for optimization.
 *
 * Usage:
 *   npm run build:analyze
 *
 * This will:
 *   1. Run Next.js build with bundle analysis
 *   2. Generate bundle analysis reports
 *   3. Open the analysis in a browser
 */

// This script is executed by Next.js when ANALYZE=true is set in the environment
// The actual implementation is in next.config.ts using the @next/bundle-analyzer

console.log('📊 Bundle analysis will be generated during the build process.');
console.log('   Look for the report in .next/analyze/ after the build completes.');
console.log('   A browser window with the analysis should open automatically.');
