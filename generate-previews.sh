#!/usr/bin/env bash
set -euo pipefail

PREVIEW_ROOT="previews"
SIZES=(200 800)
FORCE=0

usage() {
  echo "Usage: $0 [--force|-f]"
  echo
  echo "Generates preview sizes: ${SIZES[*]}"
}

die() {
  echo "Error: $*" >&2
  exit 1
}

# --- Detect ImageMagick (IM6 / IM7 compatible) ---
if command -v magick >/dev/null 2>&1; then
  IM_CMD="magick"
elif command -v convert >/dev/null 2>&1; then
  IM_CMD="convert"
else
  die "ImageMagick not found. Install with: sudo zypper install ImageMagick"
fi

# --- Check optipng ---
command -v optipng >/dev/null 2>&1 || \
  die "optipng not found. Install with: sudo zypper install optipng"

# --- Args ---
while [[ $# -gt 0 ]]; do
  case "$1" in
    --force|-f) FORCE=1; shift ;;
    --help|-h) usage; exit 0 ;;
    *) die "Unknown option: $1" ;;
  esac
done

shopt -s nullglob
PNGS=( *.png )
shopt -u nullglob

[[ ${#PNGS[@]} -gt 0 ]] || die "No .png files found."

for size in "${SIZES[@]}"; do
  outdir="${PREVIEW_ROOT}/${size}"
  mkdir -p "$outdir"

  for img in "${PNGS[@]}"; do
    base="$(basename "$img")"
    out="${outdir}/${base}"
    tmp="$(mktemp --suffix=.png)"

    if [[ $FORCE -eq 0 && -f "$out" && "$out" -nt "$img" ]]; then
      echo "Skipping ${img} (${size}px up-to-date)"
      continue
    fi

    echo "Generating ${img} → ${out} (${size}px)"

    "$IM_CMD" "$img" \
      -resize "${size}x${size}" \
      -filter point \
      -strip \
      -define png:compression-level=6 \
      "$tmp"

    optipng -o7 -quiet "$tmp" >/dev/null 2>&1 || true

    if [[ -f "$out" ]] && cmp -s "$tmp" "$out"; then
      rm -f "$tmp"
    else
      mv -f "$tmp" "$out"
    fi
  done
done

echo "Done. Generated sizes: ${SIZES[*]}"
