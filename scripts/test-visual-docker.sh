#!/usr/bin/env bash
set -euo pipefail

# Runs the visual regression suite inside the same Playwright Docker image CI uses,
# forced to linux/arm64 so the generated baselines land in the same
# `src/e2e/__snapshots__/**/linux-arm64/` folder CI compares against. CI runs on
# ubuntu-24.04-arm for the same reason: both sides run the image natively on
# arm64, with no QEMU emulation on Apple Silicon.
#
# Usage:
#   scripts/test-visual-docker.sh          # compare against existing linux-arm64 baselines
#   scripts/test-visual-docker.sh update   # regenerate linux-arm64 baselines

# Keep in sync with the image tag pinned in .github/workflows/ci.yml
PLAYWRIGHT_IMAGE="mcr.microsoft.com/playwright:v1.59.1-noble"
MODE="${1:-compare}"

case "$MODE" in
  compare) TEST_CMD="pnpm test:visual" ;;
  update) TEST_CMD="pnpm test:visual:update" ;;
  *)
    echo "Usage: $0 [compare|update]" >&2
    exit 1
    ;;
esac

# Named volumes (not bind mounts) for node_modules/pnpm store so the container's
# linux/arm64 native bindings never overwrite the host's macOS node_modules.
docker run --rm \
  --platform linux/arm64 \
  --ipc host \
  -v "$PWD:/work" \
  -v visual-regression-node-modules:/work/node_modules \
  -v visual-regression-pnpm-store:/root/.local/share/pnpm/store \
  -w /work \
  -e CI=true \
  -e SHOW_DRAFTS=false \
  -e "PUBLIC_STRIPE_PUBLISHABLE_KEY=${PUBLIC_STRIPE_PUBLISHABLE_KEY:-}" \
  -e "PUBLIC_POSTHOG_KEY=${PUBLIC_POSTHOG_KEY:-}" \
  -e "PUBLIC_POSTHOG_HOST=${PUBLIC_POSTHOG_HOST:-}" \
  "$PLAYWRIGHT_IMAGE" \
  bash -c "
    set -euo pipefail
    corepack enable
    apt-get update -qq && apt-get install -y -qq rsync
    # --store-dir must be explicit: pnpm silently writes a project-local .pnpm-store
    # into the bind-mounted repo otherwise, ignoring the named volume above.
    pnpm install --frozen-lockfile --store-dir /root/.local/share/pnpm/store
    pnpm assets:sync
    pnpm build
    pnpm build:search
    $TEST_CMD
  "
