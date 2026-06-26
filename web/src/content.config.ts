import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * A single language variant of a video. Each language has its own self-hosted
 * MP4 (`videoSrc`), title, script, and platform share links.
 *
 * `videoSrc` is either a root-relative path to a file served from `public/`
 * (e.g. `/videos/far-from-home.mp4`) or an absolute URL to an external host
 * such as a Cloudflare R2 public bucket.
 */
const variant = z.object({
  title: z.string(),
  videoSrc: z.string(),
  description: z.string().optional(),
  script: z.string().optional(),
  context: z.string().optional(),
  durationSeconds: z.number().optional(),
  thumbnailUrl: z.string().optional(),
  platforms: z
    .object({
      x: z.string().url().optional(),
      instagram: z.string().url().optional(),
      tiktok: z.string().url().optional(),
      youtube: z.string().url().optional(),
      reddit: z.string().url().optional(),
    })
    .optional(),
});

const videos = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/videos" }),
  schema: z.object({
    series: z.string(),
    category: z.enum(["truth", "myth", "project"]),
    publishedAt: z.coerce.date(),
    // Explicit position in the series (ascending). Entries without an order
    // fall to the end, sorted newest-first.
    order: z.number().optional(),
    featured: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    languages: z.object({
      en: variant,
      fa: variant.optional(),
    }),
  }),
});

// English is always present; a locale's copy is optional and falls back to EN.
const bilingual = z.object({ en: z.string(), fa: z.string().optional() });

// A printable variant of a design in one language. Each language version is its
// own Printify product (different baked-in text), so it carries a Printify
// product id and a size -> Printify variant id map. Filled in by
// scripts/sync-printify.mjs as those products exist.
const printEntry = z.object({
  productId: z.string(),
  variantIds: z.record(z.string(), z.number()),
});

// We sell DESIGNS. Each design is one product, available in two formats: a
// T-shirt (with sizes) or a Poster. Every format is fulfilled by Printify;
// `print` maps a language code to its Printify ids and is empty until those
// products exist (then it's fulfilled manually / hidden from the language picker).
const products = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/products" }),
  schema: z.object({
    sku: z.string(),
    image: z.string(), // product shot under /public
    mockup: z.string().optional(), // alternate flat mockup under /public
    featured: z.boolean().default(false),
    order: z.number().default(0),
    name: bilingual,
    description: bilingual,
    slogan: bilingual.optional(),
    currency: z.string().default("USD"),
    formats: z.object({
      tee: z.object({
        price: z.number().positive(),
        sizes: z.array(z.string()).default(["S", "M", "L", "XL", "2XL"]),
        cartImage: z.string().optional(),
        print: z.record(z.string(), printEntry).default({}),
      }),
      poster: z.object({
        price: z.number().positive(),
        size: z.string().default("18x24"),
        cartImage: z.string().optional(),
        print: z.record(z.string(), printEntry).default({}),
      }),
    }),
  }),
});

export const collections = { videos, products };
