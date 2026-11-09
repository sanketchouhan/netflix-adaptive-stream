#!/usr/bin/env bash
set -euo pipefail

MEDIA_ROOT="${MEDIA_ROOT:-D:/LAMBDA_Projects/Netflix/netflix-adaptive-stream-media}"

mkdir -p "$MEDIA_ROOT/uploads" "$MEDIA_ROOT/output"

echo "Media directories ready at: $MEDIA_ROOT"
echo "  uploads: $MEDIA_ROOT/uploads"
echo "  output:  $MEDIA_ROOT/output"
