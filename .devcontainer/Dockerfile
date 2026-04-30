FROM mcr.microsoft.com/devcontainers/javascript-node:24

# Install Playwright system dependencies and browser binaries
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npx -y playwright install-deps chromium \
 && npx -y playwright install chromium \
 && rm -rf /var/lib/apt/lists/*

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate
