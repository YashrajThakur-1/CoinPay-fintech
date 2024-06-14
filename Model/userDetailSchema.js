const mongoose = require("mongoose");

const userDetailSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // Ensure email is unique
      match: [/.+@.+\..+/, "Please enter a valid email address"], // Email validation regex
    },
    addressLine: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Phone",
      required: true,
    },
    userPhoneNumber: {
      type: String,
      ref: "Phone",
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postcode: {
      type: String,
      required: true,
      match: [/^\d{5}(-\d{4})?$/, "Please enter a valid postcode"], // Postcode validation (US format example)
    },
    fullname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true, // Ensure username is unique
    },
    dob: {
      type: Date, // Date type for date of birth
      required: true, // Set to required if it's necessary
    },
    country: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const UserDetail = mongoose.model("UserDetail", userDetailSchema);

module.exports = UserDetail;
