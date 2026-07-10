/**
 * Escher tile-background engine.
 * ---------------------------------------------------------------------------
 * Renders an Escher-like SVG tile as a repeating background where the tile
 * geometry stays square, but the horizontal and vertical periods can differ.
 * The key is separating **tile size** from **period**: the tile image has one
 * square rendered size, while the pattern cell has independent width and height.
 *
 * The renderer treats user dimensions as SVG units and converts them to CSS
 * pixels with one global scale factor. This lets you enter values from the
 * SVG's `viewBox` or control-point bounding box, then tune only `scale` to
 * make the whole pattern larger or smaller.
 *
 * ── How the colour change works ────────────────────────────────────────────
 * The exported artwork paints every stroke with one fixed source colour
 * (`SOURCE_STROKE`). A `background-image` SVG is a *separate document*, so the
 * page's CSS variables / `currentColor` do NOT cascade into it. Instead we
 * recolour at the source by replacing the stroke colour in the raw SVG text.
 * Each `color` therefore yields its own self-contained, pre-tinted data URI.
 */
import motifRaw from "../../public/patterns/PatternMatte.svg?raw";

export type PatternColor =
  | "ink"
  | "stone"
  | "sand"
  | "gold"
  | "emerald"
  | "crimson"
  | "rose"
  | "canary";

/** Lion & Sun palette hex values (mirror of global.css). */
export const PALETTE: Record<PatternColor, string> = {
  ink: "#1d1a12",
  stone: "#6a6147",
  sand: "#b6a47f",
  gold: "#97781b",
  emerald: "#14463a",
  crimson: "#8f291f",
  rose: "#b35f52",
  canary: "#f2cf41",
};

/** The single stroke colour Illustrator baked into every path of the export. */
const SOURCE_STROKE = "#231f20";

export interface EscherParams {
  /** Square tile side length in SVG units (rendered tile is always square). */
  tileSize: number;
  /** Horizontal period (center-to-center spacing) in SVG units. */
  tx: number;
  /** Vertical period (center-to-center spacing) in SVG units. */
  ty: number;
  /** Horizontal phase shift for odd rows, as % of tx (brick effect). */
  rowOffset: number;
  /** Per-tile rotation about the cell centre, in degrees. */
  rotation: number;
  /** Art units → CSS px conversion factor. */
  scale: number;
}

/**
 * Defaults matched to PatternMatte.svg viewBox (1156.32 × 2005.62).
 * The tile is rendered square at the full vertical dimension, overlapping
 * horizontally (bleed H: ~425px at scale 1).
 */
export const ESCHER: EscherParams = {
  tileSize: 2005.62, // square tile side
  tx: 1156.32, // horizontal period (viewBox width)
  ty: 2005.62, // vertical period (viewBox height)
  rowOffset: 0,
  rotation: 0,
  scale: 0.42, // ~486px/period horizontally
};

/** Encode an SVG string as a data URI. */
function svgToDataUri(svg: string): string {
  return "data:image/svg+xml," + encodeURIComponent(svg.trim());
}

/** Get the tile SVG recoloured to the specified palette colour. */
function getTileSvg(color: PatternColor): string {
  return motifRaw.replace(new RegExp(SOURCE_STROKE, "gi"), PALETTE[color]);
}

/**
 * Build the pattern SVG that tiles correctly via CSS background-repeat.
 *
 * The pattern cell is exactly one period (tx × ty). A single centered tile
 * would be clipped at the pattern boundary when it bleeds outward. To avoid
 * clipping, we render a 3×3 grid of tile instances inside the pattern cell,
 * covering neighboring positions in every direction.
 */
function buildPatternSvg(color: PatternColor, params: EscherParams): string {
  const { tileSize, tx, ty, rowOffset, rotation, scale } = params;

  // Convert to pixels
  const imgSize = tileSize * scale;
  const txPx = tx * scale;
  const tyPx = ty * scale;

  // Offset to center tile in cell; negative means tile extends past edges
  const offsetX = (txPx - imgSize) / 2;
  const offsetY = (tyPx - imgSize) / 2;
  const rowShiftPx = (txPx * rowOffset) / 100;

  // Cell centre for rotation
  const cx = txPx / 2;
  const cy = tyPx / 2;

  // Get recoloured tile as data URI
  const tileDataUri = svgToDataUri(getTileSvg(color));

  // Build 3×3 grid of image instances
  const positions: [number, number][] = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [0, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ];

  const images = positions
    .map(([dx, dy]) => {
      const oddRow = Math.abs(dy) % 2 === 1;
      const x = offsetX + dx * txPx + (oddRow ? rowShiftPx : 0);
      const y = offsetY + dy * tyPx;

      const rotationAttr =
        rotation !== 0 ? ` transform="rotate(${rotation} ${cx} ${cy})"` : "";

      return `<image href="${tileDataUri}" x="${x}" y="${y}" width="${imgSize}" height="${imgSize}" preserveAspectRatio="xMidYMid meet"${rotationAttr}/>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${txPx}" height="${tyPx}" viewBox="0 0 ${txPx} ${tyPx}"><defs><pattern id="p" x="0" y="0" width="${txPx}" height="${tyPx}" patternUnits="userSpaceOnUse">${images}</pattern></defs><rect width="100%" height="100%" fill="url(#p)"/></svg>`;
}

const uriCache = new Map<string, string>();

/** A ready-to-use `url("data:…")` for the given colour, memoised per colour. */
export function tileDataUri(color: PatternColor): string {
  let uri = uriCache.get(color);
  if (!uri) {
    uri = `url("${svgToDataUri(buildPatternSvg(color, ESCHER))}")`;
    uriCache.set(color, uri);
  }
  return uri;
}

/** `background-size` value (one period per repeat) in CSS pixels. */
export function tileBackgroundSize(params: EscherParams = ESCHER): string {
  return `${params.tx * params.scale}px ${params.ty * params.scale}px`;
}

/** CSS custom-property name that holds a colour's pre-tinted tile URI. */
export function tileVarName(color: PatternColor): string {
  return `--pattern-tile-${color}`;
}

/** Generate a math report for debugging/UI display. */
export function makeMathReport(params: EscherParams = ESCHER) {
  const S = params.scale;

  const imgSize = params.tileSize * S;
  const txPx = params.tx * S;
  const tyPx = params.ty * S;

  const offsetX = (txPx - imgSize) / 2;
  const offsetY = (tyPx - imgSize) / 2;

  const bleedH = (imgSize - txPx) / 2;
  const bleedV = (imgSize - tyPx) / 2;

  const coverageH = imgSize / txPx;
  const coverageV = imgSize / tyPx;

  return {
    inputs: {
      tileSize: `${params.tileSize} units`,
      tx: `${params.tx} units`,
      ty: `${params.ty} units`,
      scale: `${S} px/unit`,
      rowOffset: `${params.rowOffset}%`,
      rotation: `${params.rotation}deg`,
    },
    derivedPixels: {
      tileSize: `${imgSize.toFixed(2)}px`,
      hPeriod: `${txPx.toFixed(2)}px`,
      vPeriod: `${tyPx.toFixed(2)}px`,
      patternCell: `${txPx.toFixed(2)}px × ${tyPx.toFixed(2)}px`,
    },
    overlap: {
      offsetX: `${offsetX.toFixed(2)}px`,
      offsetY: `${offsetY.toFixed(2)}px`,
      hBleed: `${bleedH.toFixed(2)}px per side`,
      vBleed: `${bleedV.toFixed(2)}px per side`,
      hCoverage: `${(coverageH * 100).toFixed(1)}%`,
      vCoverage: `${(coverageV * 100).toFixed(1)}%`,
    },
    renderer: {
      instancesPerCell: "3 × 3 = 9",
      dxRange: "-1, 0, +1",
      dyRange: "-1, 0, +1",
    },
  };
}
