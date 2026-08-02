import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sellerModel from "../models/sellerModel.js";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// --- CREATE A STORE ACCOUNT ---
const registerSeller = async (req, res) => {
  try {
    const { storeName, email, password } = req.body;

    if (!storeName) {
      return res.json({ success: false, message: "Please enter a store name" });
    }

    const exists = await sellerModel.findOne({ email });
    if (exists) {
      return res.json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const seller = await new sellerModel({
      storeName,
      email,
      password: hashedPassword,
      date: Date.now(),
    }).save();

    const token = createToken(seller._id);
    return res.json({ success: true, token, storeName: seller.storeName });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// --- STORE OWNER LOGIN ---
const loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;
    const seller = await sellerModel.findOne({ email });

    if (!seller) {
      return res.json({ success: false, message: "Account does not exist" });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(seller._id);
    return res.json({ success: true, token, storeName: seller.storeName });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export { registerSeller, loginSeller };
