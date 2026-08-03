import jwt from "jsonwebtoken";
import sellerModel from "../models/sellerModel.js";

// Product management (add/edit/delete/list-mine) is allowed for two kinds
// of logins: the single site admin (env credentials) and individual
// sellers. This checks the token against both before rejecting it.
const productAuth = async (req, res, next) => {
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

    // Case 1: site admin token (payload is the plain "email+password" string)
    if (token_decode === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD) {
      req.body.sellerId = "site-admin";
      req.body.storeName = "CartNest";
      return next();
    }

    // Case 2: seller token (payload is { id })
    if (token_decode && token_decode.id) {
      const seller = await sellerModel.findById(token_decode.id);
      if (seller) {
        req.body.sellerId = seller._id.toString();
        req.body.storeName = seller.storeName;
        return next();
      }
    }

    return res.json({
      success: false,
      message: "Not authorized, login again!",
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Not authorized, login again!" });
  }
};

export default productAuth;
