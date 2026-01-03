// OTP Service for client-side OTP management
// Compatible with localStorage-based authentication
// Optionally supports backend API integration

interface OTPRecord {
  otp: string;
  email: string;
  expiresAt: number;
  purpose: 'password-reset';
}

const OTP_STORAGE_KEY = 'otpStore';
const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP in localStorage
export function storeOTP(email: string, otp: string, purpose: 'password-reset' = 'password-reset'): void {
  const otpStore = getOTPStore();
  otpStore[email] = {
    otp,
    email,
    expiresAt: Date.now() + OTP_EXPIRY_TIME,
    purpose,
  };
  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otpStore));
  
  // In development, log OTP to console for testing
  if (import.meta.env.DEV) {
    console.log(`[DEV] OTP for ${email}: ${otp} (expires in 5 minutes)`);
  }
}

// Send OTP via backend API (optional)
export async function sendOTPToBackend(email: string): Promise<{ success: boolean; message: string }> {
  if (!USE_BACKEND) {
    return { success: false, message: 'Backend not configured' };
  }

  try {
    const response = await fetch(`${BACKEND_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    let data;
    try {
      data = await response.json();
    } catch {
      const text = await response.text();
      data = { message: text || 'Failed to send OTP' };
    }

    if (response.ok) {
      return { success: true, message: data.message || 'OTP sent successfully' };
    } else {
      return { success: false, message: data.message || 'Failed to send OTP' };
    }
  } catch (error) {
    console.error('Error sending OTP to backend:', error);
    return { success: false, message: 'Failed to connect to backend server. Make sure the server is running on port 5000.' };
  }
}

// Get OTP store from localStorage
function getOTPStore(): Record<string, OTPRecord> {
  const stored = localStorage.getItem(OTP_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

// Verify OTP
export async function verifyOTP(email: string, otp: string): Promise<{ success: boolean; message: string }> {
  // If backend is enabled, verify via backend first
  if (USE_BACKEND) {
    try {
      const response = await fetch(`${BACKEND_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      if (response.ok) {
        // Also clean up local storage if exists
        const otpStore = getOTPStore();
        delete otpStore[email];
        localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otpStore));
        return { success: true, message: 'OTP verified successfully' };
      } else {
        const error = await response.text();
        return { success: false, message: error || 'OTP verification failed' };
      }
    } catch (error) {
      console.error('Error verifying OTP with backend:', error);
      // Fall back to local verification
    }
  }

  // Local verification (default)
  const otpStore = getOTPStore();
  const record = otpStore[email];

  if (!record) {
    return { success: false, message: 'No OTP found for this email. Please request a new one.' };
  }

  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otpStore));
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (record.otp !== otp) {
    return { success: false, message: 'Invalid OTP. Please try again.' };
  }

  // OTP verified successfully
  delete otpStore[email];
  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otpStore));
  return { success: true, message: 'OTP verified successfully' };
}

// Check if OTP exists and is valid (without consuming it)
export function hasValidOTP(email: string): boolean {
  const otpStore = getOTPStore();
  const record = otpStore[email];
  
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    delete otpStore[email];
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otpStore));
    return false;
  }
  return true;
}

// Clean up expired OTPs
export function cleanupExpiredOTPs(): void {
  const otpStore = getOTPStore();
  const now = Date.now();
  let cleaned = false;

  for (const email in otpStore) {
    if (otpStore[email].expiresAt < now) {
      delete otpStore[email];
      cleaned = true;
    }
  }

  if (cleaned) {
    localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otpStore));
  }
}

// Initialize cleanup on module load
if (typeof window !== 'undefined') {
  cleanupExpiredOTPs();
  // Clean up expired OTPs every minute
  setInterval(cleanupExpiredOTPs, 60 * 1000);
}

