import React from "react";
import RegistrationStepper from "../../components/auth/RegistrationStepper";

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white px-4 py-10">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Bitexly" className="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bitexly</h1>
              <p className="text-sm text-gray-500">Create an account to get started</p>
            </div>
          </div>
        </div>

        <div className="bg-transparent">
          <RegistrationStepper />
        </div>
      </div>
    </div>
  );
}