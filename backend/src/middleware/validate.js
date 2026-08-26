export function validate(schema, part = 'body') {
  return (req, res, next) => {
    req[part] = schema.parse(req[part]);
    next();
  };
}
