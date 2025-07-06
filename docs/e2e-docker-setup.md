# E2E Tests in Docker

This document explains how to run E2E tests in Docker containers for both local development and CI environments.

## Overview

The E2E tests have been containerized to provide:

- Consistent testing environment across local and CI
- Isolated test execution
- Automatic browser and dependency management
- Simplified setup and teardown

## Prerequisites

- Docker installed and running
- Docker Compose installed
- Node.js and npm (for local development)

## Quick Start

### Local Development

```bash
# Run E2E tests in Docker containers
npm run test:e2e:docker

# Run E2E tests in development mode (with hot reload)
npm run test:e2e:docker:dev

# Rebuild Docker images and run tests
npm run test:e2e:docker:rebuild

# Run optimized E2E tests with multi-stage builds
npm run test:e2e:docker:optimized

# Run E2E tests in parallel across all browsers
npm run test:e2e:docker:parallel

# Run E2E tests for a specific browser
npm run test:e2e:docker:browser chromium
```

### Direct Script Usage

```bash
# Run with default settings
./scripts/run-e2e-docker.sh

# Run in development mode
./scripts/run-e2e-docker.sh --dev

# Rebuild images before running
./scripts/run-e2e-docker.sh --rebuild

# Keep containers running after tests (for debugging)
./scripts/run-e2e-docker.sh --no-cleanup

# Run optimized E2E tests with advanced options
./scripts/run-e2e-docker-optimized.sh

# Run optimized tests in parallel across browsers
./scripts/run-e2e-docker-optimized.sh --parallel

# Run optimized tests for specific browser
./scripts/run-e2e-docker-optimized.sh --browser firefox

# Run optimized tests without Docker cache
./scripts/run-e2e-docker-optimized.sh --no-cache --rebuild
```

## Architecture

### Docker Setup

The E2E testing uses two Docker containers:

1. **App Container**: Runs the Next.js application
2. **Test Container**: Runs the Playwright E2E tests

### Files Structure

```
docker/
├── e2e/
│   ├── Dockerfile              # Production E2E test container
│   ├── Dockerfile.dev          # Development E2E test container
│   ├── Dockerfile.optimized    # Multi-stage optimized container
│   ├── docker-compose.yml      # Docker Compose configuration
│   └── .dockerignore           # Docker build exclusions
├── scripts/
│   ├── run-e2e-docker.sh         # Main E2E Docker runner
│   ├── run-e2e-docker-dev.sh     # Development E2E runner
│   └── run-e2e-docker-optimized.sh # Optimized E2E runner with advanced features
├── .github/workflows/
│   ├── pipeline.yml           # Main CI pipeline with Docker E2E
│   ├── e2e-post-deploy.yml    # Post-deployment E2E tests
│   └── e2e-matrix.yml         # Matrix testing across browsers
└── playwright.config.docker.ts  # Playwright config for Docker
```

## Configuration Files

### Playwright Configuration

The `playwright.config.docker.ts` file contains Docker-specific settings:

- Uses `PLAYWRIGHT_BASE_URL` environment variable
- Increased timeouts for containerized environments
- Multiple output formats (HTML, JSON, JUnit)
- Optimized for CI environments

### Docker Compose

The `docker-compose.yml` defines:

- App service (runs the Next.js app)
- E2E test service (runs the Playwright tests)
- Shared network for service communication
- Volume mounts for test results

## Environment Variables

- `PLAYWRIGHT_BASE_URL`: Base URL for tests (defaults to `http://localhost:3000`)
- `NODE_ENV`: Set to `test` in Docker containers
- `CI`: Set to `true` for CI-specific behavior

## Local Development Workflow

### Development Mode

```bash
npm run test:e2e:docker:dev
```

Development mode includes:

- Hot reload for source code changes
- Volume mounts for live file updates
- Faster iteration cycles
- Persistent containers for debugging

### Production Mode

```bash
npm run test:e2e:docker
```

Production mode includes:

- Built application (Next.js build)
- Optimized container images
- CI-ready configuration
- Automatic cleanup

## CI Integration

### GitHub Actions

The CI pipeline automatically runs E2E tests in Docker:

```yaml
- name: Run E2E tests in Docker
  run: npm run test:e2e:docker
```

### Post-Deploy Testing

E2E tests also run after deployment:

```yaml
- name: Run E2E tests in Docker
  run: npm run test:e2e:docker
```

## Troubleshooting

### Common Issues

1. **Docker not running**

   ```bash
   # Check if Docker is running
   docker info
   ```

2. **Port conflicts**

   ```bash
   # Stop conflicting services
   docker-compose down
   ```

3. **Image build failures**

   ```bash
   # Clean rebuild
   npm run test:e2e:docker:rebuild
   ```

4. **Test timeouts**
   - Check container logs: `docker-compose logs`
   - Increase timeouts in `playwright.config.docker.ts`

### Debugging

1. **Keep containers running**

   ```bash
   ./scripts/run-e2e-docker.sh --no-cleanup
   ```

2. **Interactive debugging**

   ```bash
   # Access the test container
   docker-compose exec e2e-tests bash
   ```

3. **View logs**
   ```bash
   docker-compose logs app
   docker-compose logs e2e-tests
   ```

## Advanced Features

### Optimized Docker Builds

The optimized Dockerfile uses multi-stage builds for better performance:

- **Base Stage**: Common system dependencies
- **Build Stage**: Application compilation
- **Playwright Stage**: Browser installation
- **Production/Development Stages**: Optimized runtime environments

### Parallel Browser Testing

Run tests across multiple browsers simultaneously:

```bash
# Test all browsers in parallel
npm run test:e2e:docker:parallel

# Test specific browser
npm run test:e2e:docker:browser webkit
```

### Matrix Testing

The `e2e-matrix.yml` workflow provides:

- Parallel execution across chromium, firefox, and webkit
- Separate artifact collection per browser
- Fail-fast disabled for comprehensive testing

### Caching and Performance

- Docker layer caching for faster builds
- Multi-stage builds to minimize image size
- Shared base images across containers
- Volume mounts for persistent test results

## Performance Optimization

### Local Development

- Use development mode for faster iteration
- Keep containers running between test runs
- Use volume mounts for live updates
- Use optimized builds for better performance

### CI Environment

- Use production builds for accuracy
- Optimize Docker layer caching
- Run tests in parallel when possible
- Use matrix strategy for comprehensive browser coverage

## Migration from Native E2E Tests

### Package.json Scripts

Old scripts still work for local development:

- `npm run test:e2e` - Native Playwright tests
- `npm run test:e2e:ui` - Playwright UI mode

New Docker scripts:

- `npm run test:e2e:docker` - Docker E2E tests
- `npm run test:e2e:docker:dev` - Docker development mode
- `npm run test:e2e:docker:optimized` - Optimized multi-stage Docker tests
- `npm run test:e2e:docker:parallel` - Parallel browser testing
- `npm run test:e2e:docker:browser` - Single browser testing

### Configuration

- `playwright.config.ts` - Native configuration
- `playwright.config.docker.ts` - Docker configuration

## Best Practices

1. **Use Docker for CI/CD**: Ensures consistent environment
2. **Use native tests for development**: Faster feedback loop
3. **Volume mount test files**: Enable live updates in development
4. **Clean up containers**: Prevent resource leaks
5. **Monitor resource usage**: Docker containers consume system resources

## Future Enhancements

- Parallel test execution across multiple containers
- Integration with test reporting services
- Support for different browser versions
- Performance benchmarking in containers
