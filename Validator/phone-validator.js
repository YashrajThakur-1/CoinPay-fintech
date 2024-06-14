const { object, number, string } = require("zod");

const signupSchema = object({
  phoneNumber: string(),
  password: string().min(6), // Example: Minimum password length of 6 characters
});

// Login schema validation using Zod
const loginSchema = object({
  phoneNumber: string(),
  password: string(),
});
module.exports = {
  signupSchema,
  loginSchema,
};
