// Prototype of the Escher tile-background algorithm. Builds the outer SVG
// (a 1-period cell painted with a 3x3 bleed grid of the square tile), renders
// it, and tiles it so we can verify seamlessness.
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, "..", "public", "patterns", "PatternMatte.svg");

// Extract the motif geometry (contents of <g id="tile"> ... </g>).
const raw = readFileSync(SRC, "utf8");
const motifFull = raw.match(/<g id="tile">([\s\S]*?)<\/g>/)[1].trim();

// The symbol viewBox clips to [0, NATIVE]^2, so paths whose start point is far
// outside that window are never visible and can be dropped. Margin covers a
// path that begins just outside but curves into the window (motifs are local,
// ~1 cell across).
function trimMotif(motifStr, native, margin = 300) {
  const paths = motifStr.match(/<path[^>]*\/>/g) || [];
  const kept = paths.filter((p) => {
    const m = p.match(/d="M\s*(-?[\d.]+)[ ,]\s*(-?[\d.]+)/);
    if (!m) return true;
    const x = parseFloat(m[1]), y = parseFloat(m[2]);
    return (
      x >= -margin && x <= native + margin && y >= -margin && y <= native + margin
    );
  });
  return { svg: kept.join(""), kept: kept.length, total: paths.length };
}

/**
 * Build the outer SVG. All lengths are in the artwork's user units; `scale`
 * only affects the final rasterization size (mirrors CSS background-size).
 */
// The native square viewBox of the tile symbol (a 501.405-unit crop of the
// periodic art = 2 vertical periods). `tileSize` scales this via meet.
const NATIVE_TILE = 2 * 250.7025;

function buildSvg({
  tileSize,
  tx,
  ty,
  rowOffset = 0, // percent of tx, applied to odd rows
  rotation = 0,
  stroke = "#231f20",
  bg = null,
  trimmed = false,
}) {
  const offsetX = (tx - tileSize) / 2;
  const offsetY = (ty - tileSize) / 2;
  const offsetPx = (tx * rowOffset) / 100;

  const uses = [];
  for (let dy = -1; dy <= 1; dy++) {
    const isOdd = dy % 2 !== 0;
    for (let dx = -1; dx <= 1; dx++) {
      const x = offsetX + dx * tx + (isOdd ? offsetPx : 0);
      const y = offsetY + dy * ty;
      const rot =
        rotation !== 0
          ? ` transform="rotate(${rotation} ${tx / 2} ${ty / 2})"`
          : "";
      uses.push(
        `<use href="#tile" x="${x}" y="${y}" width="${tileSize}" height="${tileSize}"${rot}/>`,
      );
    }
  }

  const bgRect = bg ? `<rect width="100%" height="100%" fill="${bg}"/>` : "";
  const styleRule =
    `.st0{fill:none;stroke:${stroke};stroke-linejoin:bevel;stroke-width:2px}`;
  const motif = trimmed ? trimMotif(motifFull, NATIVE_TILE).svg : motifFull;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tx} ${ty}" ` +
    `preserveAspectRatio="none">` +
    `<defs><style>${styleRule}</style>` +
    `<symbol id="tile" viewBox="0 0 ${NATIVE_TILE} ${NATIVE_TILE}" ` +
    `preserveAspectRatio="xMidYMid meet">${motif}</symbol>` +
    `</defs>${bgRect}${uses.join("")}</svg>`
  );
}

function render(svgPath, pngPath, w, h, bg = "#ffffff") {
  execFileSync("rsvg-convert", [
    "-w", String(Math.round(w)),
    "-h", String(Math.round(h)),
    "-b", bg,
    svgPath, "-o", pngPath,
  ]);
}

function tileCheck(params, tag, scale, nx, ny) {
  const svg = buildSvg(params);
  const svgPath = join(HERE, `${tag}.svg`);
  writeFileSync(svgPath, svg);

  const cellPx = { w: params.tx * scale, h: params.ty * scale };
  const cellPng = join(HERE, `${tag}_cell.png`);
  render(svgPath, cellPng, cellPx.w, cellPx.h);

  const b64 = readFileSync(cellPng).toString("base64");
  const href = `data:image/png;base64,${b64}`;
  const W = cellPx.w * nx, H = cellPx.h * ny;
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
    `<rect width="100%" height="100%" fill="white"/>`,
  ];
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++)
      parts.push(
        `<image x="${i * cellPx.w}" y="${j * cellPx.h}" width="${cellPx.w}" height="${cellPx.h}" xlink:href="${href}"/>`,
      );
  parts.push("</svg>");
  const gridSvg = join(HERE, `${tag}_grid.svg`);
  writeFileSync(gridSvg, parts.join("\n"));
  render(gridSvg, join(HERE, `${tag}_grid.png`), W, H);
  console.log("wrote", `${tag}_grid.png`, `(svg ${svg.length} bytes)`);
}

// Period-aligned defaults: 2 horizontal periods, 2 vertical periods, square tile.
const HP = 144.54, VP = 250.7025;
tileCheck(
  { tileSize: 2 * VP, tx: 2 * HP, ty: 2 * VP, stroke: "#231f20" },
  "escher_natural",
  1,
  4,
  4,
);
// Trimmed motif — should render identically to the full one.
tileCheck(
  { tileSize: 2 * VP, tx: 2 * HP, ty: 2 * VP, stroke: "#231f20", trimmed: true },
  "escher_trimmed",
  1,
  4,
  4,
);
const t = trimMotif(motifFull, NATIVE_TILE);
console.log(`trim: kept ${t.kept}/${t.total} paths, ${t.svg.length} bytes (was ${motifFull.length})`);
