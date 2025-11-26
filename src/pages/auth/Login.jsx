import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import AuthService from "../../services/authService";
import InputField from "../../components/forms/InputField";
import Button from "../../components/common/Button";
import usePageTitle from "../../hooks/usePageTitle";

export default function Login() {
  usePageTitle("Login");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    user_type: "trader",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { email, password, user_type } = formData;

    try {
      const data = await AuthService.login(email, password, user_type);
      login(data);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials or network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        {/* Logo and App Name */}
        <div className="flex flex-col items-center mb-6">
          <img
            src="/logo.png"
            alt="Bitexly Logo"
            className="w-16 h-16 mb-2"
          />
          <h1 className="text-3xl font-bold text-gray-900 tracking-wide">
            Bitexly
          </h1>
          <p className="text-gray-500 text-sm mt-1">Secure Crypto Exchange</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField
            label="Email Address"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-indigo-600 hover:text-indigo-500 transition font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            loading={loading}
            variant="primary"
          >
            Login
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-6">
          <Link
            to="/register"
            className="text-indigo-600 hover:text-indigo-500 transition font-medium"
          >
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  );
}