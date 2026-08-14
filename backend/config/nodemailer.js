import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER, // your gmail address
    pass: process.env.SMTP_PASS, // gmail "App Password" (not your normal password)
  },
});

export default transporter;
