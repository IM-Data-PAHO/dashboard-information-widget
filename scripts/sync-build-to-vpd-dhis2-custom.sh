#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ZIP_FILE="$ROOT_DIR/dashboard-information-widget.zip"
TARGET_DIR="/Users/PAHO/vpd-dhis2-custom/dashboard-information-widget"

if [[ ! -f "$ZIP_FILE" ]]; then
    echo "[sync-build] Zip file not found: $ZIP_FILE"
    echo "[sync-build] Run yarn build first."
    exit 1
fi

mkdir -p "$TARGET_DIR"
cp "$ZIP_FILE" "$TARGET_DIR/"

echo "[sync-build] Copied $(basename "$ZIP_FILE") to $TARGET_DIR"
