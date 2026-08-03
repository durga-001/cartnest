import express from "express";
import upload from "../middleware/multer.js";
import {
  listProduct,
  listMyProducts,
  addProduct,
  updateProduct,
  removeProduct,
  singleProduct,
} from "../controllers/productController.js";
import productAuth from "../middleware/productAuth.js";
const productRouter = express.Router();

const productImages = upload.fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
]);

// public
productRouter.get("/list", listProduct);
productRouter.post("/single", singleProduct);

// store-owner only (each seller manages their own products)
// NOTE: multer must run before sellerAuth here - for multipart/form-data
// requests, req.body doesn't exist until multer parses it, so sellerAuth
// (which writes req.body.sellerId) has to come after it.
productRouter.post("/add", productImages, sellerAuth, addProduct);
productRouter.post("/update", productImages, sellerAuth, updateProduct);
productRouter.post("/remove", sellerAuth, removeProduct);
productRouter.post("/mylist", sellerAuth, listMyProducts);

export default productRouter;
