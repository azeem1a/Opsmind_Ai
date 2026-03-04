import React, { useState } from "react";
import { X, Mail, Lock, Eye, EyeOff } from "lucide-react";

const AuthModal = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[420px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Welcome Back</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 mx-5 mt-4 rounded-lg">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              !isSignUp
                ? "bg-blue-500 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              isSignUp
                ? "bg-blue-500 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form className="p-6 space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder={isSignUp ? "Create a password" : "Enter your password"}
              className="w-full pl-9 pr-9 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Confirm Password (Sign Up only) */}
          {isSignUp && (
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Confirm password"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
          )}

          {!isSignUp && (
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold transition-all"
          >
            {isSignUp ? "Create Account" : "Sign In"}
          </button>

          {/* Divider */}
          <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 my-4">
            <span className="border-t border-gray-300 dark:border-gray-700 w-16" />
            <span className="px-2">OR CONTINUE WITH</span>
            <span className="border-t border-gray-300 dark:border-gray-700 w-16" />
          </div>

          {/* Google Sign-In */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-white transition-all"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
            By signing up, you agree to our{" "}
            <button
              type="button"
              onClick={() => console.log("Open Terms of Service")}
              className="text-blue-500 hover:underline"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              type="button"
              onClick={() => console.log("Open Privacy Policy")}
              className="text-blue-500 hover:underline"
            >
              Privacy Policy
            </button>.
          </p>

        </form>
      </div>
    </div>
  );
};

export default AuthModal;
