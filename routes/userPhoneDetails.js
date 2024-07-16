const express = require("express");
const { object, number, string } = require("zod");
const { generateToken } = require("../authorization/auth");
const Phone = require("../Model/userPhoneDetailsSchema");
const { signupSchema, loginSchema } = require("../Validator/phone-validator");
const router = express.Router();

// Zod schemas

// Middleware for validating signup request
const validateSignup = (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body;
    signupSchema.parse({ phoneNumber, password });
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};

// Middleware for validating login request
const validateLogin = (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body;
    loginSchema.parse({ phoneNumber, password });
    next();
  } catch (error) {
    res.status(400).json({ error: error.errors });
  }
};

router.post("/signup", validateSignup, async (req, res) => {
  try {
    const { phoneNumber, password, country_code } = req.body;

    // Check if the phone number already exists
    const existingPhoneNumber = await Phone.findOne({ phoneNumber });

    if (existingPhoneNumber) {
      return res.status(400).json({ message: "Phone number already exists" });
    }

    // Save phone number and password
    const phone = new Phone({ phoneNumber, password, country_code });
    const savedPhone = await phone.save();

    // Generate token
    const token = generateToken(savedPhone._id);

    // Send response with token
    res
      .status(200)
      .json({ user: savedPhone, token, msg: " User Register Succesfully" });
  } catch (error) {
    console.error("Error on signup", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", validateLogin, async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const user = await Phone.findOne({ phoneNumber });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid phoneNumber or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "User Login Successfully!",
      token,
    });
  } catch (error) {
    console.error("Error on login", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
