# CV — Sulaiman Jamous

| File | What |
|---|---|
| `Sulaiman_Jamous_CV_AR.html` | Source of the Arabic CV (two columns, navy sidebar, gold accents) |
| `Sulaiman_Jamous_CV_EN.html` | Source of the English CV (single column, ATS-friendly) |
| `Sulaiman_Jamous_CV_EN_Design.html` | English CV in the same two-column design as the Arabic one |
| `Sulaiman_Jamous_CV_AR.pdf`, `Sulaiman_Jamous_CV_EN.pdf` | Generated PDFs |
| `original_Sulaiman_Jamous_CV_AR.pdf` | The previous version, for reference |
| `images/` | 300 dpi PNG of each CV (A4, 2479×3508 px) |
| `checks/` | `pdftotext` output of both PDFs and the Arabic extraction check |
| `fonts/` | Embedded fonts (IBM Plex Sans Arabic, SIL OFL — see `fonts/OFL.txt`) |
| `tools/` | Build script, font patcher, extraction check |

## Build

```bash
./tools/build.sh   # renders both PDFs with headless Chrome and runs the Arabic text check
```

## Why the Arabic font is patched

Chrome writes an Arabic ligature such as لا / لأ / لآ / لإ into the PDF as one
glyph that stands for two characters, and `pdftotext` (poppler) reverses those
two characters when it reorders right-to-left text. So "الاصطناعي" was being
extracted as "االصطناعي" and "الآلي" as "اآللي". Every Arabic font I tested had
this problem with Chrome and WeasyPrint, except Amiri and Noto, and the Noto
fonts add stray spaces inside words.

`tools/delig.py` rewrites each ligature in IBM Plex Sans Arabic as a
one-glyph-per-character substitution: the first letter is drawn with the
ligature shape and the rest become empty zero-width glyphs. The page looks
identical, and the extracted text is correct. As the OFL requires for a
modified font, the patched files are renamed "CV Sans Arabic". Kerning is
turned off on the Arabic page because it made `pdftotext` add stray spaces
inside some bold words.
