const express = require("express");
const Account = require("../Model/accountSchema");
const Transaction = require("../Model/transactionSchema");
const { jsonAuthMiddleware } = require("../authorization/auth");
const router = express.Router();

router.post("/addMoney", jsonAuthMiddleware, async (req, res) => {
  const { amount, type } = req.body;
  try {
    const userId = req.user.userData._id;
    const user = await Account.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.balance += amount;
    const newTransaction = new Transaction({
      type,
      amount,
    });
    user.transactions.push(newTransaction);
    await user.save();
    res.status(200).json({ message: "Money added successfully", user });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
