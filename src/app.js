const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authroutes");
const taskRoutes = require("./routes/taskroutes");

const errorHandler = require("./middleware/error");

const app = express();


app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);


app.use(express.json());


app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,
      message: "API is running"
    });
  }
);


app.use(
  "/api/auth",
  authRoutes
);


app.use(
  "/api/tasks",
  taskRoutes
);


app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message: "Route not found"
    });
  }
);


app.use(errorHandler);


module.exports = app;