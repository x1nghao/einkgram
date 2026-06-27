#!/bin/bash
#
# serve-dist.sh — Serve the production build for E-Ink device testing.
#
# Use this when you want to test Einkgram on a real E-Ink device
# without deploying to GitHub Pages. The E-Ink device connects
# to your laptop's IP on the local network.
#
# Why this exists:
#   - Vite dev mode (npm run dev:mocked) serves source files with
#     HMR; useful for development but E-Ink browsers are slow to
#     handle HMR over the network.
#   - Production build (dist/) is what users actually run; testing
#     it locally gives the same experience as the GitHub Pages
#     deployment.
#
# Usage:
#   ./dev/serve-dist.sh
#   # Then on your E-Ink device, open:
#   #   http://YOUR_MAC_IP:8080
#   # (the script prints the URLs at startup)
#
# Requirements:
#   - Built dist/ (run `npm run build:production` first)
#   - Python 3 (already on macOS) for the static server.
#   - Mac and E-Ink device on the same WiFi network.

set -e

DIST_DIR="$(cd "$(dirname "$0")/../src/dist" && pwd)"

if [ ! -d "$DIST_DIR" ]; then
  echo "Error: $DIST_DIR not found."
  echo "Run: cd src && npm install && npm run build:production"
  exit 1
fi

# Get the Mac's IP addresses so the user can connect from
# the E-Ink device. We list all IPv4 addresses on en0/en1
# (WiFi) — the user picks the one that matches their
# network.
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  Einkgram local test server"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Production build served from: $DIST_DIR"
echo ""
echo "Mac IP addresses (use one of these on your E-Ink device):"
ifconfig 2>/dev/null | grep -E "inet [0-9]" | grep -v "127.0.0.1" | awk '{print "  http://" $2 ":8080"}' || \
  ipconfig getifaddr en0 2>/dev/null | awk '{print "  http://" $1 ":8080 (en0/WiFi)"}'
echo ""
echo "Starting Python static server on port 8080..."
echo "Press Ctrl-C to stop."
echo ""

cd "$DIST_DIR"
# Python 3's http.server has correct MIME types for .js, .css,
# .webmanifest, .json, .svg, .png, .woff2, .wasm, .mp3.
# We bind to 0.0.0.0 so the E-Ink device can reach us.
python3 -m http.server 8080 --bind 0.0.0.0
