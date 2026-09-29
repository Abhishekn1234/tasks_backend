
const taskService = require("../services/taskservices");

const getTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getAllTasks();

    return res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      assignedTo
    } = req.body;

    const task = await taskService.createTask({
      title,
      description,
      assignedTo,
      createdBy: req.user.id
    });

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      task
    });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const {
      status,
      version
    } = req.body;

    const result =
      await taskService.updateTaskStatus({
        taskId: req.params.id,
        newStatus: status,
        version
      });

    if (result.alreadyUpdated) {
      return res.json({
        success: true,
        message: "Task already has this status",
        task: result.task
      });
    }

    return res.json({
      success: true,
      message: "Task status updated successfully",
      task: result.task
    });
  } catch (error) {
    next(error);
  }
};

const assignTask = async (req, res, next) => {
  try {
    const {
      assignedTo
    } = req.body;

    const task =
      await taskService.assignTask({
        taskId: req.params.id,
        assignedTo
      });

    return res.json({
      success: true,
      message: "Task reassigned successfully",
      task
    });
  } catch (error) {
    next(error);
  }
};

const getTaskMetrics = async (req, res, next) => {
  try {
    const metrics =
      await taskService.getTaskMetrics();

    return res.json({
      success: true,
      metrics
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(
      req.params.id
    );

    return res.json({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTaskStatus,
  assignTask,
  getTaskMetrics,
  deleteTask
};

