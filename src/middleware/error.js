const errorHandler = (
  error,
  req,
  res,
  next
) => {
  console.error(error);

  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: Object.values(
        error.errors
      ).map((item) => item.message)
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate value already exists"
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error"
  });
};

module.exports = errorHandler;