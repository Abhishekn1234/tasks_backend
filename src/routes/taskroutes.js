const express = require("express");

const {
  getTasks,
  createTask,
  updateTaskStatus,
  assignTask,
  getTaskMetrics,
  deleteTask
} = require("../controllers/taskcontrollers");

const authMiddleware = require("../middleware/auth");

const validate = require("../validators/validate");

const {
  createTaskSchema,
  updateStatusSchema,
  assignTaskSchema
} = require("../validators/taskValidator");
const taskCreationLimiter = require("../middleware/ratelimiter");



const router = express.Router();


router.use(authMiddleware);


/*
GET /api/tasks
*/
router.get(
  "/",
  getTasks
);


/*
IMPORTANT:
Metrics route must be before /:id
*/
router.get(
  "/metrics",
  getTaskMetrics
);


/*
POST /api/tasks

Maximum 5 requests per minute per user
*/
router.post(
  "/",
  taskCreationLimiter,
  validate(createTaskSchema),
  createTask
);


/*
PATCH /api/tasks/:id/status
*/
router.patch(
  "/:id/status",
  validate(updateStatusSchema),
  updateTaskStatus
);


/*
PATCH /api/tasks/:id/assign
*/
router.patch(
  "/:id/assign",
  validate(assignTaskSchema),
  assignTask
);


/*
DELETE /api/tasks/:id
*/
router.delete(
  "/:id",
  deleteTask
);


module.exports = router;