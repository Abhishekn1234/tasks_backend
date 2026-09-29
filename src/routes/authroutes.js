const express = require("express");

const {
  register,
  login,
  getUsers
} = require("../controllers/authcontrollers");

const validate = require("../validators/validate");


const authMiddleware = require("../middleware/auth");
const { registerSchema,loginSchema } = require("../validators/authvalidator");

const router = express.Router();


router.post(
  "/register",
  validate(registerSchema),
  register
);


router.post(
  "/login",
  validate(loginSchema),
  login
);


router.get(
  "/users",
  authMiddleware,
  getUsers
);


module.exports = router;