// Escapes LIKE/ILIKE special characters so a value used in .ilike() behaves
// as a literal (case-insensitive) match instead of a wildcard pattern.
export function escapeLikeValue(value) {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}
