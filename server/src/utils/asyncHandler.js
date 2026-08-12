// Wraps async route handlers so rejected promises are forwarded to Express error middleware.
module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
