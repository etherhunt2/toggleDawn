"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`p-6 rounded-lg ${theme === "dark" ? "bg-gray-900 border-neon-blue border-glow" : "bg-white"
        }`}
    >
      <h2 className={`text-2xl font-bold mb-6 text-center ${theme === "dark" ? "text-neon-blue" : "text-gray-900"
        }`}>
        Login to Your Account
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${theme === "dark"
                ? "bg-gray-800 border-gray-700 focus:ring-blue-500 text-white"
                : "border-gray-300 focus:ring-blue-500"
              }`}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${theme === "dark"
                ? "bg-gray-800 border-gray-700 focus:ring-blue-500 text-white"
                : "border-gray-300 focus:ring-blue-500"
              }`}
            required
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 ${theme === "dark"
              ? "bg-blue-600 hover:bg-blue-700 text-white border-neon-blue border-glow"
              : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
        >
          {isLoading ? "Logging in..." : "Log In"}
        </Button>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Demo credentials will work with any email/password
          </p>
        </div>
      </form>
    </motion.div>
  );
} 