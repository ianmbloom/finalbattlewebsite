#!/usr/bin/env python3
"""Render the (already single-cell) PatternMatte.svg and tile it at a given
on-screen periodX/periodY to eyeball tiling + the vertical-period knob."""
import subprocess, os, base64

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "public", "patterns", "PatternMatte.svg")

def render(svg, png, w, h):
    subprocess.run(["rsvg-convert", "-w", str(int(w)), "-h", str(int(h)),
                    "-b", "#ffffff", svg, "-o", png], check=True)

def tile(px, py, nx, ny, out):
    cellpng = out + "_cell.png"
    render(SRC, cellpng, px, py)  # stretches cell to px x py (preserveAspectRatio=none)
    with open(cellpng, "rb") as f:
        href = "data:image/png;base64," + base64.b64encode(f.read()).decode()
    W, H = px * nx, py * ny
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" '
             f'xmlns:xlink="http://www.w3.org/1999/xlink" '
             f'width="{W}" height="{H}" viewBox="0 0 {W} {H}">',
             '<rect width="100%" height="100%" fill="white"/>']
    for j in range(ny):
        for i in range(nx):
            parts.append(f'<image x="{i*px}" y="{j*py}" width="{px}" '
                         f'height="{py}" xlink:href="{href}"/>')
    parts.append("</svg>")
    with open(out + ".svg", "w") as f:
        f.write("\n".join(parts))
    render(out + ".svg", out, W, H)
    print("wrote", out)

if __name__ == "__main__":
    # natural: 160 x 160*1.7345 = 277.5
    tile(160, 278, 4, 4, os.path.join(HERE, "new_natural.png"))
    # vertical period stretched ~+45%
    tile(160, 400, 4, 3, os.path.join(HERE, "new_stretched.png"))
