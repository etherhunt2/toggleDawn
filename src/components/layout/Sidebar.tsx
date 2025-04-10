"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import {
  ChevronRight,
  Home,
  Book,
  NotebookPen,
  User,
  Settings,
} from "lucide-react";
import DraggableSidebarToggle from "@/components/ui/DraggableSidebarToggle";
import AnimatedLink from "@/components/ui/AnimatedLink";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const navigationLinks = [
    { icon: <Home size={20} />, text: "Home", href: "/" },
    { icon: <Book size={20} />, text: "BookShelf", href: "/bookshelf" },
    { icon: <NotebookPen size={20} />, text: "NoteShelf", href: "/noteshelf" },
    { icon: <User size={20} />, text: "Account", href: "/dashboard" },
    { icon: <Settings size={20} />, text: "Settings", href: "/settings" },
  ];

  return (
    <>
      {/* Draggable Sidebar Toggle Button */}
      <DraggableSidebarToggle onToggle={toggleSidebar} isOpen={isOpen} />

      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-30"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className={`fixed top-0 left-0 h-full w-72 z-40 pt-20 overflow-y-auto ${
          theme === "dark"
            ? "bg-gray-900 border-r border-neon-blue border-glow"
            : "bg-white border-r border-gray-200"
        }`}
      >
        <div className="p-4">
          {/* Navigation Links */}
          <nav className="mb-8">
            <h3
              className={`text-sm font-semibold mb-4 ${
                theme === "dark" ? "text-neon-blue" : "text-gray-500"
              }`}
            >
              Navigation
            </h3>
            <ul className="space-y-2">
              {navigationLinks.map((link, index) => (
                <li key={index}>
                  <AnimatedLink href={link.href}>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        theme === "dark"
                          ? "hover:bg-gray-800 text-gray-300 hover:text-neon-blue"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span
                        className={
                          theme === "dark" ? "text-neon-blue" : "text-blue-600"
                        }
                      >
                        {link.icon}
                      </span>
                      <span>{link.text}</span>
                    </motion.div>
                  </AnimatedLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Dummy Banner */}
          <div
            className={`mb-8 rounded-lg p-4 ${
              theme === "dark"
                ? "bg-gradient-to-r from-blue-900 to-purple-900 border-neon-blue border-glow"
                : "bg-gradient-to-r from-blue-100 to-purple-100"
            }`}
          >
            <h3
              className={`text-lg font-bold mb-2 ${
                theme === "dark" ? "text-neon-blue" : "text-gray-800"
              }`}
            >
              Extend Your Limit
            </h3>
            <p
              className={`text-sm mb-3 ${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Integrate Your Cloud Storage and Sync Your Notes
            </p>
            <button
              className={`text-sm px-3 py-1 rounded-md ${
                theme === "dark"
                  ? "bg-blue-600 text-white border-neon-blue border-glow"
                  : "bg-blue-600 text-white"
              }`}
            >
              Connect Now
            </button>
          </div>

          {/* Dummy Cards */}
          <div className="space-y-4">
            <h3
              className={`text-sm font-semibold mb-2 ${
                theme === "dark" ? "text-neon-blue" : "text-gray-500"
              }`}
            >
              What's New
            </h3>

            {[1, 2, 3].map((card) => (
              <motion.div
                key={card}
                whileHover={{ y: -5 }}
                className={`p-3 rounded-lg ${
                  theme === "dark"
                    ? "bg-gray-800 border border-neon-blue border-glow"
                    : "bg-gray-50 border border-gray-200"
                }`}
              >
                <h4
                  className={`font-medium mb-1 ${
                    theme === "dark" ? "text-neon-blue" : "text-gray-800"
                  }`}
                >
                  Features {card}
                </h4>
                <p
                  className={`text-xs ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Last update: a few moments ago
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}
