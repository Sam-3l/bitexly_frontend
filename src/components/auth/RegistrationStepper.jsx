import React, { useState, useEffect } from "react";
import AuthService from "../../services/authService";
import InputField from "../../components/forms/InputField";
import Button from "../../components/common/Button";
import StepIndicator from "./StepIndicator";

export default function RegistrationStepper() {
  const [step, setStep] = useState(1);
  const [countries, setCountries] = useState([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  // Step 1
  const [signupData, setSignupData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    username: "",
  });

  // Step 2
  const [otp, setOtp] = useState("");

  // Step 3
  const [completeData, setCompleteData] = useState({
    email: "",
    password: "",
    confirm_password: "",
    referral_code_input: "",
    phone_number: "",
    country: "",
  });

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch countries on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name");
        const data = await response.json();
  
        const sortedCountries = data
          .map(country => country?.name?.common)
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b));
  
        setCountries(sortedCountries);
      } catch (err) {
        console.error("Failed to fetch countries:", err);
        setCountries([
          "Nigeria", "United States", "United Kingdom", 
          "Ghana", "Kenya", "South Africa"
        ]);
      } finally {
        setLoadingCountries(false);
      }
    };
  
    fetchCountries();
  }, []);  

  const updateSignup = (e) =>
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  const updateComplete = (e) =>
    setCompleteData({ ...completeData, [e.target.name]: e.target.value });

  const handleSignup = async (e) => {
    e?.preventDefault();
    setError("");
    if (!signupData.email || !signupData.username) {
      setError("Please provide a valid email and username.");
      return;
    }

    setLoading(true);
    try {
      await AuthService.signup({ ...signupData });
      setCompleteData((c) => ({ ...c, email: signupData.email }));
      setStep(2);
    } catch (err) {
      setError(err?.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    setError("");
    if (!otp || !signupData.email) {
      setError("Enter the OTP sent to your email.");
      return;
    }
    setLoading(true);
    try {
      await AuthService.verifyOtp({ email: signupData.email, otp });
      setStep(3);
    } catch (err) {
      setError(err?.message || "Invalid or expired OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (e) => {
    e?.preventDefault();
    setError("");

    const {
      email,
      password,
      confirm_password,
      referral_code_input,
      phone_number,
      country,
    } = completeData;

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    if (!phone_number || !country) {
      setError("Please provide phone number and country.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email,
        password,
        phone_number,
        country,
      };
    
      if (referral_code_input?.trim()) {
        payload.referral_code_input = referral_code_input;
      }

      await AuthService.completeRegistration(payload);
      setSuccessMsg("Registration successful! You can now login.");
      setStep(4);
    } catch (err) {
      setError(err?.message || "Failed to complete registration.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      await AuthService.signup({ email: signupData.email });
    } catch (err) {
      setError(err?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const stepsMeta = [
    { label: "Account", sub: "Email & username" },
    { label: "Verify", sub: "OTP verification" },
    { label: "Complete", sub: "Password & profile" },
    { label: "Done", sub: "All set" },
  ];

  const containerClass = "w-full max-w-2xl mx-auto";
  const panelClass = "bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden";

  return (
    <div className="flex flex-col items-center w-full gap-6">
      <div className={containerClass}>
        <StepIndicator steps={stepsMeta} current={step} />
      </div>

      <div className={`${containerClass} ${panelClass}`}>
        <div className="p-8">
          {step === 1 && (
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                Create your account
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Enter your email and a preferred username — we'll send an OTP to verify.
              </p>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={signupData.email}
                  onChange={updateSignup}
                  placeholder="you@example.com"
                />
                <InputField
                  label="Username"
                  name="username"
                  type="text"
                  value={signupData.username}
                  onChange={updateSignup}
                  placeholder="display username"
                />
                <InputField
                  label="First name"
                  name="first_name"
                  type="text"
                  value={signupData.first_name}
                  onChange={updateSignup}
                  placeholder="John"
                />
                <InputField
                  label="Last name"
                  name="last_name"
                  type="text"
                  value={signupData.last_name}
                  onChange={updateSignup}
                  placeholder="Doe"
                />

                <div className="md:col-span-2 flex items-center justify-between gap-4 mt-1">
                  <div className="text-sm text-gray-500">
                    By continuing you agree to our terms & privacy.
                  </div>
                  <div className="w-44">
                    <Button type="submit" variant="primary" loading={loading}>
                      Send OTP
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Verify OTP</h3>
              <p className="text-sm text-gray-500 mb-4">
                We sent an OTP to <span className="font-medium">{signupData.email}</span>. Enter it below.
              </p>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="max-w-xs">
                  <InputField
                    label="One-time code (OTP)"
                    name="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="1234"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <Button type="submit" variant="primary" loading={loading}>
                      Verify OTP
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm text-indigo-600 hover:underline disabled:opacity-50"
                    disabled={loading}
                  >
                    Resend OTP
                  </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => setStep(1)}
                  >
                    ← Back
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Complete Registration</h3>
              <p className="text-sm text-gray-500 mb-4">Set a secure password and profile details.</p>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleComplete} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Password"
                  name="password"
                  type="password"
                  value={completeData.password}
                  onChange={updateComplete}
                  placeholder="Create a password"
                />
                <InputField
                  label="Confirm password"
                  name="confirm_password"
                  type="password"
                  value={completeData.confirm_password}
                  onChange={updateComplete}
                  placeholder="Repeat password"
                />
                <InputField
                  label="Phone number"
                  name="phone_number"
                  type="text"
                  value={completeData.phone_number}
                  onChange={updateComplete}
                  placeholder="+2348012345678"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select
                    name="country"
                    value={completeData.country}
                    onChange={updateComplete}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={loadingCountries}
                  >
                    <option value="">
                      {loadingCountries ? "Loading countries..." : "Select country"}
                    </option>
                    {countries.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <InputField
                  label="Referral code (optional)"
                  name="referral_code_input"
                  type="text"
                  value={completeData.referral_code_input}
                  onChange={updateComplete}
                  placeholder="ABC123"
                />

                <div className="md:col-span-2 flex items-center justify-between mt-1">
                  <button
                    type="button"
                    className="text-sm text-gray-500 hover:text-gray-700"
                    onClick={() => setStep(2)}
                  >
                    ← Back
                  </button>

                  <div className="w-44">
                    <Button type="submit" variant="primary" loading={loading}>
                      Complete Signup
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">You're all set!</h3>
              <p className="text-sm text-gray-500 mb-6">{successMsg || "Registration completed successfully."}</p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="primary" onClick={() => (window.location.href = "/login")}>
                  Go to Login
                </Button>
                <button className="text-sm text-gray-500 hover:text-gray-700" onClick={() => setStep(3)}>
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}