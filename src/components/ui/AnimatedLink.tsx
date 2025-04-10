"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { ReactNode } from "react";

interface AnimatedLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}

const AnimatedLink = ({ href, children, className = "", external = false }: AnimatedLinkProps) => {
  const { theme } = useTheme();

  const linkClasses = `relative inline-block ${className}`;
  
  const Component = external ? "a" : Link;
  const extraProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Component href={href} className={linkClasses} {...extraProps}>
      <span className={`relative z-10 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
        {children}
      </span>
      <motion.span
        className={`absolute bottom-0 left-0 w-full h-[2px] ${
          theme === "dark" ? "bg-neon-blue" : "bg-blue-600"
        }`}
        initial={{ width: "0%", left: "0%" }}
        whileHover={{ width: "100%" }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      />
      {theme === "dark" && (
        <motion.span
          className="absolute bottom-0 left-0 w-full h-[2px] bg-transparent"
          initial={{ boxShadow: "0 0 0px rgba(80, 170, 255, 0)" }}
          whileHover={{ boxShadow: "0 0 10px rgba(80, 170, 255, 0.8)" }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
        />
      )}
    </Component>
  );
};

export default AnimatedLink; 