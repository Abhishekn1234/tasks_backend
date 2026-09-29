
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");

const registerUser = async ({
  name,
  email,
  password
}) => {
  const existingUser = await User.findOne({
    email
  });

  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(
    password,
    10
  );

  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  };
};

const loginUser = async ({
  email,
  password
}) => {
  const user = await User.findOne({
    email
  }).select("+password");

  if (!user) {
    const error = new Error(
      "Invalid email or password"
    );
    error.statusCode = 401;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(
    password,
    user.password
  );

  if (!passwordMatch) {
    const error = new Error(
      "Invalid email or password"
    );
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  };
};

const getAllUsers = async () => {
  const users = await User.find()
    .select("name email")
    .sort({
      name: 1
    });

  return users;
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers
};
