FROM mcr.microsoft.com/playwright:v1.52.0-focal

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port for the app
EXPOSE 3000

# Create a script to run the app and tests
RUN echo '#!/bin/bash\n\
set -e\n\
\n\
# Start the app in background\n\
npm start &\n\
APP_PID=$!\n\
\n\
# Wait for the app to be ready\n\
echo "Waiting for app to be ready..."\n\
npx wait-on http://localhost:3000 --timeout 60000\n\
\n\
# Run the E2E tests with Docker config\n\
npx playwright test --config=playwright.config.docker.ts\n\
\n\
# Clean up\n\
kill $APP_PID\n\
' > /app/run-e2e.sh && chmod +x /app/run-e2e.sh

# Default command
CMD ["./run-e2e.sh"]