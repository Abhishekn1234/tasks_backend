
const mongoose = require("mongoose");

const Task = require("../models/Task");
const User = require("../models/User");

const allowedTransitions = {
  Pending: ["In Progress"],
  "In Progress": ["Completed"],
  Completed: []
};

const getAllTasks = async () => {
  const tasks = await Task.find()
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  return tasks;
};

const createTask = async ({
  title,
  description,
  assignedTo,
  createdBy
}) => {
  const assignedUser = await User.findById(assignedTo);

  if (!assignedUser) {
    const error = new Error("Assigned user not found");
    error.statusCode = 404;
    throw error;
  }

  const task = await Task.create({
    title,
    description,
    assignedTo,
    createdBy
  });

  return await Task.findById(task._id)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");
};

const updateTaskStatus = async ({
  taskId,
  newStatus,
  version
}) => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    const error = new Error("Invalid task ID");
    error.statusCode = 400;
    throw error;
  }

  const currentTask = await Task.findById(taskId);

  if (!currentTask) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  const currentStatus = currentTask.status;

  if (currentStatus === newStatus) {
    return {
      task: currentTask,
      alreadyUpdated: true
    };
  }

  const allowed =
    allowedTransitions[currentStatus] || [];

  if (!allowed.includes(newStatus)) {
    const error = new Error(
      `Invalid status transition: ${currentStatus} → ${newStatus}`
    );

    error.statusCode = 400;
    throw error;
  }

  const updateData = {
    status: newStatus,
    updatedAt: new Date()
  };

  if (newStatus === "Completed") {
    updateData.completedAt = new Date();
  }

  const updatedTask = await Task.findOneAndUpdate(
    {
      _id: taskId,
      __v: version,
      status: currentStatus
    },
    {
      $set: updateData,
      $inc: {
        __v: 1
      }
    },
    {
      new: true,
      runValidators: true
    }
  )
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  if (!updatedTask) {
    const error = new Error(
      "Task was modified by another user. Please refresh and try again."
    );

    error.statusCode = 409;
    throw error;
  }

  return {
    task: updatedTask,
    alreadyUpdated: false
  };
};

const assignTask = async ({
  taskId,
  assignedTo
}) => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    const error = new Error("Invalid task ID");
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(assignedTo);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const task = await Task.findByIdAndUpdate(
    taskId,
    {
      $set: {
        assignedTo
      }
    },
    {
      new: true,
      runValidators: true
    }
  )
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  return task;
};

const getTaskMetrics = async () => {
  const result = await Task.aggregate([
    {
      $facet: {
        statusBreakdown: [
          {
            $group: {
              _id: "$status",
              count: {
                $sum: 1
              }
            }
          },
          {
            $project: {
              _id: 0,
              status: "$_id",
              count: 1
            }
          },
          {
            $sort: {
              status: 1
            }
          }
        ],

        averageCompletionTime: [
          {
            $match: {
              status: "Completed",
              completedAt: {
                $ne: null
              }
            }
          },
          {
            $project: {
              assignedTo: 1,
              completionTimeMs: {
                $subtract: [
                  "$completedAt",
                  "$createdAt"
                ]
              }
            }
          },
          {
            $group: {
              _id: "$assignedTo",
              averageCompletionTimeMs: {
                $avg: "$completionTimeMs"
              },
              completedTaskCount: {
                $sum: 1
              }
            }
          },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "user"
            }
          },
          {
            $unwind: {
              path: "$user",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              _id: 0,
              userId: "$_id",
              userName: "$user.name",
              email: "$user.email",
              averageCompletionTimeMs: 1,
              completedTaskCount: 1
            }
          },
          {
            $sort: {
              userName: 1
            }
          }
        ]
      }
    }
  ]);

  return result[0] || {
    statusBreakdown: [],
    averageCompletionTime: []
  };
};

const deleteTask = async (taskId) => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    const error = new Error("Invalid task ID");
    error.statusCode = 400;
    throw error;
  }

  const task = await Task.findByIdAndDelete(taskId);

  if (!task) {
    const error = new Error("Task not found");
    error.statusCode = 404;
    throw error;
  }

  return task;
};

module.exports = {
  getAllTasks,
  createTask,
  updateTaskStatus,
  assignTask,
  getTaskMetrics,
  deleteTask
};

