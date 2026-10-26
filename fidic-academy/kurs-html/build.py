import re, sys, html, json, pathlib
import markdown

SRC = pathlib.Path(sys.argv[1])
OUT = pathlib.Path(sys.argv[2])
TPL = pathlib.Path(__file__).with_name("template.html").read_text()

# (id, files, group, short label)
MODULES = [
    ("start", ["README.md"], "Start", "Mapa kursu"),
    ("m00", ["00-metoda-i-plan.md"], "Start", "Metoda i plan"),
    ("m01", ["01-fundamenty-branzy.md"], "L1 Foundation", "Fundamenty branży"),
    ("m02", ["02-technika-dla-prawnika.md"], "L1 Foundation", "Technika dla prawnika"),
    ("m03", ["03-dokumentacja-i-planowanie.md"], "L1 Foundation", "Dokumentacja i planowanie"),
    ("m04", ["04-fidic-red-book.md"], "L1 Foundation", "FIDIC Red Book"),
    ("m05", ["05-fidic-yellow-silver-i-inne.md"], "L2 Practitioner", "Yellow, Silver i inne"),
    ("m06", ["06-zmiany-i-roszczenia.md"], "L2 Practitioner", "Zmiany i roszczenia"),
    ("m07", ["07-analiza-opoznien.md"], "L2 Practitioner", "Analiza opóźnień"),
    ("m08", ["08-commercial-i-koszty.md"], "L3 Advanced", "Commercial i koszty"),
    ("m09", ["09-epc-oze-offshore.md"], "L3 Advanced", "EPC, OZE, offshore"),
    ("m10", ["10-prawo-polskie.md"], "L3 Advanced", "Prawo polskie"),
    ("m11", ["11-prawo-niemieckie.md"], "L3 Advanced", "Prawo niemieckie"),
    ("m12", ["12-spory-i-negocjacje.md"], "L4 Expert", "Spory i negocjacje"),
    ("m13", ["13-poziom-ekspercki-i-kariera.md"], "L4 Expert", "Poziom ekspercki i kariera"),
    ("m14", ["14-jezyk-ekspercki-en-de.md"], "Przez cały kurs", "Język ekspercki EN/DE"),
    ("egzaminy", ["egzaminy.md"], "Materiały", "Egzaminy L1–L4"),
    ("slownik", ["slownik-pl-en-de.md"], "Materiały", "Słownik PL–EN–DE"),
    ("szablony", ["szablony/pisma-en.md", "szablony/pisma-de.md", "szablony/pisma-pl.md", "szablony/rejestry.md"], "Materiały", "Szablony pism i rejestry"),
]

LINKMAP = {}
for mid, files, *_ in MODULES:
    for f in files:
        LINKMAP[f] = mid
        LINKMAP[pathlib.Path(f).name] = mid
LINKMAP["szablony/"] = "szablony"


def preprocess(md):
    out, prev, in_code = [], "", False
    for line in md.split("\n"):
        if line.startswith("```"):
            in_code = not in_code
            if in_code and prev.strip():
                out.append("")
            out.append(line); prev = line; continue
        if not in_code:
            m = re.match(r"^((?:  )+)([-*]|\d+\.)\s", line)
            if m:
                line = "    " * (len(m.group(1)) // 2) + line[len(m.group(1)):]
            is_list = re.match(r"^\s*([-*]|\d+\.)\s", line)
            prev_list = re.match(r"^\s*([-*]|\d+\.)\s", prev)
            if is_list and prev.strip() and not prev_list and not prev.startswith("|"):
                out.append("")
            if line.startswith("|") and prev.strip() and not prev.startswith("|"):
                out.append("")
            line = line.replace("<details>", '<details markdown="1">')
        out.append(line); prev = line
    return "\n".join(out)


def fix_links(h):
    def rep(m):
        href = m.group(1)
        if href.startswith("http"):
            return f'href="{href}" target="_blank" rel="noopener"'
        key = href.split("#")[0]
        if key in LINKMAP:
            return f'href="#{LINKMAP[key]}"'
        return m.group(0)
    return re.sub(r'href="([^"]+)"', rep, h)


def convert(md, mid, shift=0):
    md = preprocess(md)
    if shift:
        md = re.sub(r"^(#{1,5}) ", lambda m: "#" * (len(m.group(1)) + shift) + " ", md, flags=re.M)
    h = markdown.markdown(md, extensions=["tables", "fenced_code", "md_in_html", "toc", "sane_lists"])
    h = re.sub(r'id="([^"]+)"', lambda m: f'id="{mid}-{m.group(1)}"', h)
    h = fix_links(h)
    h = re.sub(r"<table>", '<div class="tbl"><table>', h)
    h = h.replace("</table>", "</table></div>")
    return h


def title_block(md, mid, num):
    lines = md.split("\n")
    title = lines[0].lstrip("# ").strip()
    title = re.sub(r"^\d+\s+—\s+", "", title)
    meta = []
    rest = lines[1:]
    for i, l in enumerate(rest[:3]):
        if l.startswith("**Poziom"):
            for part in l.split(" · "):
                m = re.match(r"\*\*(.+?):\*\*\s*(.*)", part.strip())
                if m:
                    meta.append((m.group(1), m.group(2)))
            rest = rest[:i] + rest[i + 1:]
            break
    return title, meta, "\n".join(rest)


sections, nav = [], []
for idx, (mid, files, group, label) in enumerate(MODULES):
    num = mid[1:] if mid.startswith("m") else "—"
    if mid == "start":
        md = (SRC / files[0]).read_text()
        md = "\n".join(md.split("\n")[1:])
        hero = pathlib.Path(__file__).with_name("hero.html").read_text()
        body = hero + convert(md, mid)
        title, meta = "Akademia Kontraktów FIDIC", []
    elif len(files) == 1:
        md = (SRC / files[0]).read_text()
        title, meta, rest = title_block(md, mid, num)
        body = convert(rest, mid)
    else:
        parts = []
        for f in files:
            parts.append(convert((SRC / f).read_text(), mid, shift=1))
        body = "\n".join(parts)
        title, meta = "Szablony pism i rejestry", [("Języki", "EN · DE · PL"), ("Zastosowanie", "moduły 04–12")]
    lessons = re.findall(r'<h2 id="([^"]+)">(.*?)</h2>', body)
    nav.append({"id": mid, "group": group, "label": label, "num": num,
                "lessons": [{"id": i, "t": re.sub(r"<.*?>", "", t)} for i, t in lessons]})
    meta_html = "".join(f"<div><dt>{html.escape(k)}</dt><dd>{html.escape(v)}</dd></div>" for k, v in meta)
    tb = "" if mid == "start" else f'''<header class="titleblock">
  <div class="tb-num"><span>Moduł</span><b>{num}</b></div>
  <div class="tb-main"><p class="tb-group">{html.escape(group)}</p><h1>{html.escape(title)}</h1></div>
  <dl class="tb-meta">{meta_html}</dl>
</header>'''
    sections.append(f'<section class="module" id="{mid}" data-title="{html.escape(title)}" hidden>{tb}<div class="prose">{body}</div><nav class="pager" aria-label="Nawigacja modułów"></nav></section>')

out = TPL.replace("{{SECTIONS}}", "\n".join(sections)).replace("{{NAV}}", json.dumps(nav, ensure_ascii=False))
OUT.write_text(out)
print(len(out), "bytes")
