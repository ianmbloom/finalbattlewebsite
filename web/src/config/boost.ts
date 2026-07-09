/**
 * Single source of truth for the "Launch this video" boost mechanic.
 *
 * The panel component and the server checkout handler BOTH read `BOOST.tiers`,
 * so the buyable amounts can never drift apart. Amounts are USD dollars.
 */
export const BOOST = {
  tiers: [10, 20, 50] as const,
  currency: "usd",
  platform: "X",
} as const;

export type BoostTier = (typeof BOOST.tiers)[number];

/**
 * Ad-safety classification for a video, driving whether the Launch mechanic
 * renders. This is enforced BOTH client-side (render nothing) and server-side
 * (reject checkout) so a tier-3 video can never be launched.
 *
 *   1 = ad-safe            -> show Launch mechanic
 *   2 = caution (ad-safe)  -> show Launch mechanic
 *   3 = organic-only       -> HIDE Launch mechanic (share bar only)
 */
export type VideoBoostTier = 1 | 2 | 3;

/** A video with an unset tier is treated as organic-only. */
export const DEFAULT_BOOST_TIER: VideoBoostTier = 3;

/** Whether the Launch mechanic may render for a given tier. */
export function isLaunchable(tier: VideoBoostTier): boolean {
  return tier === 1 || tier === 2;
}
