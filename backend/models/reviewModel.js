import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: "" },
  date: { type: Number, required: true },
});

// A user can only have one review per product — resubmitting updates it (upsert),
// instead of creating duplicate reviews for the same product.
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

const reviewModel =
  mongoose.models.review || mongoose.model("review", reviewSchema);
export default reviewModel;
