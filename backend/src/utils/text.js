export function escapeLikeValue(value) {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

const FORMULA_TRIGGER_CHARS = new Set(['=', '+', '-', '@', '\t', '\r']);

// Defuses CSV/formula injection: a spreadsheet app (Excel, Sheets) treats a
// cell starting with one of these characters as a formula, so untrusted
// data written to a cell — anything an applicant typed into the public
// application form ends up in an admin's export — could execute arbitrary
// formulas when opened. Prefixing with a quote forces it to render as plain
// text; Excel/Sheets hide the leading quote, so the visible value is
// unchanged for ordinary values.
export function sanitizeSpreadsheetCell(value) {
  const str = value === null || value === undefined ? '' : String(value);
  return str.length > 0 && FORMULA_TRIGGER_CHARS.has(str[0]) ? `'${str}` : str;
}
