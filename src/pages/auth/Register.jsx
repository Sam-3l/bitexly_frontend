import React from "react";
import RegistrationStepper from "../../components/auth/RegistrationStepper";
import usePageTitle from "../../hooks/usePageTitle";

export default function Register() {
  usePageTitle("Register");
  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-gray-50 to-white px-4 py-16">
      <div className="w-full max-w-4xl">
        {/* Centered top: logo + title */}
        <div className="flex flex-col items-center mb-8 text-center">
          <img
            src="/logo.png"
            alt="Bitexly"
            className="w-14 h-14 mb-3 drop-shadow-sm"
          />
          <h1 className="text-3xl font-bold text-gray-900">Bitexly</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create an account to get started
          </p>
          
          {/* NEW: Sign in link */}
          <div className="mt-4 text-sm text-gray-600">
            Already have an account?{" "}
            <a 
              href="/login" 
              className="text-indigo-600 hover:text-indigo-700 font-medium hover:underline"
            >
              Sign in
            </a>
          </div>
        </div>

        {/* Center the stepper + box */}
        <div className="flex justify-center">
          <RegistrationStepper />
        </div>
      </div>
    </div>
  );
}