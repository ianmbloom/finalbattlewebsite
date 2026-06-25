// Generates functions/api/_products.json from the product content collection.
// Pages Functions read this map at runtime as the single TRUSTED source for:
//   - /api/checkout       -> per-variant price/currency (never trust the client)
//   - /api/stripe-webhook -> SKU -> Printify product + variant IDs
// Run after editing products:  npm run gen:products
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(fileURLToPath(import.meta.url));
const productsDir = path.join(root, "..", "src", "content", "products");
const outFile = path.join(root, "..", "functions", "api", "_products.json");

let files = [];
try {
  files = (await readdir(productsDir)).filter((f) => f.endsWith(".json"));
} catch {
  // No products dir yet: emit an empty catalog so the functions still compile.
}

const map = {};

// Every design is fulfilled by Printify. Prices live here so the checkout
// function can build Stripe line items from a server-trusted catalog (the
// client only sends sku/format/size/lang/quantity). `print` maps a language
// code to its Printify product id + size->variant ids, filled in by
// scripts/sync-printify.mjs as those products exist.
for (const file of files) {
  const raw = await readFile(path.join(productsDir, file), "utf8");
  const p = JSON.parse(raw);
  const tee = p.formats?.tee ?? {};
  const poster = p.formats?.poster ?? {};
  map[p.sku] = {
    slug: file.replace(/\.json$/, ""),
    name: p.name?.en ?? p.sku,
    image: p.image ?? "",
    currency: (p.currency ?? "USD").toLowerCase(),
    tee: {
      price: tee.price ?? 0,
      sizes: tee.sizes ?? [],
      print: tee.print ?? {},
    },
    poster: {
      price: poster.price ?? 0,
      size: poster.size ?? "",
      print: poster.print ?? {},
    },
  };
}

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, JSON.stringify(map, null, 2) + "\n");
console.log(
  `Wrote ${Object.keys(map).length} products to ${path.relative(process.cwd(), outFile)}`,
);
