const express = require("express");
const router = express.Router();
const multer = require("multer");
const { jsonAuthMiddleware } = require("../authorization/auth");
const DocImage = require("../Model/docImageSchema");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public"); // Destination folder for uploaded images
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Unique filename
  },
});

const upload = multer({ storage: storage });

// Route to upload user image and document proof image
router.post(
  "/upload",
  jsonAuthMiddleware,
  upload.fields([
    { name: "user_image", maxCount: 1 },
    { name: "doc_image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const userId = req.user.userData;

      // Retrieve filenames of uploaded images
      const user_image = req.files["user_image"][0].filename;
      const doc_image = req.files["doc_image"][0].filename;

      // Create new document
      const doc = new DocImage({
        user_image: user_image,
        doc_image: doc_image,
        userId: userId,
      });

      // Save document to database
      await doc.save();

      res.status(200).json({ message: "Images uploaded successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
router.get("/docimages", jsonAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.userData;
    console.log("userId", userId);
    console.log(" req.user", req.user);
    // Fetch all DocImages for the current user
    const docImages = await DocImage.find({ createdby: userId });
    if (!docImages || docImages.length === 0) {
      return res.status(404).json({ msg: "DocImages Not Found" });
    }
    res.status(200).json(docImages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
