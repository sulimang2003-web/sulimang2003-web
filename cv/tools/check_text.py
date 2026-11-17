"""Fail if pdftotext extraction of the Arabic CV shows broken lam-alef words."""
import subprocess, sys
pdf = sys.argv[1]
txt = subprocess.run(["pdftotext", pdf, "-"], capture_output=True, text=True, check=True).stdout
bad = ["االصطناعي", "اآللي", "األ", "اإل", "اآل", "والء", "المقاوالت"]
must = ["الذكاء الاصطناعي", "التعلم الآلي", "الأمنية", "الإنجليزية", "الآن", "ولاء"]
fail = [b for b in bad if b in txt]
miss = [m for m in must if m not in txt]
for b in bad:  print(f"  {'FAIL' if b in txt else 'ok  '}  absent:  {b}")
for m in must: print(f"  {'ok  ' if m in txt else 'FAIL'}  present: {m}")
print("RESULT:", "PASS" if not (fail or miss) else "FAIL")
sys.exit(1 if fail or miss else 0)
