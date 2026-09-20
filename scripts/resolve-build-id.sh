#!/usr/bin/env bash
# Short git SHA + UTC timestamp — embedded in EXPO_PUBLIC_BUILD_ID for web demos.
set -euo pipefail
SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
echo "${SHA}-${TS}"
