// backend/controllers/productController.js

import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// --- ADD PRODUCT ---
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
      sellerId,
      storeName,
    } = req.body;

    // 1. EXTRACT IMAGES SAFELY
    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined,
    );

    // 2. UPLOAD TO CLOUDINARY
    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      }),
    );

    // 3. PREPARE DATA
    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      sizes: JSON.parse(sizes),
      image: imagesUrl,
      date: Date.now(),
      sellerId,
      storeName,
    };

    // 4. SAVE & RESPOND
    const product = new productModel(productData);
    await product.save();

    return res.json({ success: true, message: "Product Added Successfully" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// --- LIST PRODUCTS (public storefront - every seller's items) ---
const listProduct = async (req, res) => {
  try {
    const products = await productModel.find({});
    return res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// --- LIST ONLY THE LOGGED-IN SELLER'S OWN PRODUCTS (admin panel) ---
const listMyProducts = async (req, res) => {
  try {
    const { sellerId } = req.body;
    const products = await productModel.find({ sellerId });
    return res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// --- UPDATE PRODUCT (edit details without deleting/re-adding) ---
const updateProduct = async (req, res) => {
  try {
    const {
      id,
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
      sellerId,
    } = req.body;

    const product = await productModel.findById(id);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }
    if (product.sellerId !== sellerId) {
      return res.json({
        success: false,
        message: "You can only edit products from your own store",
      });
    }

    // Only re-upload images that were actually replaced; keep the rest as-is
    const existingImages = req.body.existingImages
      ? JSON.parse(req.body.existingImages)
      : product.image;

    const newFiles = [
      req.files && req.files.image1 && req.files.image1[0],
      req.files && req.files.image2 && req.files.image2[0],
      req.files && req.files.image3 && req.files.image3[0],
      req.files && req.files.image4 && req.files.image4[0],
    ];

    const uploadedUrls = await Promise.all(
      newFiles.map(async (file, index) => {
        if (!file) return existingImages[index];
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
        });
        return result.secure_url;
      }),
    );

    product.name = name;
    product.description = description;
    product.price = Number(price);
    product.category = category;
    product.subCategory = subCategory;
    product.bestseller = bestseller === "true" ? true : false;
    product.sizes = JSON.parse(sizes);
    product.image = uploadedUrls.filter((url) => url);

    await product.save();

    return res.json({ success: true, message: "Product Updated Successfully" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// --- REMOVE PRODUCT (only the owning seller can delete it) ---
const removeProduct = async (req, res) => {
  try {
    const { id, sellerId } = req.body;
    const product = await productModel.findById(id);
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }
    if (product.sellerId !== sellerId) {
      return res.json({
        success: false,
        message: "You can only delete products from your own store",
      });
    }
    await productModel.findByIdAndDelete(id);
    return res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// --- SINGLE PRODUCT INFO ---
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    return res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export {
  addProduct,
  listProduct,
  listMyProducts,
  updateProduct,
  removeProduct,
  singleProduct,
};
