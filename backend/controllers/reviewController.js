import reviewModel from "../models/reviewModel.js";
import userModel from "../models/userModel.js";

// Add a review, or update it if this user already reviewed this product.
// findOneAndUpdate with upsert:true means "submit" and "update" are the same
// operation — the unique (productId, userId) index guarantees no duplicates.
const addOrUpdateReview = async (req, res) => {
  try {
    const { userId, productId, rating, comment } = req.body;

    if (!productId || !rating) {
      return res.json({
        success: false,
        message: "Product and rating are required",
      });
    }
    if (rating < 1 || rating > 5) {
      return res.json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const review = await reviewModel.findOneAndUpdate(
      { productId, userId },
      {
        productId,
        userId,
        userName: user.name,
        rating,
        comment: comment || "",
        date: Date.now(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return res.json({ success: true, message: "Review saved", review });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Public — list all reviews for a product, plus the average rating and count.
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await reviewModel.find({ productId }).sort({ date: -1 });

    const count = reviews.length;
    const average =
      count === 0
        ? 0
        : Math.round(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / count) * 10,
          ) / 10;

    return res.json({ success: true, reviews, average, count });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// Lets the product page know if the logged-in user already reviewed this product,
// so the form can be pre-filled and act as "update" instead of "submit new".
const getMyReview = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const review = await reviewModel.findOne({ productId, userId });
    return res.json({ success: true, review: review || null });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

// A user can only delete their own review (filtered by their own userId from the auth token).
const deleteReview = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    await reviewModel.findOneAndDelete({ productId, userId });
    return res.json({ success: true, message: "Review removed" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

export { addOrUpdateReview, getProductReviews, getMyReview, deleteReview };
