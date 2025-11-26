import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthService from "../../services/authService";
import InputField from "../../components/forms/InputField";
import Button from "../../components/common/Button";
import usePageTitle from "../../hooks/usePageTitle";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  usePageTitle("Forgot Password");
  const navigate = useNavigate();
  
  // Multi-stage state
  const [stage, setStage] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    new_password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Start countdown timer for resend
  const startResendTimer = () => {
    setCanResend(false);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Stage 1: Send OTP to email
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { email } = formData;

    if (!email) {
      setError("Please enter your email address.");
      setLoading(false);
      return;
    }

    try {
      const response = await AuthService.forgotPassword({ email });
      toast.success(response.detail || "OTP sent to your email!");
      setStage(2);
      startResendTimer();
    } catch (err) {
      setError(err.email?.[0] || err.detail || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await AuthService.forgotPassword({ 
        email: formData.email,
        resend: true 
      });
      toast.success(response.detail || "OTP resent successfully!");
      startResendTimer();
    } catch (err) {
      setError(err.detail || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Stage 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { email, otp } = formData;

    if (!otp || otp.length < 4) {
      setError("Please enter a valid OTP.");
      setLoading(false);
      return;
    }

    try {
      const response = await AuthService.forgotPassword({ email, otp });
      toast.success(response.detail || "OTP verified! Set your new password.");
      setStage(3);
    } catch (err) {
      setError(err.detail || err.otp?.[0] || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Stage 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { email, otp, new_password, confirm_password } = formData;

    // Validation
    if (!new_password || new_password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    if (new_password !== confirm_password) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await AuthService.forgotPassword({ 
        email, 
        otp, 
        new_password 
      });
      toast.success(response.detail || "Password reset successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.detail || err.new_password?.[0] || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        {/* Logo and App Name */}
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="Bitexly Logo" className="w-16 h-16 mb-2" />
          <h1 className="text-3xl font-bold text-gray-900 tracking-wide">
            Bitexly
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {stage === 1 && "Reset Your Password"}
            {stage === 2 && "Verify OTP"}
            {stage === 3 && "Create New Password"}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center mb-6 space-x-2">
          <div className={`h-2 w-12 rounded-full ${stage >= 1 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
          <div className={`h-2 w-12 rounded-full ${stage >= 2 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
          <div className={`h-2 w-12 rounded-full ${stage >= 3 ? 'bg-indigo-600' : 'bg-gray-300'}`} />
        </div>

        {/* Stage 1: Email Input */}
        {stage === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <InputField
              label="Email Address"
              name="email"
              type="email"
              placeholder="Enter your registered email"
              value={formData.email}
              onChange={handleChange}
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button type="submit" loading={loading} variant="primary">
              Send OTP
            </Button>
          </form>
        )}

        {/* Stage 2: OTP Verification */}
        {stage === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                We've sent a verification code to
              </p>
              <p className="font-semibold text-gray-900">{formData.email}</p>
            </div>

            <InputField
              label="Enter OTP"
              name="otp"
              type="text"
              placeholder="Enter 4-digit code"
              value={formData.otp}
              onChange={handleChange}
              maxLength={6}
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button type="submit" loading={loading} variant="primary">
              Verify OTP
            </Button>

            {/* Resend OTP */}
            <div className="text-center text-sm">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-gray-500">
                  Resend OTP in {countdown}s
                </p>
              )}
            </div>
          </form>
        )}

        {/* Stage 3: New Password */}
        {stage === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <InputField
              label="New Password"
              name="new_password"
              type="password"
              placeholder="Enter new password"
              value={formData.new_password}
              onChange={handleChange}
            />

            <InputField
              label="Confirm Password"
              name="confirm_password"
              type="password"
              placeholder="Re-enter new password"
              value={formData.confirm_password}
              onChange={handleChange}
            />

            <div className="text-xs text-gray-500">
              Password must be at least 8 characters long
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button type="submit" loading={loading} variant="primary">
              Reset Password
            </Button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-6">
          <Link
            to="/login"
            className="text-indigo-600 hover:text-indigo-500 transition font-medium"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}