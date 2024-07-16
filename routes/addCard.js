const express = require("express");
const router = express.Router();
require("dotenv").config();
const nodemailer = require("nodemailer");
const Card = require("../Model/addCardSchema");
const VerificationCode = require("../Model/verifyCardSchema");
const {
  jsonAuthMiddleware,
  generateVerificationCode,
} = require("../authorization/auth");
const cardSchema = require("../Validator/Card-validator");
const sendVerificationCode = require("../authorization/resendotp");

// Helper function to generate a 6-digit code

router.post("/add-card", jsonAuthMiddleware, async (req, res) => {
  const userId = req.user.userData;
  const { name, email, card_number, expiryDate, cvv } = req.body;
  console.log("req.body?>>>>>>>>>>>>>>>>>>>", req.body);
  try {
    // Create or update Card
    let card = await Card.findOne({ email });
    if (!card) {
      card = new Card({
        name,
        email,
        card_number,
        expiryDate,
        cvv,
        userId: userId,
      });
    } else {
      card.name = name;
      card.card_number = card_number;
      card.expiryDate = expiryDate;
      card.cvv = cvv;
    }
    await card.save();
    console.log("card?>>>>>>>>>>>>>>>>>>>", card);

    // Generate and save verification code
    const code = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 2); // Code expires in 2 minutes
    let verificationCode = await VerificationCode.findOne({ email });
    if (!verificationCode) {
      verificationCode = new VerificationCode({ email, code, expiresAt });
    } else {
      verificationCode.code = code;
      verificationCode.expiresAt = expiresAt;
    }
    await verificationCode.save();
    // Send verification code to Card's email
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "yash.dicecoder105@gmail.com",
        pass: "nfyveyqifyapvshl",
      },
      tls: {
        rejectUnauthorized: false, // Ignore TLS verification
      },
    });

    const mailOptions = {
      from: "your-email@gmail.com",
      to: email,
      subject: "Coinpay Fintech pvt ltd",
      text: `Your verification code is ${code}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res
          .status(500)
          .json({ error: "Error sending email", status: false });
      }
      res.status(200).json({
        message: "Verification code sent to your email",
        status: true,
      });
    });
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ error: "Internal server error", status: false });
  }
});

router.post("/verify-card", jsonAuthMiddleware, async (req, res) => {
  const { email, code } = req.body;

  try {
    const verificationCode = await VerificationCode.findOne({ email });
    if (
      !verificationCode ||
      verificationCode.code !== code ||
      new Date() > verificationCode.expiresAt
    ) {
      return res.status(400).send({ message: "Invalid or expired code" });
    }

    // Update Card verification status
    const card = await Card.findOne({ email });
    if (card) {
      card.isVerified = true;
      await card.save();
    }

    // Delete verification code
    await VerificationCode.deleteOne({ email });
    console.log("VerificationCode>>>>>>>>", VerificationCode);
    res.status(200).send({ message: "Your card succesfully addedd" });
  } catch (error) {
    console.log("Error>>>>>>>>>>", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/resend-code", jsonAuthMiddleware, async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the card exists
    const card = await Card.findOne({ email });
    if (!card) {
      return res.status(404).json({ message: "Card not found", status: false });
    }

    // Generate and save new verification code
    const code = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 2);

    let verificationCode = await VerificationCode.findOne({ email });
    if (!verificationCode) {
      verificationCode = new VerificationCode({ email, code, expiresAt });
    } else {
      verificationCode.code = code;
      verificationCode.expiresAt = expiresAt;
    }
    await verificationCode.save();

    // Send verification code to Card's email
    await sendVerificationCode(email, code);
    res.status(200).json({
      message: "Verification code resent to your email",
      status: true,
    });
  } catch (error) {
    console.log("Error>>>>>>>>>>", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/get-card/:id", jsonAuthMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const card = await Card.findOne({ _id: id, isVerified: true });

    if (!card) {
      return res
        .status(404)
        .json({ error: "Card not found or not verified", status: false });
    }

    res.status(200).json(card); // Send retrieved card as JSON response
  } catch (error) {
    console.log("Error>>>>>>>>>>", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/delete-card/:id", jsonAuthMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Card.findByIdAndDelete({ _id: id });
    res.status(200).json(data); // Send retrieved data as JSON response
  } catch (error) {
    console.log("Error>>>>>>>>>>", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
