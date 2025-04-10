"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export function Footer() {
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: <Instagram size={20} />, href: "#" },
    { icon: <Twitter size={20} />, href: "#" },
    { icon: <Facebook size={20} />, href: "#" },
    { icon: <Youtube size={20} />, href: "#" },
  ];

  const contactInfo = [
    { icon: <Mail size={16} />, text: "contact@sonetapp.com" },
    { icon: <Phone size={16} />, text: "+1 (123) 456-7890" },
    { icon: <MapPin size={16} />, text: "123 Tech Street, Digital City" },
  ];

  const navLinks = [
    { text: "About Us", href: "#" },
    { text: "Privacy Policy", href: "#" },
    { text: "Terms of Service", href: "#" },
    { text: "Contact", href: "#" },
    { text: "Help Center", href: "#" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <footer
      className={`pt-12 pb-6 ${
        theme === "dark"
          ? "bg-gray-900 border-t border-neon-blue border-glow"
          : "bg-gray-100"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand and Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="col-span-1"
          >
            <Link href="/" className="text-2xl font-bold mb-3 inline-block">
              <span
                className={
                  theme === "dark" ? "text-neon-blue" : "text-blue-600"
                }
              >
                ToggleDawn
              </span>
            </Link>
            <p
              className={`mb-4 ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              The ultimate platform for organizing your notes and books. Stay
              connected, stay organized.
            </p>

            {/* Social Media Icons */}
            <motion.div
              className="flex space-x-4"
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {socialLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.href}
                  variants={item}
                  whileHover={{ y: -5, scale: 1.1 }}
                  className={`p-2 rounded-full ${
                    theme === "dark"
                      ? "bg-gray-800 text-neon-blue border border-neon-blue border-glow"
                      : "bg-white text-blue-600 shadow-sm"
                  }`}
                >
                  {link.icon}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="col-span-1"
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                theme === "dark" ? "text-neon-blue" : "text-gray-900"
              }`}
            >
              Quick Links
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link, index) => (
                <motion.li key={index} whileHover={{ x: 5 }}>
                  <Link
                    href={link.href}
                    className={`text-sm ${
                      theme === "dark"
                        ? "text-gray-300 hover:text-neon-blue"
                        : "text-gray-600 hover:text-blue-600"
                    }`}
                  >
                    {link.text}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="col-span-1"
          >
            <h3
              className={`text-lg font-semibold mb-4 ${
                theme === "dark" ? "text-neon-blue" : "text-gray-900"
              }`}
            >
              Contact Us
            </h3>
            <ul className="space-y-3">
              {contactInfo.map((item, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5 }}
                  className="flex items-center space-x-2"
                >
                  <span
                    className={
                      theme === "dark" ? "text-neon-blue" : "text-blue-600"
                    }
                  >
                    {item.icon}
                  </span>
                  <span
                    className={
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }
                  >
                    {item.text}
                  </span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className={`text-center pt-6 border-t ${
            theme === "dark"
              ? "border-gray-800 text-gray-400"
              : "border-gray-200 text-gray-500"
          }`}
        >
          <p className="text-sm">
            &copy; {currentYear} ToggleDawn. All rights reserved.
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
