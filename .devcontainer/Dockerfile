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

# Set zsh as the default shell for the node user
RUN chsh -s /bin/zsh node

# Symlink /Users/node → /home/node so macOS-style absolute paths in dotfiles
# (e.g. /Users/node/.oh-my-zsh) resolve correctly inside the Linux container.
RUN mkdir -p /Users && ln -s /home/node /Users/node

# Install Oh My Zsh plugins and Powerlevel10k theme into the image.
# In local containers these are overlaid by the ~/.oh-my-zsh/custom bind mount.
# In Codespaces (no bind mounts) these are the live copies, ensuring the
# terminal works before the dotfiles repo has been cloned.
RUN git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions /home/node/.oh-my-zsh/custom/plugins/zsh-autosuggestions \
 && git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting /home/node/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting \
 && git clone --depth=1 https://github.com/romkatv/powerlevel10k /home/node/.oh-my-zsh/custom/themes/powerlevel10k \
 && chown -R node:node /home/node/.oh-my-zsh/custom

# Configure pnpm store outside the workspace so Vite doesn't watch it.
# Without this, the store inside the project burns through all inotify
# watchers and Vite crashes with ENOSPC.
USER node
RUN pnpm config set store-dir /home/node/.pnpm-store --global

# Pre-create the Playwright cache directory as the node user so the named
# Docker volume (playwright-cache) is initialised with the right ownership.
# Without this the volume is created root-owned and post-create fails
# with EACCES when trying to install the Chromium binary.
RUN mkdir -p /home/node/.cache/ms-playwright
USER root
