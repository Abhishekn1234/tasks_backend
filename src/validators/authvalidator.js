const registerSchema = (body) => {
  const errors = [];

  const name =
    typeof body.name === "string"
      ? body.name.trim()
      : "";

  const email =
    typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : "";

  const password =
    typeof body.password === "string"
      ? body.password
      : "";

  if (!name) {
    errors.push("Name is required");
  }

  if (name.length < 2) {
    errors.push("Name must contain at least 2 characters");
  }

  if (!email) {
    errors.push("Email is required");
  }

  if (!email.includes("@")) {
    errors.push("Valid email is required");
  }

  if (password.length < 6) {
    errors.push("Password must contain at least 6 characters");
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      name,
      email,
      password
    }
  };
};


const loginSchema = (body) => {
  const errors = [];

  const email =
    typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : "";

  const password =
    typeof body.password === "string"
      ? body.password
      : "";

  if (!email) {
    errors.push("Email is required");
  }

  if (!password) {
    errors.push("Password is required");
  }

  return {
    valid: errors.length === 0,
    errors,
    data: {
      email,
      password
    }
  };
};


module.exports = {
  registerSchema,
  loginSchema
};