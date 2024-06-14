const mongoose = require("mongoose");

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Spending", "Income", "Bills", "Savings"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = transactionSchema;
module.exports = Transaction;
