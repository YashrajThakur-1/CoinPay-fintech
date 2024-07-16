const express = require("express");
const mongoose = require("mongoose");
const UserDetail = require("../Model/userDetailSchema");
const { jsonAuthMiddleware } = require("../authorization/auth");
const Phone = require("../Model/userPhoneDetailsSchema");
const router = express.Router();

// Create a new user detail
router.post("/adddetail", jsonAuthMiddleware, async (req, res) => {
  try {
    const {
      email,
      addressLine,
      city,
      postcode,
      fullname,
      username,
      dob,
      country,
    } = req.body;
    const userId = req.user.userData;
    console.log("userId", userId);
    // Retrieve the phone number based on userId
    const phone = await Phone.findOne({ _id: userId });
    console.log("phone", phone);

    if (!phone) {
      return res
        .status(400)
        .json({ message: "Phone number not found for the user" });
    }

    // Create a new UserDetail document
    const newUserDetail = new UserDetail({
      email,
      addressLine,
      userId,
      userPhoneNumber: phone.phoneNumber, // Assign the phone number to userPhoneNumber
      city,
      postcode,
      fullname,
      username,
      dob,
      country,
    });

    // Save the new user detail to the database
    const savedUserDetail = await newUserDetail.save();
    res.status(201).json(savedUserDetail);
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/getdetail", async (req, res) => {
  try {
    const userDetails = await UserDetail.find();
    res.status(200).json(userDetails);
  } catch (error) {
    console.log("get All the User>>>>>>>>>", userDetails);
    res.status(500).json({ message: error.message });
  }
});

router.get("/userdetail/:id", async (req, res) => {
  try {
    const userDetail = await UserDetail.findById(req.params.id);
    if (!userDetail) {
      return res.status(404).json({ message: "User detail not found" });
    }
    console.log("Get Single User  >>>>>>>>>>", userDetail);
    res.status(200).json(userDetail);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/userdetail/:id", async (req, res) => {
  try {
    const updatedUserDetail = await UserDetail.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedUserDetail) {
      return res.status(404).json({ message: "User detail not found" });
    }
    consiole.log("updated User ", updatedUserDetail);
    res.status(200).json(updatedUserDetail);
  } catch (error) {
    console.log("error", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/userdetail/:id", async (req, res) => {
  try {
    const deletedUserDetail = await UserDetail.findByIdAndDelete(req.params.id);
    console.log("DeletedUser Details >>>>>>", deletedUserDetail);

    if (!deletedUserDetail) {
      return res.status(404).json({ message: "User detail not found" });
    }
    res.status(200).json({ message: "User detail deleted successfully" });
  } catch (error) {
    console.log("error>>>>>>", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
