#!/bin/bash
#
# cleanup-dist.sh — Reduce Einkgram dist/ size for E-Ink deployment.
#
# Why this exists:
#   The vanilla Telegram-tt production build is ~12 MB gzipped
#   but ~210 MB on disk because it bundles:
#     - 96 MB build-stats.json (a build report, never needed at runtime)
#     - 99 MB Apple emoji images (img-apple-64/ + img-apple-160/)
#       - used for color emoji rendering; on E-Ink these are wasted
#         bytes (the panel can only show 16 grays)
#     - 3 MB statoscope-report.html (build inspector; dev-only)
#
# This script removes the build-time artifacts and replaces the
# emoji folders with symlinks to the smaller "img-apple-64" folder
# so the emoji renderer falls back to a single grayscale set.
# Net result: dist/ shrinks from ~210 MB to ~12 MB.
#
# Usage:
#   ./dev/cleanup-dist.sh
#   # Run after `npm run build:production`, before deploying.

set -e

DIST_DIR="$(cd "$(dirname "$0")/../src/dist" && pwd)"

if [ ! -d "$DIST_DIR" ]; then
  echo "Error: $DIST_DIR not found."
  echo "Run: cd src && npm run build:production"
  exit 1
fi

echo "Before cleanup:"
du -sh "$DIST_DIR" 2>/dev/null
echo ""

# 1. Remove build-time artifacts.
echo "Removing build-stats.json (96 MB)..."
rm -f "$DIST_DIR/build-stats.json"

echo "Removing statoscope-report.html (3 MB)..."
rm -f "$DIST_DIR/statoscope-report.html"

# 2. Replace large emoji folder with symlink to smaller one.
#    Both are populated with the SAME set of files; the renderer
#    picks one based on display DPI. On E-Ink we always use the
#    64-px grayscale set; the 160-px set is overkill.
LARGE_EMOJI="$DIST_DIR/img-apple-160"
SMALL_EMOJI="$DIST_DIR/img-apple-64"
if [ -d "$LARGE_EMOJI" ] && [ -d "$SMALL_EMOJI" ]; then
  echo "Replacing img-apple-160/ (63 MB) with symlink to img-apple-64/..."
  rm -rf "$LARGE_EMOJI"
  ln -s "img-apple-64" "$LARGE_EMOJI"
fi

echo ""
echo "After cleanup:"
du -sh "$DIST_DIR" 2>/dev/null
echo ""

# Final sanity check.
echo "Top 5 largest remaining items:"
du -sh "$DIST_DIR"/* 2>/dev/null | sort -h | tail -5

echo ""
echo "Done. dist/ is ready for deployment."
