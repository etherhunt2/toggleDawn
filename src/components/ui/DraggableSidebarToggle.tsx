"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DraggableSidebarToggleProps {
  onToggle: () => void;
  isOpen: boolean;
}

const DraggableSidebarToggle = ({ onToggle, isOpen }: DraggableSidebarToggleProps) => {
  const { theme } = useTheme();
  const [side, setSide] = useState<"left" | "right">("left");
  const [windowWidth, setWindowWidth] = useState(0);
  const [bottomConstraint, setBottomConstraint] = useState(0);
  
  // Initialize motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smooth spring animations
  const springX = useSpring(x, { stiffness: 800, damping: 35 });
  const springY = useSpring(y, { stiffness: 800, damping: 35 });
  
  // Reference to the container
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Update window dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    const handleBottomConstraint = () => {
      setBottomConstraint(window.innerHeight - 100);
    };

    // Set initial values
    handleResize();
    handleBottomConstraint();

    window.addEventListener("resize", handleResize);
    window.addEventListener("resize", handleBottomConstraint);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", handleBottomConstraint);
    };
  }, []);
  
  // Determine if button should be on left or right based on its position
  const updateSide = () => {
    const currentX = x.get();
    
    // If more than halfway across screen, set to right, otherwise left
    if (windowWidth > 0 && currentX > windowWidth / 2) {
      setSide("right");
    } else {
      setSide("left");
    }
  };

  // Set initial position based on side
  useEffect(() => {
    if (windowWidth === 0) return;
    
    if (side === "left") {
      x.set(25);
    } else {
      x.set(windowWidth - 75);
    }
    
    // Center vertically
    y.set(window.innerHeight / 2 - 25);
  }, [side, windowWidth, x, y]);
  
  // Snap to either left or right side when drag ends
  const onDragEnd = () => {
    updateSide();
    
    if (side === "left") {
      x.set(25);
    } else {
      x.set(windowWidth - 75);
    }
  };
  
  // Background and border styles based on theme
  const buttonStyle = theme === "dark" 
    ? "bg-gray-800 border border-neon-blue border-glow" 
    : "bg-white border border-gray-200 shadow-md";
  
  // Icon color based on theme
  const iconColor = theme === "dark" ? "text-neon-blue" : "text-blue-600";
  
  return (
    <motion.div
      ref={containerRef}
      className="fixed z-40"
      style={{ 
        x: springX,
        y: springY,
        touchAction: "none"
      }}
      drag
      dragConstraints={{
        top: 50,
        bottom: bottomConstraint,
        left: 10,
        right: windowWidth - 60
      }}
      onDragEnd={onDragEnd}
      whileDrag={{ scale: 1.1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.button
        onClick={onToggle}
        className={`w-12 h-12 rounded-full flex items-center justify-center ${buttonStyle}`}
        whileHover={{ boxShadow: theme === "dark" ? "0 0 15px rgba(80, 170, 255, 0.7)" : "0 0 10px rgba(0, 0, 0, 0.1)" }}
        transition={{ duration: 0.2 }}
      >
        {side === "left" ? (
          isOpen ? (
            <ChevronLeft className={iconColor} size={24} />
          ) : (
            <ChevronRight className={iconColor} size={24} />
          )
        ) : (
          isOpen ? (
            <ChevronRight className={iconColor} size={24} />
          ) : (
            <ChevronLeft className={iconColor} size={24} />
          )
        )}
      </motion.button>
    </motion.div>
  );
};

export default DraggableSidebarToggle;