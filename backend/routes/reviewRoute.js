import express from "express";
import authUser from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import {
  addOrUpdateReview,
  getProductReviews,
  getMyReview,
  deleteReview,
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

// public
reviewRouter.get("/:productId", getProductReviews);

reviewRouter.post(
  "/add",
  upload.array("images", 4),
  authUser,
  addOrUpdateReview,
);
reviewRouter.post("/mine", authUser, getMyReview);
reviewRouter.post("/remove", authUser, deleteReview);

export default reviewRouter;
