const mongoose = require("mongoose");
const TransactionSchema = require("./transactionSchema");

const userSchema = new mongoose.Schema({
  balance: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: "USD",
  },
  transactions: [TransactionSchema],
});

const Account = mongoose.model("Account", userSchema);

module.exports = Account;
