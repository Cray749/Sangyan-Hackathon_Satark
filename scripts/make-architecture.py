"""Draws docs/architecture.svg, the picture of how Satark is built.

Run: python scripts/make-architecture.py
Then (optional) make a PNG with a browser; see docs/ARCHITECTURE.md.
"""
from xml.sax.saxutils import escape

INK = "#1b1915"
SOFT = "#4d483d"
PAPER = "#f3ead8"
PAPER2 = "#ebe0c8"
RED = "#c4301c"
TEAL = "#26695a"
BLUE = "#2b4472"
AMBER = "#b9740a"
SERIF = "Georgia, 'Noto Serif Devanagari', 'Nirmala UI', serif"
SANS = "'Segoe UI', 'Noto Sans Devanagari', 'Nirmala UI', Arial, sans-serif"

out = []


def add(s):
    out.append(s)


def text(x, y, s, size=15, weight=400, fill=INK, anchor="start", family=SANS, spacing=0):
    add(
        f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{fill}" '
        f'text-anchor="{anchor}" font-family="{family}" letter-spacing="{spacing}">{escape(s)}</text>'
    )


def box(x, y, w, h, title, lines=(), num=None, fill=PAPER, stroke=INK, dash=None, shadow=True):
    if shadow:
        add(f'<rect x="{x + 5}" y="{y + 5}" width="{w}" height="{h}" rx="4" fill="{INK}"/>')
    d = f' stroke-dasharray="{dash}"' if dash else ""
    add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="4" fill="{fill}" stroke="{stroke}" stroke-width="2.5"{d}/>')
    tx = x + 14
    if num is not None:
        add(f'<circle cx="{x + 24}" cy="{y + 26}" r="14" fill="{INK}"/>')
        text(x + 24, y + 32, str(num), 16, 800, PAPER, "middle", SERIF)
        tx = x + 46
    text(tx, y + 32, title, 17, 800, INK, "start", SERIF)
    for i, line in enumerate(lines):
        text(x + 14, y + 58 + i * 20, line, 13.5, 400, SOFT)


def cylinder(x, y, w, h, title, lines=(), fill=PAPER):
    add(f'<rect x="{x + 5}" y="{y + 5}" width="{w}" height="{h}" rx="14" fill="{INK}"/>')
    add(f'<path d="M{x},{y + 16} v{h - 32} a{w / 2},16 0 0 0 {w},0 v-{h - 32}" fill="{fill}" stroke="{INK}" stroke-width="2.5"/>')
    add(f'<ellipse cx="{x + w / 2}" cy="{y + 16}" rx="{w / 2}" ry="16" fill="{PAPER2}" stroke="{INK}" stroke-width="2.5"/>')
    text(x + w / 2, y + 52, title, 16, 800, INK, "middle", SERIF)
    for i, line in enumerate(lines):
        text(x + w / 2, y + 74 + i * 19, line, 13, 400, SOFT, "middle")


def arrow(d, color=INK, dash=None, width=2.8):
    dd = f' stroke-dasharray="{dash}"' if dash else ""
    add(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}"{dd} marker-end="url(#head-{color[1:]})"/>')


W, H = 1600, 1040
add(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="How Satark is built">')
add("<defs>")
for c in (INK, RED, TEAL, BLUE, AMBER):
    add(f'<marker id="head-{c[1:]}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{c}"/></marker>')
add("</defs>")
add(f'<rect width="{W}" height="{H}" fill="{PAPER}"/>')

# ---- title ----
add(f'<circle cx="62" cy="58" r="26" fill="{RED}" stroke="{INK}" stroke-width="3"/>')
add(f'<rect x="51" y="45" width="8" height="26" rx="2" fill="{PAPER}"/><rect x="65" y="45" width="8" height="26" rx="2" fill="{PAPER}"/>')
text(104, 56, "Satark: how it is built", 36, 900, INK, "start", SERIF)
text(104, 86, "Rules decide. AI only reads. The case stays on the phone.", 18, 600, RED)
text(W - 40, 56, "solid line = always   ·   dashed = optional", 14, 600, SOFT, "end")
text(W - 40, 80, "ARCHITECTURE · SANGYAN TRACK A", 12, 700, SOFT, "end", SANS, 2)

# ---- zones ----
add(f'<rect x="40" y="130" width="1090" height="780" rx="8" fill="none" stroke="{INK}" stroke-width="2.5" stroke-dasharray="10 7"/>')
text(60, 122, "ON THE PERSON'S PHONE   (the whole check works with no signal)", 14, 800, INK, "start", SANS, 1.5)
add(f'<rect x="1160" y="130" width="400" height="780" rx="8" fill="{PAPER2}" stroke="{INK}" stroke-width="2.5" stroke-dasharray="10 7"/>')
text(1180, 122, "OUR SERVER   (only the optional parts)", 14, 800, INK, "start", SANS, 1.5)

# ---- row 1 ----
box(70, 180, 200, 110, "Input", ["type · speak · screenshot", "Hindi · Marathi · English"], shadow=True)
box(310, 180, 220, 110, "Redact", ["hide phone, PAN, account,", "email and OTP digits"], 1)
box(570, 180, 230, 110, "Read", ["word lists in Hindi, Marathi,", "Hinglish, English + links,", "UPI ids, reg. numbers"], 2)
box(840, 180, 220, 110, "Context guard", ["a warning post is not", "an offer (unless a live ask)"], 3)
arrow("M270,235 H306")
arrow("M530,235 H566")
arrow("M800,235 H836")

# wrap to row 2
arrow(f"M950,290 V322 H180 V356")

# ---- row 2 ----
box(70, 360, 220, 110, "Rule book", ["R01 to R18, each with", "a link to the SEBI or", "exchange page behind it"], 4, fill="#fbf5e6")
box(320, 360, 220, 110, "Journey", ["stage 1 to 8,", "moves forward only", "SEBI's 7 + recovery scam"], 5)
box(570, 360, 220, 110, "Verdict gate", ["STOP · HIGH RISK ·", "CANNOT VERIFY ·", "NO RED FLAGS. Never safe"], 6, fill="#fbf5e6")
box(820, 360, 240, 110, "Planner", ["the one thing to do now,", "Emergency Mode, and the", "right place to complain"], 7)
arrow("M290,415 H316")
arrow("M540,415 H566")
arrow("M790,415 H816")

# ---- row 3 ----
cylinder(325, 540, 210, 110, "Case file", ["IndexedDB on the", "phone. Never uploaded"])
arrow(f"M430,470 V536", dash="6 5")
box(820, 540, 240, 110, "Output guard", ["no tips, no predictions,", "no broker names, no", "'safe' claims"], 8)
arrow("M940,470 V536")
box(570, 540, 220, 110, "Checked words", ["fixed templates in", "हिंदी · मराठी · English", "AI never writes these"], 9)
arrow("M816,595 H794")

# ---- row 4 ----
box(570, 700, 490, 110, "What the person sees", ["STOP stamp · scam thread · Why panel with sources", "Pre-Pay Check + QR scan · Emergency Mode (1930)", "one-tap alert to a family member"], fill="#fbf5e6")
arrow("M680,650 V696")
box(70, 700, 240, 110, "Voice", ["speak the message in,", "hear the answer out", "(browser's own speech)"])
arrow("M566,755 H314")

# ---- promises ----
for i, (label, color) in enumerate(
    [
        ("Verdict never imports the AI (tested)", RED),
        ("No answer is ever a green light (tested)", RED),
        ("Private numbers hidden first", TEAL),
    ]
):
    x = 70 + i * 322
    add(f'<rect x="{x}" y="846" width="305" height="42" rx="21" fill="none" stroke="{color}" stroke-width="2.5"/>')
    text(x + 152, 873, label, 12.5, 800, color, "middle")

# ---- server boxes ----
box(1190, 180, 340, 105, "AI reader (optional)", ["Gemini, structured output.", "Only sees redacted text.", "Can only QUOTE your words."], fill=PAPER)
box(1190, 330, 340, 95, "Span check", ["every quote must be in the", "message, or it is thrown away"], fill=PAPER)
box(1190, 470, 340, 95, "Screenshot reader (optional)", ["image read once, never stored;", "the person fixes the words first"], fill=PAPER)
cylinder(1215, 620, 290, 125, "Scam Radar (SQLite)", ["counts only: day, scam type,", "language, stage, level", "groups under 5 are hidden"])

# links between phone and server
arrow(f"M420,180 V160 H1360 V176", color=BLUE, dash="8 6")
text(900, 174, "redacted text, only if the person switched AI on", 12.5, 700, BLUE, "middle")
arrow(f"M1190,378 H1100 V235 H1064", color=BLUE, dash="8 6")
text(1092, 318, "valid", 12.5, 700, BLUE, "end")
text(1092, 334, "facts", 12.5, 700, BLUE, "end")
add(f'<path d="M1360,285 V326" fill="none" stroke="{BLUE}" stroke-width="2.8" stroke-dasharray="8 6" marker-end="url(#head-{BLUE[1:]})"/>')
arrow(f"M140,180 V146 H1545 V517 H1534", color=AMBER, dash="8 6")
text(300, 140, "screenshot, only if AI is on", 12.5, 700, AMBER, "start")
arrow(f"M1060,430 H1130 V682 H1211", color=TEAL, dash="8 6")
text(1116, 560, "opt-in:", 12.5, 700, TEAL, "end")
text(1116, 576, "4 small", 12.5, 700, TEAL, "end")
text(1116, 592, "facts,", 12.5, 700, TEAL, "end")
text(1116, 608, "no text", 12.5, 700, TEAL, "end")

# ---- official places ----
add(f'<rect x="40" y="940" width="1520" height="64" rx="6" fill="{INK}"/>')
text(64, 968, "ONLY OFFICIAL PLACES WE SEND PEOPLE", 12.5, 800, PAPER, "start", SANS, 1.5)
places = ["SEBI Check", "SEBI registered list", "SCORES (registered firms only)", "1930 helpline", "cybercrime.gov.in", "mi.sebi.gov.in"]
x = 64
for p in places:
    w = 12 * len(p) * 0.62 + 36
    add(f'<rect x="{x}" y="976" width="{w:.0f}" height="20" rx="10" fill="{PAPER}"/>')
    text(x + w / 2, 991, p, 12.5, 700, INK, "middle")
    x += w + 14
arrow("M1040,810 V934", color=INK)

add("</svg>")
open("docs/architecture.svg", "w", encoding="utf-8").write("\n".join(out))
print("docs/architecture.svg written")
