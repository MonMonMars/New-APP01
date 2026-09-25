/** Layout invariants for Pulse news / sponsor read sheets (no RN imports). */

const RATIO = 0.84;
const MIN_TOP_CLEARANCE = 40;
const SPACING_MD = 16;

function disguiseReadSheetHeight(windowHeight, insets = { top: 0, bottom: 0 }) {
  const minTopEdge = insets.top + MIN_TOP_CLEARANCE;
  const minBottomEdge = insets.bottom + SPACING_MD;
  const maxHeight = windowHeight - minTopEdge - minBottomEdge;
  const ratioHeight = Math.round(windowHeight * RATIO);
  const capped = Math.min(ratioHeight, maxHeight);
  return Math.max(280, capped);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const phone = 844;
const phoneInsets = { top: 47, bottom: 34 };
const h0 = disguiseReadSheetHeight(phone, { top: 0, bottom: 0 });
assert(h0 + 40 + SPACING_MD <= phone, 'sheet must fit viewport with top clearance (no insets)');
const hPhone = disguiseReadSheetHeight(phone, phoneInsets);
assert(hPhone + phoneInsets.top + MIN_TOP_CLEARANCE + phoneInsets.bottom + SPACING_MD <= phone + 1, 'sheet fits iPhone safe areas');
assert(hPhone < phone, 'sheet shorter than full window');
assert(hPhone >= 280, 'minimum height');

console.log('validate-disguise-read-sheet-layout: ok');
