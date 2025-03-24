import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "../utils/axiosInstance";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Spline from "@splinetool/react-spline";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [splineLoaded, setSplineLoaded] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleGoogleSuccess = async (response) => {
    try {
      setIsLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/google", {
        token: response.credential,
      });
      localStorage.setItem("token", res.data.token);
      navigate(res.data.redirectUrl || "/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    console.error("Google Login Failed");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      if (rememberMe) {
        localStorage.setItem("token", res.data.token);
      } else {
        sessionStorage.setItem("token", res.data.token);
      }
      navigate(res.data.redirectUrl || "/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplineLoad = (spline) => {
    setSplineLoaded(true);
    setTimeout(() => {
      const watermarks = document.querySelectorAll('a[href*="spline.design"]');
      watermarks.forEach(watermark => {
        if (watermark && watermark.parentNode) {
          watermark.parentNode.removeChild(watermark);
        }
      });
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6 py-12 relative overflow-hidden">
      {/* 🟣 Animated Bubbles */}
      <motion.div 
        className="absolute top-5 left-5 w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 opacity-75"
        animate={{ y: [0, -10, 10, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      />
      
      <motion.div 
        className="absolute bottom-[-150px] right-[-100px] w-[350px] h-[350px] rounded-full bg-gradient-to-r from-pink-500 to-purple-600 opacity-50"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
      />

      {/* Main Login Box */}
      <div className="flex w-full max-w-4xl bg-gray-800 bg-opacity-90 backdrop-blur-xl shadow-lg rounded-xl overflow-hidden border border-gray-700">
        {/* Left Side - Form */}
        <motion.div
          initial={{ opacity: 0, rotateY: 90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/2 p-8"
        >
          <h2 className="text-3xl font-semibold text-white text-center mb-6">
            Login to Your Account
          </h2>

          <form onSubmit={handleFormSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300"
                required
              />
            </div>

            {/* Password Input with Toggle */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-200"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-gray-300 text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="mr-2"
                />
                Remember me
              </label>
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95, rotate: -1 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg transition duration-200"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </motion.button>
          </form>

          {/* OR Separator */}
          <div className="my-4 text-center text-gray-400">
            <span className="text-sm">Or continue with</span>
          </div>

          {/* Google Login */}
          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />
          </div>
        </motion.div>

        {/* Right Side - Spline 3D Animation */}
        <div className="hidden md:block md:w-1/2 relative overflow-hidden" style={{ backgroundColor: "#d4d4e5" }}>
        <div className="absolute bottom-0 left-0 right-0 h-15 z-10" style={{ backgroundColor: "#d4d4e5" }}></div>
          <div className="absolute inset-0">
            <Spline scene="https://prod.spline.design/gKiJvDcwelUiyNF4/scene.splinecode" onLoad={handleSplineLoad} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
