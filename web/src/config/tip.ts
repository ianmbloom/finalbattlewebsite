/**
 * Single source of truth for the "Buy us some kotlets" tip.
 *
 * One kotlet is a small fixed contribution that funds production. The Fund page
 * offers a few suggested counts; both it and the server checkout handler read
 * this, so the amounts can't drift. `unitAmount` is in the currency's minor unit
 * (cents), so the suggested totals are `unitAmount * quantity`.
 */
export const TIP = {
  currency: "usd",
  unitAmount: 500,
  quantities: [3, 5, 10] as const,
  maxQuantity: 100,
} as const;

export type TipQuantity = (typeof TIP.quantities)[number];
