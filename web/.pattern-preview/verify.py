#!/usr/bin/env python3
"""Crop a candidate fundamental cell from PatternMatte.svg and tile it into a
grid so we can eyeball whether it tiles seamlessly."""
import subprocess, sys, os, re, base64

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "public", "patterns", "PatternMatte.svg")

def make_candidate(ox, oy, w, h, out):
    with open(SRC) as f:
        svg = f.read()
    # Replace the viewBox with the crop region and drop preserveAspectRatio.
    svg = re.sub(r'viewBox="[^"]*"', f'viewBox="{ox} {oy} {w} {h}"', svg, count=1)
    svg = svg.replace(' preserveAspectRatio="none"', '')
    with open(out, "w") as f:
        f.write(svg)

def render(svg, png, w, h):
    subprocess.run(["rsvg-convert", "-w", str(int(w)), "-h", str(int(h)),
                    "-b", "#ffffff", svg, "-o", png], check=True)

def tile(cell_png, w, h, nx, ny, out, scale):
    cw, ch = w * scale, h * scale
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" '
             f'xmlns:xlink="http://www.w3.org/1999/xlink" '
             f'width="{cw*nx}" height="{ch*ny}" '
             f'viewBox="0 0 {cw*nx} {ch*ny}">']
    with open(cell_png, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()
    href = f"data:image/png;base64,{b64}"
    for j in range(ny):
        for i in range(nx):
            parts.append(f'<image x="{i*cw}" y="{j*ch}" width="{cw}" '
                         f'height="{ch}" xlink:href="{href}"/>')
    # red seam lines
    for i in range(nx+1):
        parts.append(f'<line x1="{i*cw}" y1="0" x2="{i*cw}" y2="{ch*ny}" '
                     f'stroke="red" stroke-width="1" opacity="0.5"/>')
    for j in range(ny+1):
        parts.append(f'<line x1="0" y1="{j*ch}" x2="{cw*nx}" y2="{j*ch}" '
                     f'stroke="red" stroke-width="1" opacity="0.5"/>')
    parts.append("</svg>")
    with open(out+".svg", "w") as f:
        f.write("\n".join(parts))
    render(out+".svg", out, cw*nx, ch*ny)

if __name__ == "__main__":
    ox, oy, w, h = (float(x) for x in sys.argv[1:5])
    tag = sys.argv[5] if len(sys.argv) > 5 else "cand"
    scale = 1.5
    cand = os.path.join(HERE, f"{tag}_cell.svg")
    cellpng = os.path.join(HERE, f"{tag}_cell.png")
    gridpng = os.path.join(HERE, f"{tag}_grid.png")
    make_candidate(ox, oy, w, h, cand)
    render(cand, cellpng, w*scale, h*scale)
    tile(cellpng, w, h, 4, 4, gridpng, scale)
    print("wrote", gridpng)
