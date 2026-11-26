"""
Genera docs/brand/jimy-manual-de-marca.pdf a partir de docs/brand/README.md.

Requisitos: Python 3 con `markdown` (pip install markdown pypdf), Google Chrome o Chromium,
y `npm install` hecho (usa las fuentes de @fontsource).
Uso:  python scripts/build-brand-pdf.py   (CHROME=ruta/al/chrome para otro binario)
"""
import markdown, re, base64, pathlib, os, subprocess, tempfile, shutil
REPO = pathlib.Path(__file__).resolve().parents[1]
FS = REPO / 'node_modules/@fontsource'
md = (REPO / 'docs/brand/README.md').read_text(encoding='utf-8')

def font_face(fam, path, w):
    b = base64.b64encode(path.read_bytes()).decode()
    return f"@font-face{{font-family:'{fam}';src:url(data:font/woff2;base64,{b}) format('woff2');font-weight:{w};font-style:normal}}"
faces = ''.join([font_face('Rubik', FS / f'rubik/files/rubik-latin-{w}-normal.woff2', w) for w in (700, 800)] +
                [font_face('Plus Jakarta Sans', FS / f'plus-jakarta-sans/files/plus-jakarta-sans-latin-{w}-normal.woff2', w) for w in (400, 600, 700, 800)])

svg = lambda p: (REPO / p).read_text(encoding='utf-8')
logo_dark = svg('docs/brand/logo/jimy-logo-sobre-oscuro.svg')
logo_light = svg('docs/brand/logo/jimy-logo-sobre-claro.svg')
logo_mw = svg('docs/brand/logo/jimy-logo-mono-blanco.svg')
logo_mt = svg('docs/brand/logo/jimy-logo-mono-tinta.svg')
icon = svg('docs/brand/icono/jimy-icono.svg')

# quitar título y nota de versionado del md (van en la portada / colofón)
md = re.sub(r'^# .*\n', '', md, count=1)
md = re.sub(r'^Tu compañero de gym\..*\n', '', md, count=1, flags=re.M)
md = re.sub(r'^> \*\*Fuente de verdad versionada\.\*\*.*\n', '', md, count=1, flags=re.M)
# links relativos → texto plano (en PDF no navegan)
md = re.sub(r'\[(`[^`]+`)\]\([^)]+\)', r'\1', md)
md = re.sub(r'\[([^\]]+)\]\((?!https?:)[^)]+\)', r'\1', md)

html_body = markdown.markdown(md, extensions=['tables'])

# bloques visuales insertados después de ciertos títulos
logo_block = f'''<div class="logos">
<figure class="tile dark">{logo_dark}<figcaption>Sobre oscuro · principal</figcaption></figure>
<figure class="tile light">{logo_light}<figcaption>Sobre claro</figcaption></figure>
<figure class="tile teal">{logo_mw}<figcaption>Mono blanco</figcaption></figure>
<figure class="tile light">{logo_mt}<figcaption>Mono tinta</figcaption></figure>
</div>'''
icon_block = f'''<div class="icons">
<div class="icon" style="width:128px">{icon}</div><div class="icon" style="width:64px">{icon}</div>
<div class="icon" style="width:44px">{icon}</div><div class="icon" style="width:28px">{icon}</div>
<span class="muted">168 · 64 · 44 · 28 px (mínimo legible: 28 px)</span></div>'''
color_block = '''<div class="swatches">
<div class="sw" style="background:#0E1020;color:#fff;flex:7"><b>Primario · Tinta</b><span>#0E1020</span><span>~70 %</span></div>
<div class="sw" style="background:#08434A;color:#fff;flex:2"><b>Secundario · Teal 900</b><span>#08434A</span><span>~20 %</span></div>
<div class="sw" style="background:#D4FF2E;color:#0E1020;flex:1.2"><b>Acento · Volt</b><span>#D4FF2E</span><span>~10 %</span></div>
</div>
<div class="support"><span><i style="background:#171A2E"></i>surface-raised #171A2E</span><span><i style="background:#2E8A93"></i>border-secondary #2E8A93</span><span><i style="background:#5FC4CC"></i>link #5FC4CC</span><span><i style="background:#A9AEC2"></i>text-muted #A9AEC2</span><span><i style="background:#F87171"></i>danger #F87171</span></div>'''
type_block = '''<div class="specimen">
<div class="spec-row"><span class="spec-label">Rubik 800 · display 40/44</span><span style="font:800 40px/44px Rubik">Rutina completa</span></div>
<div class="spec-row"><span class="spec-label">Rubik 800 · title 28/34</span><span style="font:800 28px/34px Rubik">Hoy · Día B</span></div>
<div class="spec-row"><span class="spec-label">Rubik 700 · heading 20/26</span><span style="font:700 20px/26px Rubik">Press de banco plano</span></div>
<div class="spec-row"><span class="spec-label">Jakarta 400 · body 16/24</span><span style="font:400 16px/24px 'Plus Jakarta Sans'">La semana pasada hiciste 40 kg × 8.</span></div>
<div class="spec-row"><span class="spec-label">Jakarta 600 · label 14/20</span><span style="font:600 14px/20px 'Plus Jakarta Sans'">3×6-8×30-60 kg</span></div>
<div class="spec-row"><span class="spec-label">Jakarta 800 · number 28/32</span><span style="font:800 28px/32px 'Plus Jakarta Sans';font-variant-numeric:tabular-nums">42,5 kg</span></div>
</div>'''
def after(h, block):
    global html_body
    tag = f'<h3>{h}</h3>' if h in ('Concepto',) else f'<h2>{h}</h2>'
    assert tag in html_body, h
    html_body = html_body.replace(tag, tag + block, 1)
after('Concepto', logo_block)
after('Ícono de app', icon_block)
after('Color', color_block)
after('Tipografía', type_block)
# cada h2 empieza página
BREAK = {'Logo', 'Ícono de app', 'Color', 'Tipografía', 'Voz y tono', 'Iconografía'}
def h2(m):
    t = m.group(1)
    return f'<h2 class="section{" brk" if t in BREAK else ""}">{t}</h2>'
html_body = re.sub(r'<h2>(.*?)</h2>', h2, html_body)

css = faces + '''
@page { size: A4; margin: 18mm 16mm 18mm 16mm; }
@page :first { margin: 0; }
* { -webkit-print-color-adjust: exact; print-color-adjust: exact; box-sizing: border-box; }
html { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 10.5pt; line-height: 1.5; color: #0E1020; }
body { margin: 0; }
.cover { height: 297mm; background: #0E1020; color: #fff; padding: 28mm 22mm; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; position: relative; overflow: hidden; }
.cover .logo svg { width: 120mm; height: auto; display: block; }
.cover h1 { font: 800 30pt/1.1 Rubik; margin: 0 0 4mm; }
.cover p { margin: 0; font-size: 13pt; color: #A9AEC2; }
.cover .meta { font-size: 9.5pt; color: #A9AEC2; }
.cover .bands { position: absolute; right: -10mm; top: 95mm; width: 92mm; }
.cover .bands div { border-radius: 6mm; margin-bottom: 5mm; }
h2.section { font: 800 22pt/1.15 Rubik; margin: 9mm 0 5mm; padding-bottom: 3mm; border-bottom: 2.5pt solid #08434A; break-after: avoid; }
h2.brk { break-before: page; margin-top: 0; padding-top: 3mm; }
main > p:first-child { font-size: 12pt; color: #4A4D63; margin: 0 0 4mm; }
h3 { font: 700 13pt/1.3 Rubik; margin: 7mm 0 2.5mm; color: #08434A; break-after: avoid; }
p:has(+ table), h3 + p { break-after: avoid; }
p, li { orphans: 3; widows: 3; }
ul, ol { padding-left: 5mm; }
li { margin: 1mm 0; }
code { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700; background: #EEF1F4; padding: 0 1.2mm; border-radius: 1.2mm; font-size: 0.95em; }
table { width: 100%; border-collapse: collapse; margin: 3mm 0 5mm; font-size: 9.5pt; break-inside: avoid; }
th { text-align: left; font-weight: 800; background: #0E1020; color: #fff; padding: 2mm 2.5mm; }
td { padding: 2mm 2.5mm; border-bottom: 0.6pt solid #D9DBE5; vertical-align: top; }
tr:nth-child(even) td { background: #F4F5F8; }
.logos { display: grid; grid-template-columns: 1fr 1fr; gap: 4mm; margin: 4mm 0 6mm; page-break-inside: avoid; }
.tile { margin: 0; border-radius: 4mm; padding: 9mm 8mm 5mm; display: flex; flex-direction: column; align-items: center; gap: 4mm; }
.tile svg { width: 62mm; height: auto; }
.tile figcaption { font-size: 8.5pt; font-weight: 600; }
.tile.dark { background: #0E1020; color: #A9AEC2; }
.tile.teal { background: #08434A; color: #fff; }
.tile.light { background: #fff; border: 0.8pt solid #D9DBE5; color: #4A4D63; }
.icons { display: flex; align-items: flex-end; gap: 6mm; margin: 4mm 0 6mm; }
.icons svg { width: 100%; height: auto; display: block; }
.muted { color: #4A4D63; font-size: 9pt; }
.swatches { display: flex; gap: 3mm; height: 42mm; margin: 4mm 0 3mm; }
.sw { border-radius: 4mm; padding: 4mm; display: flex; flex-direction: column; justify-content: flex-end; font-size: 9pt; border: 0.8pt solid #D9DBE5; }
.sw b { font-size: 10pt; }
.support { display: flex; flex-wrap: wrap; gap: 2mm 6mm; font-size: 8.5pt; color: #4A4D63; margin-bottom: 5mm; }
.support i { display: inline-block; width: 4mm; height: 4mm; border-radius: 1mm; vertical-align: -0.8mm; margin-right: 1.5mm; }
.specimen { border: 0.8pt solid #D9DBE5; border-radius: 4mm; padding: 2mm 5mm; margin: 4mm 0 6mm; page-break-inside: avoid; }
.spec-row { display: flex; align-items: baseline; gap: 6mm; padding: 2.5mm 0; border-bottom: 0.6pt solid #EEF1F4; }
.spec-row:last-child { border-bottom: 0; }
.spec-label { width: 46mm; flex-shrink: 0; font-size: 8pt; font-weight: 600; color: #4A4D63; }
.colophon { margin-top: 10mm; font-size: 8.5pt; color: #4A4D63; border-top: 0.6pt solid #D9DBE5; padding-top: 3mm; }
'''
cover = f'''<section class="cover">
<div class="logo">{logo_dark}</div>
<div class="bands"><div style="height:56mm;background:#08434A"></div><div style="height:22mm;width:60mm;background:#D4FF2E"></div><div style="height:14mm;width:40mm;background:#2E8A93"></div></div>
<div><h1>Manual de marca</h1><p>Tu compañero de gym. Se acuerda de lo que levantaste.</p></div>
<div class="meta">CuervoDev · Versión 1 · noviembre 2026<br>Fuente de verdad: docs/brand en el repo de Jimy</div>
</section>'''
colophon = '<p class="colophon">Generado desde docs/brand/README.md. Ante cualquier diferencia, manda el archivo del repo. Tipografías Rubik y Plus Jakarta Sans, licencia SIL Open Font License 1.1.</p>'
html = f'<!doctype html><html lang="es-AR"><head><meta charset="utf-8"><title>Jimy — Manual de marca</title><style>{css}</style></head><body>{cover}<main>{html_body}{colophon}</main></body></html>'
tmp = pathlib.Path(tempfile.mkdtemp())
(tmp / 'manual.html').write_text(html, encoding='utf-8')
raw = tmp / 'raw.pdf'
chrome = os.environ.get('CHROME') or shutil.which('google-chrome') or shutil.which('chromium') or shutil.which('chrome')
if not chrome:
    raise SystemExit('No encontré Chrome/Chromium: definí la variable CHROME.')
subprocess.run([chrome, '--headless=new', '--no-sandbox', '--disable-gpu', '--no-pdf-header-footer',
                '--virtual-time-budget=5000', f'--print-to-pdf={raw}', (tmp / 'manual.html').as_uri()],
               check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
from pypdf import PdfReader, PdfWriter
reader, writer = PdfReader(raw), PdfWriter()
for page in reader.pages:
    writer.add_page(page)
writer.add_metadata({'/Title': 'Jimy — Manual de marca', '/Author': 'Andrés Miretti · CuervoDev',
                     '/Subject': 'Identidad de marca de Jimy: logo, color, tipografía, voz'})
out = REPO / 'docs/brand/jimy-manual-de-marca.pdf'
with open(out, 'wb') as f:
    writer.write(f)
print(f'{out.relative_to(REPO)}: {len(reader.pages)} páginas')
