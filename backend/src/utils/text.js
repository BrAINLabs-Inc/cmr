export function escapeLikeValue(value) {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}
