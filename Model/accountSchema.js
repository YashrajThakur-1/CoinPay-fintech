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

// Account Schema
const accountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Assuming "User" is the correct model name for the user who owns the account
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
  ],
  categorizedTransactions: {
    Spending: { type: [transactionSchema], default: [] },
    Bills: { type: [transactionSchema], default: [] },
    Savings: { type: [transactionSchema], default: [] },
    Income: { type: [transactionSchema], default: [] },
  },
});

const Account = mongoose.model("Account", accountSchema);

module.exports = {
  Transaction,
  Account,
};
