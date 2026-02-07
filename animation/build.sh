#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
OUTPUT="$PROJECT_ROOT/intro-animation.gif"

echo "=== Intro Animation Build ==="

# Step 1: Capture frames
echo "Step 1: Capturing frames with Puppeteer..."
cd "$SCRIPT_DIR"
node capture.js

# Step 2: Encode GIF
echo "Step 2: Encoding GIF with gifski..."
gifski --fps 20 --width 400 --quality 80 -o "$OUTPUT" frames/frame_*.png

# Step 3: Report
SIZE=$(stat -f%z "$OUTPUT" 2>/dev/null || stat -c%s "$OUTPUT" 2>/dev/null)
SIZE_KB=$((SIZE / 1024))
echo ""
echo "=== Done ==="
echo "Output: $OUTPUT"
echo "Size: ${SIZE_KB}KB"
echo ""

if [ "$SIZE_KB" -gt 3072 ]; then
  echo "WARNING: GIF is over 3MB (${SIZE_KB}KB). Consider reducing quality or frame count."
fi
