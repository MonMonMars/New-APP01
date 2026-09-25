/** Purchase confirm sheet must fit cancel + confirm inside the viewport. */

const SPACING_LG = 24;

function purchaseConfirmSheetMaxHeight(windowHeight, insets = { top: 0, bottom: 0 }) {
  const minTopEdge = insets.top + 32;
  const minBottomEdge = insets.bottom + SPACING_LG;
  const maxHeight = windowHeight - minTopEdge - minBottomEdge;
  const ratioHeight = Math.round(windowHeight * 0.82);
  const capped = Math.min(ratioHeight, maxHeight);
  return Math.max(320, capped);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const h = purchaseConfirmSheetMaxHeight(844, { top: 47, bottom: 34 });
assert(h + 47 + 32 + 34 + SPACING_LG <= 844 + 1, 'fits iPhone viewport with safe areas');
assert(h >= 320, 'minimum height');

console.log('validate-purchase-sheet-layout: ok');
