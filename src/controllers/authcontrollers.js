
const authService = require("../services/authservices");

const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token: result.token,
      user: result.user
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(
      req.body
    );

    return res.json({
      success: true,
      message: "Login successful",
      token: result.token,
      user: result.user
    });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await authService.getAllUsers();

    return res.json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getUsers
};

