"""Rewrite every GSUB ligature in an Arabic font as a 1:1 substitution chain.

Why: Chrome/Skia write a ligature glyph (e.g. lam-alef "لا") into the PDF as
ONE glyph mapped to TWO characters. pdftotext (poppler) reverses those
characters when it reorders right-to-left text, so "الاصطناعي" is extracted as
"االصطناعي" and "الآلي" as "اآللي".

Fix: instead of N glyphs -> 1 ligature glyph, the font now does
  first component  -> the ligature drawing (full advance)
  other components -> an empty zero-width glyph
so the page looks identical, but every glyph in the PDF maps to exactly one
character and text extraction stays in logical order.

usage: python3 delig.py in.(woff2|ttf) out.woff2
"""
import sys
from fontTools.ttLib import TTFont, newTable
from fontTools.ttLib.tables import otTables as ot
from fontTools.ttLib.tables._g_l_y_f import Glyph


def single_lookup(mapping):
    lk = ot.Lookup()
    lk.LookupType = 1
    lk.LookupFlag = 0
    st = ot.SingleSubst()
    st.mapping = dict(mapping)
    lk.SubTable = [st]
    lk.SubTableCount = 1
    return lk


def coverage(glyphs):
    c = ot.Coverage()
    c.glyphs = list(glyphs)
    return c


def main(src, dst):
    font = TTFont(src)
    gsub = font["GSUB"].table
    lookups = gsub.LookupList.Lookup
    order = font.getGlyphOrder()
    hmtx = font["hmtx"]
    glyf = font["glyf"]
    gdef = font["GDEF"].table if "GDEF" in font else None

    zero = {}  # component glyph -> empty zero-width glyph

    def zero_for(g):
        if g not in zero:
            name = f"{g}.lz"
            glyf.glyphs[name] = Glyph()
            hmtx.metrics[name] = (0, 0)
            order.append(name)
            zero[g] = name
        return zero[g]

    new_lookups = []
    converted = 0
    for lk in list(lookups):
        subs = lk.SubTable
        ext = lk.LookupType == 7
        types = {s.ExtSubTable.LookupType if ext else lk.LookupType for s in subs}
        if types != {4}:
            continue
        ligs = []
        for s in subs:
            s = s.ExtSubTable if ext else s
            for first, lst in s.ligatures.items():
                for lig in lst:
                    ligs.append((first, lig.Component, lig.LigGlyph))
        # longer sequences first, as the ligature lookup would match them first
        ligs.sort(key=lambda t: -len(t[1]))
        chain_subs = []
        for first, comps, lig in ligs:
            idx_first = len(lookups) + len(new_lookups)
            new_lookups.append(single_lookup({first: lig}))
            idx_rest = len(lookups) + len(new_lookups)
            new_lookups.append(single_lookup({c: zero_for(c) for c in comps}))
            cs = ot.ChainContextSubst()
            cs.Format = 3
            cs.BacktrackGlyphCount = 0
            cs.BacktrackCoverage = []
            cs.LookAheadGlyphCount = 0
            cs.LookAheadCoverage = []
            seq = [first] + list(comps)
            cs.InputGlyphCount = len(seq)
            cs.InputCoverage = [coverage([g]) for g in seq]
            recs = []
            for i in range(len(seq)):
                r = ot.SubstLookupRecord()
                r.SequenceIndex = i
                r.LookupListIndex = idx_first if i == 0 else idx_rest
                recs.append(r)
            cs.SubstLookupRecord = recs
            cs.SubstCount = len(recs)
            chain_subs.append(cs)
            converted += 1
            if gdef and gdef.GlyphClassDef and gdef.GlyphClassDef.classDefs.get(lig) == 2:
                gdef.GlyphClassDef.classDefs[lig] = 1
        lk.LookupType = 6
        lk.SubTable = chain_subs
        lk.SubTableCount = len(chain_subs)

    for nl in new_lookups:
        lookups.append(nl)
    gsub.LookupList.LookupCount = len(lookups)
    if gdef and gdef.GlyphClassDef:
        for z in zero.values():
            gdef.GlyphClassDef.classDefs[z] = 1
    font.setGlyphOrder(order)
    font["maxp"].numGlyphs = len(order)
    # OFL: a modified font must not use the Reserved Font Name ("Plex").
    for rec in font["name"].names:
        if rec.nameID in (1, 3, 4, 6, 16, 17, 18, 21):
            t = rec.toUnicode()
            t = t.replace("IBM Plex Sans Arabic", "CV Sans Arabic").replace("IBMPlexSansArabic", "CVSansArabic")
            rec.string = t
    font.flavor = "woff2"
    font.save(dst)
    print(f"{src}: {converted} ligatures rewritten, {len(zero)} zero glyphs")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
