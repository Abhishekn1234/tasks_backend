const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit");

const taskCreationLimiter = rateLimit({
  windowMs: 60 * 1000,

  limit: 5,

  standardHeaders: true,

  legacyHeaders: false,

  keyGenerator: (req) => {

    if (req.user?.id) {
      return `user:${req.user.id}`;
    }

    
    return ipKeyGenerator(req);
  },

  message: {
    success: false,
    message:
      "Task creation limit exceeded. Maximum 5 tasks per minute."
  }
});

module.exports = taskCreationLimiter;