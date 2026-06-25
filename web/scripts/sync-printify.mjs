// Pull Printify product + per-size variant ids into the product catalog.
//
//   node scripts/sync-printify.mjs --list   # print every Printify product +
//                                            # its enabled variants (id/size/color)
//   node scripts/sync-printify.mjs --sync   # read scripts/printify-map.json,
//                                            # write productId + size->variantId
//                                            # into src/content/products/*.json,
//                                            # then regenerate _products.json
//
// Credentials are read from the environment or web/.dev.vars:
//   PRINTIFY_API_TOKEN   Printify personal access token
//   PRINTIFY_SHOP_ID     Printify shop id
//
// Printify needs a distinct variant id per garment size (and color), so a single
// design tee = one product id + a { "S": id, "M": id, ... } map. Posters declare
// a single `size` instead of a `sizes` array. See `printEntry` in
// src/content.config.ts.
import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.join(root, "..");
const productsDir = path.join(webDir, "src", "content", "products");
const mapFile = path.join(root, "printify-map.json");
const API = "https://api.printify.com/v1";

/** Load PRINTIFY_* from process.env, falling back to web/.dev.vars. */
async function loadCreds() {
  let token = process.env.PRINTIFY_API_TOKEN;
  let shop = process.env.PRINTIFY_SHOP_ID;
  if (!token || !shop) {
    try {
      const raw = await readFile(path.join(webDir, ".dev.vars"), "utf8");
      for (const line of raw.split("\n")) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (!m) continue;
        const value = m[2].replace(/^["']|["']$/g, "");
        if (m[1] === "PRINTIFY_API_TOKEN" && !token) token = value;
        if (m[1] === "PRINTIFY_SHOP_ID" && !shop) shop = value;
      }
    } catch {
      /* no .dev.vars - rely on env */
    }
  }
  if (!token || !shop) {
    console.error(
      "Missing PRINTIFY_API_TOKEN / PRINTIFY_SHOP_ID (set them in the env or web/.dev.vars).",
    );
    process.exit(1);
  }
  return { token, shop };
}

async function api(token, urlPath) {
  const res = await fetch(`${API}${urlPath}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Printify ${urlPath} -> ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/** Normalize a Printify size title ("X-Large", "2X-Large"...) to our token. */
function normalizeSize(title) {
  const s = String(title).trim().toUpperCase().replace(/\s+/g, "");
  const map = {
    SMALL: "S",
    MEDIUM: "M",
    LARGE: "L",
    "X-LARGE": "XL",
    EXTRALARGE: "XL",
    XLARGE: "XL",
    "2X-LARGE": "2XL",
    "XX-LARGE": "2XL",
    XXLARGE: "2XL",
    "2XLARGE": "2XL",
    "3X-LARGE": "3XL",
    "XXX-LARGE": "3XL",
  };
  return map[s] ?? s;
}

/** value id -> { type, title } across all of a product's options. */
function optionIndex(product) {
  const index = new Map();
  for (const opt of product.options ?? []) {
    const type = String(opt.type ?? opt.name ?? "").toLowerCase();
    for (const value of opt.values ?? []) {
      index.set(value.id, { type, title: value.title });
    }
  }
  return index;
}

/** Pull { size, color } from a variant via its option value ids. */
function variantTraits(variant, index) {
  let size = "";
  let color = "";
  for (const id of variant.options ?? []) {
    const entry = index.get(id);
    if (!entry) continue;
    if (entry.type.includes("size")) size = entry.title;
    else if (entry.type.includes("color")) color = entry.title;
  }
  return { size, color };
}

/** Placed artwork per print area, so a product can be matched to its design. */
function artworkNames(product) {
  const seen = new Set();
  const out = [];
  for (const area of product.print_areas ?? []) {
    for (const ph of area.placeholders ?? []) {
      for (const img of ph.images ?? []) {
        // Skip the auto neck-label text layer; only surface real artwork.
        if (img.type && !img.type.startsWith("image/")) continue;
        const name = img.name ?? img.id;
        const key = `${ph.position}:${name}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ position: ph.position, name });
      }
    }
  }
  return out;
}

async function listProducts(token, shop) {
  let page = 1;
  for (;;) {
    const data = await api(token, `/shops/${shop}/products.json?limit=50&page=${page}`);
    const products = data.data ?? [];
    for (const p of products) {
      const index = optionIndex(p);
      console.log(`\n${p.id}  "${p.title}"`);
      for (const art of artworkNames(p)) {
        console.log(`   art @${art.position}: ${art.name}`);
      }
      for (const v of p.variants ?? []) {
        if (!v.is_enabled) continue;
        const { size, color } = variantTraits(v, index);
        console.log(
          `   variant ${v.id}  size=${normalizeSize(size) || "?"}  color="${color}"  (${v.title})`,
        );
      }
    }
    if (!data.last_page || page >= data.last_page) break;
    page += 1;
  }
}

/** sku -> { file, data } for every product JSON. */
async function loadDesigns() {
  const files = (await readdir(productsDir)).filter((f) => f.endsWith(".json"));
  const bySku = new Map();
  for (const file of files) {
    const full = path.join(productsDir, file);
    const data = JSON.parse(await readFile(full, "utf8"));
    bySku.set(data.sku, { file: full, data });
  }
  return bySku;
}

async function sync(token, shop) {
  const map = JSON.parse(await readFile(mapFile, "utf8"));
  const designs = await loadDesigns();
  const cache = new Map();
  let wrote = 0;

  for (const [sku, formats] of Object.entries(map.products ?? {})) {
    const design = designs.get(sku);
    if (!design) {
      console.warn(`! ${sku}: no product JSON with this sku - skipping`);
      continue;
    }
    for (const [format, langs] of Object.entries(formats)) {
      for (const [lang, cfg] of Object.entries(langs)) {
        const productId = (cfg.productId ?? "").trim();
        if (!productId) continue;

        if (!cache.has(productId)) {
          cache.set(productId, await api(token, `/shops/${shop}/products/${productId}.json`));
        }
        const product = cache.get(productId);
        const index = optionIndex(product);
        const wantColor = (cfg.color ?? "").trim().toLowerCase();
        const declaredSizes = new Set(design.data.formats?.[format]?.sizes ?? []);
        // Posters declare a single `size` rather than a `sizes` array.
        const singleSize = design.data.formats?.[format]?.size;
        if (singleSize) declaredSizes.add(singleSize);

        const variantIds = {};
        for (const v of product.variants ?? []) {
          if (!v.is_enabled) continue;
          const { size, color } = variantTraits(v, index);
          if (wantColor && !color.toLowerCase().includes(wantColor)) continue;
          const token2 = normalizeSize(size) || singleSize || "";
          if (!token2) continue;
          if (declaredSizes.size && !declaredSizes.has(token2)) continue;
          if (variantIds[token2]) {
            console.warn(
              `! ${sku} ${format}/${lang}: multiple variants for size ${token2} (set a "color" in printify-map.json to disambiguate) - keeping ${variantIds[token2]}`,
            );
            continue;
          }
          variantIds[token2] = v.id;
        }

        if (Object.keys(variantIds).length === 0) {
          console.warn(`! ${sku} ${format}/${lang}: no matching enabled variants - skipping`);
          continue;
        }

        const fmt = (design.data.formats ??= {});
        const block = (fmt[format] ??= {});
        const print = (block.print ??= {});
        print[lang] = { productId, variantIds };
        wrote += 1;
        console.log(
          `+ ${sku} ${format}/${lang}: ${productId} -> ${Object.keys(variantIds).join(", ")}`,
        );
      }
    }
  }

  for (const { file, data } of designs.values()) {
    await writeFile(file, JSON.stringify(data, null, 2) + "\n");
  }
  console.log(`\nUpdated ${wrote} print block(s). Regenerating catalog...`);
  await import("./gen-product-map.mjs");
}

const mode = process.argv.includes("--sync")
  ? "sync"
  : process.argv.includes("--list")
    ? "list"
    : "";
if (!mode) {
  console.error("Usage: node scripts/sync-printify.mjs --list | --sync");
  process.exit(1);
}
const { token, shop } = await loadCreds();
if (mode === "list") await listProducts(token, shop);
else await sync(token, shop);
