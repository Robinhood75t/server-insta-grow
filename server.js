import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json()); // ✅ Parse JSON bodies

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

// ✅ Payment Screenshot Upload Route
app.post("/api/send", upload.single("paymentScreenshot"), async (req, res) => {
  try {
    const { instagramId, email, phone, packageId, packageTitle, packagePrice } = req.body;

    const mailOptions = {
      from: "onboarding@resend.dev",
      to: "instagrowkar@gmail.com",
      subject: `New Order from ${instagramId}`,
      text: `
        Instagram ID: ${instagramId}
        Email: ${email}
        Phone: ${phone}
        Package: ${packageTitle} (ID: ${packageId}) - ₹${packagePrice}
      `,
      attachments: req.file
        ? [
            {
              filename: req.file.originalname,
              path: req.file.path,
            },
          ]
        : [],
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });

  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email", error });
  }
});

// ✅ Support Form Route
app.post("/api/support", async (req, res) => {
  try {
    const { phoneNumber, instagramUsername, problemDescription } = req.body;

    const mailOptions = {
      from: "onboarding@resend.dev",
      to: "instagrowkar@gmail.com",
      subject: `📩 New Support Request from ${instagramUsername}`,
      html: `
        <h2>New Support Request</h2>
        <p><strong>Phone Number:</strong> ${phoneNumber}</p>
        <p><strong>Instagram Username:</strong> ${instagramUsername}</p>
        <p><strong>Problem Description:</strong></p>
        <p style="white-space: pre-line;">${problemDescription}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Support email sent successfully!" });

  } catch (error) {
    console.error("Error sending support email:", error);
    res.status(500).json({ message: "Error sending support email", error });
  }
});

// ✅ Start Server
app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`);
});
