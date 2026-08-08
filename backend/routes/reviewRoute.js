import express from "express";
import authUser from "../middleware/auth.js";
import {
  addOrUpdateReview,
  getProductReviews,
  getMyReview,
  deleteReview,
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

// public
reviewRouter.get("/:productId", getProductReviews);

// requires login
reviewRouter.post("/add", authUser, addOrUpdateReview);
reviewRouter.post("/mine", authUser, getMyReview);
reviewRouter.post("/remove", authUser, deleteReview);

export default reviewRouter;
