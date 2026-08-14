import express from "express";
import {
  loginUser,
  adminLogin,
  registerUser,
  getProfile,
  sendResetOtp,
  resetPassword,
} from "../controllers/userController.js";
import authUser from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.post("/profile", authUser, getProfile);
userRouter.post("/send-reset-otp", sendResetOtp);
userRouter.post("/reset-password", resetPassword);

export default userRouter;
