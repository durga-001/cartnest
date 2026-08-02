import jwt from "jsonwebtoken";
import sellerModel from "../models/sellerModel.js";

const sellerAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({
        success: false,
        message: "Not authorized, login again!",
      });
    }

    const token = authHeader.split(" ")[1];
    const token_decode = jwt.verify(token, process.env.JWT_SECRET);

    const seller = await sellerModel.findById(token_decode.id);
    if (!seller) {
      return res.json({
        success: false,
        message: "Not authorized, login again!",
      });
    }

    req.body.sellerId = seller._id.toString();
    req.body.storeName = seller.storeName;
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Not authorized, login again!" });
  }
};

export default sellerAuth;
