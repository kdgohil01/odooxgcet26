import express from "express";
import nodemailer from "nodemailer";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

let otpStore = {}; // Holds OTP temporarily

// Validate environment variables
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || "gmail";

if (!EMAIL_USER || !EMAIL_PASS) {
  console.error("⚠️  WARNING: Email credentials not configured!");
  console.error("Please set EMAIL_USER and EMAIL_PASS in your .env file");
  console.error("For Gmail, you need to use an App Password, not your regular password.");
  console.error("See: https://support.google.com/accounts/answer/185833");
}

// Create email transporter
const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Verify transporter configuration on startup
if (EMAIL_USER && EMAIL_PASS) {
  transporter.verify(function (error, success) {
    if (error) {
      console.error("❌ Email transporter verification failed:", error.message);
      console.error("Please check your EMAIL_USER and EMAIL_PASS in .env file");
    } else {
      console.log("✅ Email transporter is ready to send emails");
      console.log(`📧 Configured email: ${EMAIL_USER}`);
    }
  });
} else {
  console.warn("⚠️  Email transporter not configured - OTP emails will not be sent");
}

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP Endpoint
app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ 
      success: false, 
      message: "Email is required" 
    });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid email format" 
    });
  }

  // Check if email credentials are configured
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.error(`❌ Attempted to send OTP to ${email} but email credentials are not configured`);
    return res.status(500).json({ 
      success: false, 
      message: "Email service is not configured. Please contact administrator." 
    });
  }

  const otp = generateOTP();
  otpStore[email] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000 // expires in 5 min
  };

  console.log(`📤 Attempting to send OTP to ${email}...`);

  try {
    const mailOptions = {
      from: EMAIL_USER,
      to: email,
      subject: "Your OTP Code - DayFlow",
      text: `Your OTP is: ${otp}. It expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">DayFlow Password Reset</h2>
          <p>Your verification code is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code will expire in 5 minutes.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   OTP: ${otp} (for debugging - remove in production)`);

    res.status(200).json({ 
      success: true, 
      message: "OTP sent successfully!" 
    });
  } catch (err) {
    console.error(`❌ Error sending OTP to ${email}:`, err);
    console.error("Error details:", {
      code: err.code,
      command: err.command,
      response: err.response,
      message: err.message
    });
    
    // Provide more specific error messages
    let errorMessage = "Failed to send OTP email";
    if (err.code === "EAUTH") {
      errorMessage = "Email authentication failed. Please check EMAIL_USER and EMAIL_PASS in .env file";
    } else if (err.code === "ECONNECTION" || err.code === "ETIMEDOUT") {
      errorMessage = "Could not connect to email server. Please check your internet connection.";
    } else if (err.response) {
      errorMessage = `Email server error: ${err.response}`;
    }

    res.status(500).json({ 
      success: false, 
      message: errorMessage 
    });
  }
});

// Verification Endpoint
app.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({ 
      success: false, 
      message: "Email and OTP are required" 
    });
  }

  const record = otpStore[email];

  if (!record) {
    return res.status(400).json({ 
      success: false, 
      message: "No OTP found for this email. Please request a new one." 
    });
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    return res.status(400).json({ 
      success: false, 
      message: "OTP has expired. Please request a new one." 
    });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ 
      success: false, 
      message: "Invalid OTP. Please try again." 
    });
  }

  delete otpStore[email];
  console.log(`✅ OTP verified successfully for ${email}`);
  return res.status(200).json({ 
    success: true, 
    message: "OTP verified successfully" 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

