const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const phoneSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  country_code: {
    type: String,
    required: true,
  },
});
phoneSchema.pre("save", async function (next) {
  const person = this;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(person.password, salt);
    person.password = hashedPassword;
    next();
  } catch (error) {
    console.log("Error hashing password", error);
    next(error);
  }
});

// Method to compare passwords
phoneSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    console.log("Error comparing passwords", error);
    throw error;
  }
};
const Phone = mongoose.model("User", phoneSchema);
module.exports = Phone;
