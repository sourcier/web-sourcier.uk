#!/bin/sh
set -e

# Move the pnpm store outside the workspace so Vite doesn't watch it.
# Without this, the store inside the project burns through all inotify
# watchers and Vite crashes with ENOSPC.
pnpm config set store-dir /home/node/.pnpm-store --global
