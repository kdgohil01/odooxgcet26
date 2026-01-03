
# DayFlow - Authentication System

A complete authentication system with login, signup, and forgot password functionality with OTP verification.

## Features

- **User Authentication**: Sign up and sign in with email and password
- **Forgot Password Flow**: Complete password reset flow with OTP verification
- **OTP Verification**: 6-digit OTP verification for password reset
- **Role-based Access**: Support for Employee and HR roles
- **Local Storage**: Client-side user management (can be extended with backend)
- **Backend Integration**: Optional Express.js server for email-based OTP delivery

## Running the Application

### Frontend Only (Default - Client-side OTP)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser to the URL shown in the terminal (usually `http://localhost:5173`)

**Note**: In development mode, OTP codes are logged to the browser console for testing purposes.

### With Backend Server (Email-based OTP)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory:
   ```env
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   PORT=5000
   ```

   **Important for Gmail users:**
   - You MUST use an **App Password**, not your regular Gmail password
   - To create an App Password:
     1. Go to [Google Account Settings](https://myaccount.google.com/)
     2. Navigate to **Security** → **2-Step Verification** (must be enabled)
     3. Scroll down to **App passwords**
     4. Select **Mail** and **Other (Custom name)**
     5. Enter "OTP Service" as the name
     6. Copy the 16-character password (no spaces) and paste it in `EMAIL_PASS`
   - If you don't have 2-Step Verification enabled, you'll need to enable it first

3. Create a `.env` file in the root directory for Vite (or add to existing):
   ```env
   VITE_USE_BACKEND=true
   VITE_BACKEND_URL=http://localhost:5000
   ```

4. Start both frontend and backend:
   ```bash
   npm run dev:full
   ```

   Or start them separately:
   ```bash
   # Terminal 1 - Frontend
   npm run dev

   # Terminal 2 - Backend
   npm run server
   ```

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── SignIn.tsx          # Login component
│   │   ├── SignUp.tsx          # Registration component
│   │   ├── Dashboard.tsx       # User dashboard
│   │   ├── ForgotPassword.tsx  # Forgot password (email input)
│   │   ├── OTPVerification.tsx # OTP verification step
│   │   ├── ResetPassword.tsx   # Password reset form
│   │   └── ui/                 # Reusable UI components
│   ├── utils/
│   │   └── otpService.ts       # OTP management service
│   └── App.tsx                 # Main app component with routing
├── styles/                     # Global styles
└── main.tsx                    # Entry point
```

## Forgot Password Flow

1. Click "Forgot Password?" on the sign-in page
2. Enter your email address
3. Receive and enter the 6-digit OTP code
4. Set your new password
5. Sign in with your new password

## Troubleshooting

### OTP Email Not Sending

1. **Check server logs**: The server will show detailed error messages if email sending fails
2. **Verify environment variables**: Make sure `.env` file exists and has correct values
3. **Gmail App Password**: Ensure you're using an App Password, not your regular password
4. **Check server console**: Look for error messages like:
   - `❌ Email transporter verification failed` - Check your credentials
   - `⚠️ Email credentials not configured` - Create/update `.env` file
   - `❌ Error sending OTP` - Check the detailed error message

### Common Errors

- **EAUTH Error**: Email authentication failed - verify EMAIL_USER and EMAIL_PASS
- **ECONNECTION Error**: Cannot connect to email server - check internet connection
- **Backend not configured**: Make sure `VITE_USE_BACKEND=true` in your frontend `.env` file

## Development Notes

- OTP codes are stored in localStorage for client-side mode
- In development, OTP codes are logged to the browser console
- User data is stored in localStorage (can be replaced with API calls)
- The backend server is optional - the app works fully client-side
- Server logs will show OTP codes for debugging (remove in production)

## Technologies Used

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Express.js (optional backend)
- Nodemailer (optional email service)
- Input OTP component for verification UI
