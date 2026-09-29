const mongoose = require("mongoose");

const createTaskSchema = (body) => {
  const errors = [];

  const title =
    typeof body.title === "string"
      ? body.title.trim()
      : "";

  const description =
    typeof body.description === "string"
      ? body.description.trim()
      : "";

  const assignedTo = body.assignedTo;

  if (!title) {
    errors.push("Title is required");
  }

  if (title.length > 150) {
    errors.push("Title cannot exceed 150 characters");
  }

  if (description.length > 1000) {
    errors.push("Description cannot exceed 1000 characters");
  }

  if (!assignedTo) {
    errors.push("assignedTo is required");
  } else if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
    errors.push("Invalid assignedTo");
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      title,
      description,
      assignedTo
    }
  };
};


const updateStatusSchema = (body) => {
  const errors = [];

  const allowedStatuses = [
    "Pending",
    "In Progress",
    "Completed"
  ];

  if (!allowedStatuses.includes(body.status)) {
    errors.push(
      "Status must be Pending, In Progress or Completed"
    );
  }

  if (
    body.version === undefined ||
    !Number.isInteger(body.version) ||
    body.version < 0
  ) {
    errors.push("Valid version is required");
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      status: body.status,
      version: body.version
    }
  };
};


const assignTaskSchema = (body) => {
  const errors = [];

  if (!body.assignedTo) {
    errors.push("assignedTo is required");
  }

  if (
    body.assignedTo &&
    !mongoose.Types.ObjectId.isValid(body.assignedTo)
  ) {
    errors.push("Invalid assignedTo");
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      assignedTo: body.assignedTo
    }
  };
};


module.exports = {
  createTaskSchema,
  updateStatusSchema,
  assignTaskSchema
};