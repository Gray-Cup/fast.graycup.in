/** kg for Delhivery — uses persisted grams, with a label fallback for legacy rows. */
export function delhiveryWeightKg(order: {
  totalWeightGrams: number | null;
  variantLabel: string;
  quantity: number;
}): number {
  let grams = order.totalWeightGrams ?? 0;
  if (grams <= 0) {
    const label = order.variantLabel.toLowerCase();
    const unit =
      label.includes("500gm") && !label.includes("150gm") ? 500 : 150;
    grams = unit * order.quantity;
  }
  return Math.max(0.05, grams / 1000);
}
