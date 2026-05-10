export const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse({
    body: req.body,
    query: req.query,
    params: req.params
  });

  if (!parsed.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parsed.error.flatten()
    });
  }

  req.body = parsed.data.body ?? req.body;
  req.query = parsed.data.query ?? req.query;
  req.params = parsed.data.params ?? req.params;
  next();
};
