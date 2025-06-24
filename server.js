import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());

// Multer for file upload
const upload = multer({ dest: "uploads/" });

// ✅ Resend SMTP transporter
const transporter = nodemailer.createTransport({
  host: "smtp.resend.com",
  port: 587,
  auth: {
    user: "resend",
    pass: process.env.RESEND_API_KEY,
  },
});

// ✅ API endpoint to handle order + screenshot
app.post("/api/send", upload.single("paymentScreenshot"), async (req, res) => {
  try {
    const { instagramId, email, phone, packageId, packageTitle, packagePrice } = req.body;

    const mailOptions = {
      // ✅ Use Resend's verified sender for testing
      from: "onboarding@resend.dev",
      to: "instagrowkar@gmail.com", // your destination email
      subject: `New Order from ${instagramId}`,
      text: `
        Instagram ID: ${instagramId}
        Email: ${email}
        Phone: ${phone}
        Package: ${packageTitle} (ID: ${packageId}) - ₹${packagePrice}
      `,
      attachments: req.file ? [
        {
          filename: req.file.originalname,
          path: req.file.path,
        },
      ] : [],
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });

  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email", error });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`);
});
