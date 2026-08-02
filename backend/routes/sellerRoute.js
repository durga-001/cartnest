import express from "express";
import {
  registerSeller,
  loginSeller,
} from "../controllers/sellerController.js";

const sellerRouter = express.Router();

sellerRouter.post("/register", registerSeller);
sellerRouter.post("/login", loginSeller);

export default sellerRouter;
