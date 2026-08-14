import transporter from "../config/nodemailer.js";
import crypto from "crypto";

// Step 1: send OTP to email
const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000)); // 6-digit OTP
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: "Cartnest - Password Reset OTP",
      html: `<p>Your OTP to reset your password is <b>${otp}</b>. It is valid for 15 minutes. If you did not request this, please ignore this email.</p>`,
    });

    res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Step 2: verify OTP and set new password
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.json({ success: false, message: "All fields are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP has expired" });
    }

    if (newPassword.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  loginUser,
  registerUser,
  adminLogin,
  getProfile,
  sendResetOtp,
  resetPassword,
};
