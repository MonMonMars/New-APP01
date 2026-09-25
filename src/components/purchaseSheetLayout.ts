import { spacing } from '../theme';

export type PurchaseSheetInsets = {
  top: number;
  bottom: number;
};

/** Max height for purchase confirm modals — keeps Cancel / Confirm above the home indicator. */
export function purchaseConfirmSheetMaxHeight(
  windowHeight: number,
  insets: PurchaseSheetInsets = { top: 0, bottom: 0 },
): number {
  const minTopEdge = insets.top + 32;
  const minBottomEdge = insets.bottom + spacing.lg;
  const maxHeight = windowHeight - minTopEdge - minBottomEdge;
  const ratioHeight = Math.round(windowHeight * 0.82);
  const capped = Math.min(ratioHeight, maxHeight);
  return Math.max(320, capped);
}
