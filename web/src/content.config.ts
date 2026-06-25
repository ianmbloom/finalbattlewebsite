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
      youtube: z.string().url().optional(),
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

export const collections = { videos };
