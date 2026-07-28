#!/usr/bin/env bash
#
# Генерация WebP-превью для фотогалереи Гонки Героев.
# Создаёт папку thumb/ рядом с оригиналами.
#
# Требования: cwebp (из пакета libwebp) или ImageMagick (convert/magick).
#
# Использование:
#   ./scripts/generate-thumbs.sh /path/to/pictures/mend
#
# Структура на входе:
#   /path/to/pictures/mend/2025/photo1.webp … photo48.webp
#   /path/to/pictures/mend/2024/photo1.webp … photo56.webp
#   /path/to/pictures/mend/2023/photo1.webp … photo24.webp
#
# Структура на выходе:
#   /path/to/pictures/mend/2025/thumb/photo1.webp … (≈80px по ширине, ~2-5 КБ)

set -euo pipefail

THUMB_WIDTH=80
THUMB_QUALITY=30
YEARS=(2025 2024 2023 2022)

BASE_DIR="${1:?Укажите путь к корневой директории фото, например: /var/www/heroleague.ru/pictures/mend}"

has_cmd() { command -v "$1" &>/dev/null; }

if has_cmd cwebp; then
  TOOL="cwebp"
elif has_cmd magick; then
  TOOL="magick"
elif has_cmd convert; then
  TOOL="convert"
else
  echo "Ошибка: не найден ни cwebp, ни ImageMagick (magick/convert)."
  echo "Установите один из инструментов:"
  echo "  macOS:  brew install webp        или  brew install imagemagick"
  echo "  Ubuntu: apt install webp         или  apt install imagemagick"
  exit 1
fi

echo "Используется: $TOOL"
echo "Ширина превью: ${THUMB_WIDTH}px, качество: ${THUMB_QUALITY}"
echo ""

total=0
skipped=0

for year in "${YEARS[@]}"; do
  src_dir="$BASE_DIR/$year"
  thumb_dir="$src_dir/thumb"

  if [ ! -d "$src_dir" ]; then
    echo "⚠ Папка $src_dir не найдена, пропускаю"
    continue
  fi

  mkdir -p "$thumb_dir"

  for src in "$src_dir"/photo*.webp; do
    [ -f "$src" ] || continue

    filename="$(basename "$src")"
    dest="$thumb_dir/$filename"

    if [ -f "$dest" ] && [ "$dest" -nt "$src" ]; then
      skipped=$((skipped + 1))
      continue
    fi

    case "$TOOL" in
      cwebp)
        cwebp -resize "$THUMB_WIDTH" 0 -q "$THUMB_QUALITY" -quiet "$src" -o "$dest"
        ;;
      magick)
        magick "$src" -resize "${THUMB_WIDTH}x" -quality "$THUMB_QUALITY" "$dest"
        ;;
      convert)
        convert "$src" -resize "${THUMB_WIDTH}x" -quality "$THUMB_QUALITY" "$dest"
        ;;
    esac

    total=$((total + 1))
  done

  count=$(find "$thumb_dir" -name 'photo*.webp' | wc -l | tr -d ' ')
  echo "✓ $year: $count превью в $thumb_dir"
done

echo ""
echo "Готово. Создано: $total, пропущено (актуальны): $skipped"
