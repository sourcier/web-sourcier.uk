#!/bin/sh
set -e

pnpm install

# Install the Chromium binary that matches the installed @playwright/test version.
# The browser is cached in a named Docker volume (playwright-cache) so it
# survives container rebuilds and is only re-downloaded when the version changes.
pnpm exec playwright install chromium
