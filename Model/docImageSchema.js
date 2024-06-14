const mongoose = require("mongoose");
const docSchema = new mongoose.Schema({
  user_image: {
    type: String,
    required: true,
  },
  doc_image: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Phone",
    required: true,
  },
});

const DocImage = mongoose.model("Document", docSchema);

module.exports = DocImage;
