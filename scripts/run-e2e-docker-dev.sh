#!/bin/bash

# Run E2E tests in Docker containers in development mode
# This script provides fast iteration for E2E test development

set -e

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[E2E Docker Dev]${NC} $1"
}

# Change to the project root directory
cd "$(dirname "$0")/.."

print_status "Starting E2E tests in development mode..."

# Run the main script with dev flag
./scripts/run-e2e-docker.sh --dev --no-cleanup "$@"

print_status "Development E2E test session completed."