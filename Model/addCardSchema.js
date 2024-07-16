const mongoose = require("mongoose");

const CardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  card_number: { type: String, required: true },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Phone",
    required: true,
  },
  expiryDate: { type: String, required: true },
  cvv: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
});

const Card = mongoose.model("Card", CardSchema);

module.exports = Card;
