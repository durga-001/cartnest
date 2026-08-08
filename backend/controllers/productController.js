// backend/controllers/productController.js

import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import ai from "../config/gemini.js";

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
      stock: req.body.stock ? JSON.parse(req.body.stock) : {},
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
    if (req.body.stock) {
      product.stock = JSON.parse(req.body.stock);
    }
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

// --- AI: GENERATE PRODUCT DESCRIPTION (Gemini) ---
// Used by the admin "Generate with AI" button on the Add/Edit product form.
const generateDescription = async (req, res) => {
  try {
    const { name, category, subCategory } = req.body;
    if (!name) {
      return res.json({ success: false, message: "Product name is required" });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        success: false,
        message: "GEMINI_API_KEY is not configured on the server",
      });
    }

    const prompt = `Write a concise, appealing e-commerce product description (2-3 sentences, plain text, no markdown or headings) for a product named "${name}"${
      category ? `, category: ${category}` : ""
    }${subCategory ? `, sub-category: ${subCategory}` : ""}. Mention likely material/use and why a shopper would want it.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const description = response.text?.trim();
    if (!description) {
      return res.json({
        success: false,
        message: "Gemini returned an empty response",
      });
    }

    return res.json({ success: true, description });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// --- AI: PRODUCT RECOMMENDATIONS (Gemini) ---
// Falls back to same category+subCategory matching if Gemini isn't configured or fails,
// so the storefront never breaks even without an API key set.
const getRecommendations = async (req, res) => {
  try {
    const { productId } = req.body;
    const baseProduct = await productModel.findById(productId);
    if (!baseProduct) {
      return res.json({ success: false, message: "Product not found" });
    }

    const candidates = await productModel
      .find({ _id: { $ne: productId } })
      .select("_id name image price category subCategory")
      .limit(60);

    const fallback = () =>
      candidates
        .filter(
          (p) =>
            p.category === baseProduct.category &&
            p.subCategory === baseProduct.subCategory,
        )
        .slice(0, 5);

    if (!process.env.GEMINI_API_KEY || candidates.length === 0) {
      return res.json({
        success: true,
        products: fallback(),
        source: "fallback",
      });
    }

    const catalog = candidates.map((p) => ({
      id: p._id.toString(),
      name: p.name,
      category: p.category,
      subCategory: p.subCategory,
      price: p.price,
    }));

    const prompt = `You are a product recommendation engine for an e-commerce store.
Target product: ${JSON.stringify({
      name: baseProduct.name,
      category: baseProduct.category,
      subCategory: baseProduct.subCategory,
      price: baseProduct.price,
    })}
Candidate products: ${JSON.stringify(catalog)}
Pick up to 5 candidate ids a shopper viewing the target product would most likely also want (similar style, complementary, or same category).
Respond with ONLY a JSON array of id strings, nothing else, e.g. ["id1","id2"].`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let ids = [];
    try {
      const raw = response.text
        .trim()
        .replace(/^```json|```$/g, "")
        .trim();
      ids = JSON.parse(raw);
    } catch (parseError) {
      console.log(
        "Gemini recommendation parse failed, using fallback:",
        parseError.message,
      );
      return res.json({
        success: true,
        products: fallback(),
        source: "fallback",
      });
    }

    const byId = new Map(candidates.map((p) => [p._id.toString(), p]));
    const recommended = ids
      .map((id) => byId.get(id))
      .filter(Boolean)
      .slice(0, 5);

    if (recommended.length === 0) {
      return res.json({
        success: true,
        products: fallback(),
        source: "fallback",
      });
    }

    return res.json({ success: true, products: recommended, source: "gemini" });
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
  generateDescription,
  getRecommendations,
};
