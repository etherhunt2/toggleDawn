"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import LoginForm from "@/components/auth/LoginForm";
import AnimatedLink from "@/components/ui/AnimatedLink";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md dark:bg-black/80 shadow-md"
          : "bg-white dark:bg-black"
      } ${theme === "dark" ? "neon-border-bottom" : ""}`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <AnimatedLink href="/" className="text-2xl font-bold">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`${
              theme === "dark" ? "text-neon-blue" : "text-blue-600"
            }`}
          >
            ToggleDawn
          </motion.div>
        </AnimatedLink>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <AnimatePresence>
              {searchOpen ? (
                <motion.div
                  initial={{ opacity: 0, width: "40px" }}
                  animate={{ opacity: 1, width: "300px" }}
                  exit={{ opacity: 0, width: "40px" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="fixed inset-0 bg-white dark:bg-black z-50 flex items-center justify-center p-4 md:p-0 md:relative md:inset-auto"
                >
                  <div className="relative w-full max-w-md">
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full p-2 pl-4 pr-10 border rounded-md dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      onClick={() => setSearchOpen(false)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setSearchOpen(true)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-search"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Switch */}
          <div className="flex items-center gap-2">
            <Switch
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
              className={`${
                theme === "dark" ? "border-neon-blue border-glow" : ""
              }`}
            />
          </div>

          {/* Login/Dashboard Button */}
          {isAuthenticated ? (
            <AnimatedLink href="/dashboard">
              <Button
                variant="outline"
                className={`${
                  theme === "dark"
                    ? "border-neon-blue text-neon-blue border-glow"
                    : ""
                }`}
              >
                Dashboard
              </Button>
            </AnimatedLink>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className={`${
                    theme === "dark"
                      ? "border-neon-blue text-neon-blue border-glow"
                      : ""
                  }`}
                >
                  Login
                </Button>
              </DialogTrigger>
              <DialogContent>
                <LoginForm />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </header>
  );
}
