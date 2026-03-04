import React, { useState, useEffect } from "react";
import { Brain, Moon, Sun, History, LogIn } from "lucide-react";
import AuthModal from "./AuthModal"; // 👈 import it

const Navbar = () => {
  const [theme, setTheme] = useState("dark");
  const [showAuth, setShowAuth] = useState(false); // 👈 new

  // Load & apply theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <>
      <nav className="w-full bg-gray-900/90 dark:bg-gray-900/90 bg-white/90 border-b border-gray-800 dark:border-gray-800 border-gray-200 px-6 py-3 flex items-center justify-between backdrop-blur-md navbar-glow">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center float">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">OpsMind AI</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">RAG Assistant</p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-4 text-sm">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="relative flex items-center w-12 h-6 bg-gray-300 dark:bg-gray-800 rounded-full p-1 transition-all hover:ring-2 hover:ring-purple-500"
          >
            <div
              className={`absolute w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                theme === "dark" ? "translate-x-6 bg-blue-500" : "translate-x-0 bg-yellow-400"
              }`}
            />
            {theme === "dark" ? (
              <Sun className="w-3.5 h-3.5 text-blue-400 ml-1" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-gray-700 ml-auto mr-1" />
            )}
          </button>

          {/* History */}
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all">
            <History className="w-4 h-4" />
            History
          </button>

          {/* Sign In */}
          <button
            onClick={() => setShowAuth(true)} // 👈 open modal
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        </div>
      </nav>

      {/* Auth Modal (appears on Sign In click) */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
};

export default Navbar;
