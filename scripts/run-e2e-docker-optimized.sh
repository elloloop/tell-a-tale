#!/bin/bash

# Run E2E tests in Docker containers with optimization
# This script provides advanced Docker configurations for better performance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[E2E Docker Optimized]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[E2E Docker Optimized]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[E2E Docker Optimized]${NC} $1"
}

print_error() {
    echo -e "${RED}[E2E Docker Optimized]${NC} $1"
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

print_status "Starting optimized E2E tests in Docker containers..."

# Parse command line arguments
CLEANUP=true
REBUILD=false
DEV_MODE=false
USE_CACHE=true
PARALLEL=false
BROWSER=""

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
        --no-cache)
            USE_CACHE=false
            shift
            ;;
        --parallel)
            PARALLEL=true
            shift
            ;;
        --browser)
            BROWSER="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --no-cleanup     Don't clean up containers after running tests"
            echo "  --rebuild        Rebuild Docker images before running tests"
            echo "  --dev            Run in development mode (with hot reload)"
            echo "  --no-cache       Don't use Docker cache when building"
            echo "  --parallel       Run tests in parallel across browsers"
            echo "  --browser BROWSER Specify browser (chromium, firefox, webkit)"
            echo "  -h, --help       Show this help message"
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
        print_status "Cleaning up containers and networks..."
        cd docker/e2e
        docker-compose -f docker-compose.yml -f docker-compose.optimized.yml down --volumes --remove-orphans
        cd ../..
    fi
}

# Set up cleanup trap
trap cleanup EXIT

# Change to Docker directory
cd docker/e2e

# Create optimized docker-compose configuration
print_info "Creating optimized Docker configuration..."
cat > docker-compose.optimized.yml << EOF
version: '3.8'
services:
  app:
    build:
      context: ../..
      dockerfile: docker/e2e/Dockerfile.optimized
      target: production
      cache_from:
        - node:22-bullseye-slim
        - mcr.microsoft.com/playwright:v1.52.0-focal
    environment:
      - NODE_ENV=production
      - CI=true
    volumes:
      - ../../playwright-report:/app/playwright-report
      - ../../test-results:/app/test-results
    networks:
      - e2e-network

  e2e-tests:
    build:
      context: ../..
      dockerfile: docker/e2e/Dockerfile.optimized
      target: production
      cache_from:
        - node:22-bullseye-slim
        - mcr.microsoft.com/playwright:v1.52.0-focal
    depends_on:
      - app
    environment:
      - NODE_ENV=production
      - CI=true
      - PLAYWRIGHT_BASE_URL=http://app:3000
EOF

# Add browser-specific configuration if specified
if [ -n "$BROWSER" ]; then
    cat >> docker-compose.optimized.yml << EOF
      - PLAYWRIGHT_PROJECT=$BROWSER
EOF
fi

cat >> docker-compose.optimized.yml << EOF
    volumes:
      - ../../playwright-report:/app/playwright-report
      - ../../test-results:/app/test-results
    command: >
      sh -c "
        npx wait-on http://app:3000 --timeout 60000 &&
        npx playwright test --config=playwright.config.docker.ts $([ -n "$BROWSER" ] && echo "--project=$BROWSER" || echo "")
      "
    networks:
      - e2e-network

networks:
  e2e-network:
    driver: bridge
EOF

# Modify for development mode if requested
if [ "$DEV_MODE" = true ]; then
    print_info "Configuring for development mode..."
    sed -i 's/target: production/target: development/g' docker-compose.optimized.yml
    sed -i 's/NODE_ENV=production/NODE_ENV=development/g' docker-compose.optimized.yml
fi

# Build arguments
BUILD_ARGS=""
if [ "$USE_CACHE" = false ]; then
    BUILD_ARGS="--no-cache"
fi

# Rebuild images if requested
if [ "$REBUILD" = true ]; then
    print_status "Rebuilding Docker images with optimization..."
    docker-compose -f docker-compose.yml -f docker-compose.optimized.yml build $BUILD_ARGS
fi

# Run parallel tests if requested
if [ "$PARALLEL" = true ]; then
    print_status "Running E2E tests in parallel across browsers..."
    
    # Create separate compose files for each browser
    for browser in chromium firefox webkit; do
        cat > docker-compose.${browser}.yml << EOF
version: '3.8'
services:
  e2e-tests-${browser}:
    build:
      context: ../..
      dockerfile: docker/e2e/Dockerfile.optimized
      target: production
    depends_on:
      - app
    environment:
      - NODE_ENV=production
      - CI=true
      - PLAYWRIGHT_BASE_URL=http://app:3000
      - PLAYWRIGHT_PROJECT=${browser}
    volumes:
      - ../../playwright-report-${browser}:/app/playwright-report
      - ../../test-results-${browser}:/app/test-results
    command: >
      sh -c "
        npx wait-on http://app:3000 --timeout 60000 &&
        npx playwright test --config=playwright.config.docker.ts --project=${browser}
      "
    networks:
      - e2e-network
EOF
    done
    
    # Run all browsers in parallel
    docker-compose -f docker-compose.yml -f docker-compose.optimized.yml -f docker-compose.chromium.yml -f docker-compose.firefox.yml -f docker-compose.webkit.yml up --build --abort-on-container-exit --exit-code-from e2e-tests-chromium
else
    # Run the tests
    print_status "Starting containers and running optimized E2E tests..."
    if docker-compose -f docker-compose.yml -f docker-compose.optimized.yml up --build --abort-on-container-exit --exit-code-from e2e-tests; then
        print_status "Optimized E2E tests completed successfully!"
        exit 0
    else
        print_error "Optimized E2E tests failed!"
        exit 1
    fi
fi