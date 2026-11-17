#!/usr/bin/env bash
# Render the HTML sources to PDF with headless Chrome and check text extraction.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p images
for n in AR EN EN_Design; do
  google-chrome --headless --no-sandbox --disable-gpu --no-pdf-header-footer \
    --print-to-pdf="Sulaiman_Jamous_CV_$n.pdf" "file://$PWD/Sulaiman_Jamous_CV_$n.html" 2>/dev/null
  pdftoppm -r 300 -png -singlefile "Sulaiman_Jamous_CV_$n.pdf" "images/Sulaiman_Jamous_CV_$n"
  echo "$n: $(pdfinfo Sulaiman_Jamous_CV_$n.pdf | grep Pages)"
done
python3 tools/check_text.py Sulaiman_Jamous_CV_AR.pdf
