import { getCollection, type CollectionEntry } from "astro:content";
import type { Locale } from "@/consts";

export type ProductEntry = CollectionEntry<"products">;

/** Localized string from a bilingual field, falling back to English. */
export function localized(
  field: { en: string; fa?: string },
  lang: Locale,
): string {
  return field[lang] ?? field.en;
}

/**
 * Languages a design can be ordered in: the English baseline plus any language
 * that has a Printify `print` block on either format.
 */
export function productLanguages(entry: ProductEntry): string[] {
  const langs = new Set<string>(["en"]);
  for (const code of Object.keys(entry.data.formats.tee.print)) langs.add(code);
  for (const code of Object.keys(entry.data.formats.poster.print)) langs.add(code);
  return [...langs];
}

/** All products in shop order: explicit `order` ascending, then by name. */
export async function getProducts(): Promise<ProductEntry[]> {
  const all = await getCollection("products");
  return all.sort((a, b) => {
    if (a.data.order !== b.data.order) return a.data.order - b.data.order;
    return a.data.name.en.localeCompare(b.data.name.en);
  });
}
