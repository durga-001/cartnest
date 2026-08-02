import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Number, required: true },
});

const sellerModel =
  mongoose.models.seller || mongoose.model("seller", sellerSchema);

export default sellerModel;
