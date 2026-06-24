import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

/**
 * A single language variant of a video. Each language has its own natively
 * uploaded video (its own Cloudflare Stream UID), title, script, and platform
 * share links.
 */
const variant = z.object({
  title: z.string(),
  streamId: z.string(),
  script: z.string().optional(),
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
    featured: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    languages: z.object({
      en: variant,
      fa: variant.optional(),
    }),
  }),
});

export const collections = { videos };
