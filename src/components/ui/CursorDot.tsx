"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

const CursorDot = () => {
  const { theme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Check for elements that should show pointer cursor
    const handleElementDetection = () => {
      const element = document.elementFromPoint(mousePosition.x, mousePosition.y);
      
      // Check if element or any parent is clickable
      const isClickable = (el: Element | null): boolean => {
        if (!el) return false;
        
        const style = window.getComputedStyle(el);
        const tagName = el.tagName.toLowerCase();
        
        if (
          tagName === 'a' || 
          tagName === 'button' || 
          el.getAttribute('role') === 'button' ||
          style.cursor === 'pointer'
        ) {
          return true;
        }
        
        return el.parentElement ? isClickable(el.parentElement) : false;
      };
      
      setIsPointer(isClickable(element));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousemove", handleElementDetection);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", handleElementDetection);
    };
  }, [mousePosition.x, mousePosition.y]);

  return (
    <>
      {/* Small dot that follows cursor exactly */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50 rounded-full"
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          scale: isPointer ? 0.5 : 1
        }}
        transition={{
          type: "spring",
          stiffness: 800,
          damping: 40,
          mass: 0.15
        }}
        style={{
          width: "8px",
          height: "8px",
          backgroundColor: theme === "dark" ? "rgba(80, 170, 255, 0.8)" : "rgba(37, 99, 235, 0.8)",
          boxShadow: theme === "dark" 
            ? "0 0 10px 2px rgba(80, 170, 255, 0.6)" 
            : "0 0 10px 2px rgba(37, 99, 235, 0.3)"
        }}
      />

      {/* Larger ring that follows with lag */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-50 rounded-full"
        animate={{
          x: mousePosition.x - 10,
          y: mousePosition.y - 10,
          scale: isPointer ? 1.5 : 1
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 25,
          mass: 0.4
        }}
        style={{
          width: "30px",
          height: "30px",
          border: theme === "dark" 
            ? "1px solid rgba(80, 170, 255, 0.4)" 
            : "1px solid rgba(37, 99, 235, 0.3)",
          boxShadow: theme === "dark" 
            ? "0 0 15px 1px rgba(80, 170, 255, 0.3)" 
            : "0 0 15px 1px rgba(37, 99, 235, 0.1)"
        }}
      />
    </>
  );
};

export default CursorDot; 