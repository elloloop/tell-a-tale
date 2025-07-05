#!/bin/bash

# Run E2E tests in Docker containers
# This script provides a convenient way to run E2E tests locally using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[E2E Docker]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[E2E Docker]${NC} $1"
}

print_error() {
    echo -e "${RED}[E2E Docker]${NC} $1"
}

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose >/dev/null 2>&1; then
    print_error "docker-compose is not installed. Please install it and try again."
    exit 1
fi

# Change to the project root directory
cd "$(dirname "$0")/.."

print_status "Starting E2E tests in Docker containers..."

# Parse command line arguments
CLEANUP=true
REBUILD=false
DEV_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-cleanup)
            CLEANUP=false
            shift
            ;;
        --rebuild)
            REBUILD=true
            shift
            ;;
        --dev)
            DEV_MODE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --no-cleanup  Don't clean up containers after running tests"
            echo "  --rebuild     Rebuild Docker images before running tests"
            echo "  --dev         Run in development mode (with hot reload)"
            echo "  -h, --help    Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Cleanup function
cleanup() {
    if [ "$CLEANUP" = true ]; then
        print_status "Cleaning up containers..."
        cd docker/e2e
        docker-compose down --volumes --remove-orphans
        cd ../..
    fi
}

# Set up cleanup trap
trap cleanup EXIT

# Change to Docker directory
cd docker/e2e

# Rebuild images if requested
if [ "$REBUILD" = true ]; then
    print_status "Rebuilding Docker images..."
    docker-compose build --no-cache
fi

# Choose the appropriate docker-compose configuration
if [ "$DEV_MODE" = true ]; then
    print_status "Running E2E tests in development mode..."
    # Create a dev-specific docker-compose override
    cat > docker-compose.override.yml << EOF
version: '3.8'
services:
  app:
    build:
      dockerfile: docker/e2e/Dockerfile.dev
    volumes:
      - ../../src:/app/src
      - ../../e2e:/app/e2e
      - ../../playwright.config.ts:/app/playwright.config.ts
  e2e-tests:
    build:
      dockerfile: docker/e2e/Dockerfile.dev
    volumes:
      - ../../src:/app/src
      - ../../e2e:/app/e2e
      - ../../playwright.config.ts:/app/playwright.config.ts
EOF
else
    print_status "Running E2E tests in production mode..."
    # Remove any existing override file
    rm -f docker-compose.override.yml
fi

# Run the tests
print_status "Starting containers and running E2E tests..."
if docker-compose up --build --abort-on-container-exit --exit-code-from e2e-tests; then
    print_status "E2E tests completed successfully!"
    exit 0
else
    print_error "E2E tests failed!"
    exit 1
fi