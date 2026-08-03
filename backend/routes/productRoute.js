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

productRouter.post("/add", productImages, productAuth, addProduct);
productRouter.post("/update", productImages, productAuth, updateProduct);
productRouter.post("/remove", productAuth, removeProduct);
productRouter.post("/mylist", productAuth, listMyProducts);

export default productRouter;
