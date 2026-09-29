const validate = (schema) => {
  return (req, res, next) => {
    const result = schema(req.body);

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.errors
      });
    }

    req.body = result.data;

    next();
  };
};

module.exports = validate;