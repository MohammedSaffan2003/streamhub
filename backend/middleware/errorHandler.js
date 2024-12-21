const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);

  // Remove sensitive information from error logs
  const sanitizedError = {
    message: err.message,
    status: err.status || 500,
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  };

  // Don't expose error details in production
  const responseError =
    process.env.NODE_ENV === "development"
      ? sanitizedError
      : { message: "Internal Server Error", status: 500 };

  res.status(responseError.status).json({
    error: responseError.message,
    ...(responseError.details && { details: responseError.details }),
  });
};

module.exports = errorHandler;
