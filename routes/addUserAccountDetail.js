const express = require("express");
const { Account, Transaction } = require("../Model/accountSchema");
const { jsonAuthMiddleware } = require("../authorization/auth");
const Card = require("../Model/addCardSchema");

const router = express.Router();

router.post("/createAccount", jsonAuthMiddleware, async (req, res) => {
  const { name, balance } = req.body;
  const userId = req.user.userData;

  try {
    const existingAccount = await Account.findOne({ userId });

    if (existingAccount) {
      return res.status(400).json({ message: "User already has an account" });
    }

    const newAccount = new Account({
      name,
      balance,
      userId,
      transactions: [],
      categorizedTransactions: {
        Spending: [],
        Bills: [],
        Savings: [],
        Income: [],
      },
    });

    await newAccount.save();
    res
      .status(201)
      .json({ message: "Account created successfully", account: newAccount });
  } catch (error) {
    console.log(error.message);
    console.log("error>>>>>>", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Add money (create a transaction)
router.post("/addMoney", jsonAuthMiddleware, async (req, res) => {
  const { amount, type } = req.body;
  const userId = req.user.userData;

  try {
    const account = await Account.findOne({ userId });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    if (type === "Spending" || type === "Bills") {
      account.balance -= amount;
    } else if (type === "Income" || type === "Savings") {
      account.balance += amount;
    } else {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    const newTransaction = new Transaction({ type, amount });
    await newTransaction.save();

    account.transactions.push(newTransaction._id);
    account.categorizedTransactions[type].push(newTransaction);

    await account.save();

    res.status(200).json({
      message: "Transaction processed successfully",
      account,
      categorizedTransactions: account.categorizedTransactions,
    });
  } catch (error) {
    console.log("error>>>>>>", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get transactions by type for an account
router.get(
  "/account/:id/transactions/:type",
  jsonAuthMiddleware,
  async (req, res) => {
    const { id, type } = req.params;

    if (!["Spending", "Income", "Bills", "Savings"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    try {
      const account = await Account.findById(id);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }

      const transactions = account.categorizedTransactions[type];

      res.status(200).json(transactions);
    } catch (error) {
      console.log("error>>>>>>", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

// Get account details
router.get("/account/:id", jsonAuthMiddleware, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    res.status(200).json(account);
  } catch (error) {
    console.log("error>>>>>>", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all transactions for an account
router.get(
  "/account/:id/transactions",
  jsonAuthMiddleware,
  async (req, res) => {
    try {
      const account = await Account.findById(req.params.id);
      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.status(200).json(account.transactions);
    } catch (error) {
      console.log("error>>>>>>", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.post("/sendMoney", jsonAuthMiddleware, async (req, res) => {
  const { recipientEmail, amount } = req.body;
  const senderId = req.user.userData;

  try {
    // Find sender's account
    const senderAccount = await Account.findOne({ userId: senderId });
    if (!senderAccount) {
      return res.status(404).json({ message: "Sender account not found" });
    }

    // Find recipient's card
    const recipientCard = await Card.findOne({ email: recipientEmail });
    if (!recipientCard) {
      return res.status(404).json({ message: "Recipient card not found" });
    }

    // Find recipient's account using card's userId
    const recipientAccount = await Account.findOne({
      userId: recipientCard.userId,
    });
    if (!recipientAccount) {
      return res.status(404).json({ message: "Recipient account not found" });
    }

    // Check if sender has enough balance
    if (senderAccount.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Deduct from sender and add to recipient
    senderAccount.balance -= amount;
    recipientAccount.balance += amount;

    // Create transaction for sender
    const senderTransaction = new Transaction({ type: "Spending", amount });
    await senderTransaction.save();
    senderAccount.transactions.push(senderTransaction._id);
    senderAccount.categorizedTransactions.Spending.push(senderTransaction);

    // Create transaction for recipient
    const recipientTransaction = new Transaction({ type: "Income", amount });
    await recipientTransaction.save();
    recipientAccount.transactions.push(recipientTransaction._id);
    recipientAccount.categorizedTransactions.Income.push(recipientTransaction);

    // Save both accounts
    await senderAccount.save();
    await recipientAccount.save();

    res.status(200).json({
      message: "Money sent successfully",
      senderBalance: senderAccount.balance,
      recipientBalance: recipientAccount.balance,
    });
  } catch (error) {
    console.error("Error in sending money:", error);
    console.log("error>>>>>>", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/verifiedUsers", jsonAuthMiddleware, async (req, res) => {
  try {
    const { search, offset = 0, limit = 10 } = req.body;

    // Construct the search query
    let searchQuery = { isVerified: true };
    if (search) {
      const regex = new RegExp(search, "i"); // Case-insensitive search
      searchQuery.$or = [{ email: regex }];
    }
    console.log("SearchQuery", searchQuery);

    const verifiedUsers = await Card.find(searchQuery)
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    res.status(200).json(verifiedUsers);
  } catch (error) {
    console.log("error>>>>>>", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
