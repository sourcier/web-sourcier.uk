FROM mcr.microsoft.com/devcontainers/javascript-node:24

# Copy package.json so we can read the Playwright version dynamically
COPY package.json /tmp/package.json

# Install Playwright system dependencies (apt packages only — browser binary installed in post-create.sh)
# Version is read from package.json so it stays in sync automatically when @playwright/test is upgraded
RUN PW_VERSION=$(node -e "console.log(require('/tmp/package.json').devDependencies['@playwright/test'].replace(/[\\^~]/, ''))") \
 && npx -y "playwright@${PW_VERSION}" install-deps chromium \
 && rm -rf /var/lib/apt/lists/* /tmp/package.json

# Enable corepack and install pnpm
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

# Configure pnpm store outside the workspace so Vite doesn't watch it.
# Without this, the store inside the project burns through all inotify
# watchers and Vite crashes with ENOSPC.
USER node
RUN pnpm config set store-dir /home/node/.pnpm-store --global

# Pre-create the Playwright cache directory as the node user so the named
# Docker volume (playwright-cache) is initialised with the right ownership.
# Without this the volume is created root-owned and post-create.sh fails
# with EACCES when trying to install the Chromium binary.
RUN mkdir -p /home/node/.cache/ms-playwright
USER root
