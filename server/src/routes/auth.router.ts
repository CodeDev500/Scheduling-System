import express from "express";
import * as AuthController from "../controllers/auth.controller";
import * as OtpController from "../controllers/otp.controller";

const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "./uploads" });

router.post("/register", upload.single("image"), AuthController.register);
router.post("/login", AuthController.login);
router.post("/verify-otp", OtpController.verifyOTP);
router.post("/resend-otp", OtpController.resendOTP);

export default router;
