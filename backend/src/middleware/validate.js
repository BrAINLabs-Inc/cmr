// Validates and replaces req[part] with the parsed (and coerced) value, so
// downstream handlers can trust types instead of re-checking. Errors thrown
// here are ZodErrors, formatted by middleware/errorHandler.js.
export function validate(schema, part = 'body') {
  return (req, res, next) => {
    req[part] = schema.parse(req[part]);
    next();
  };
}
