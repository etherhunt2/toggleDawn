"use client";

import React, { useState, useEffect, useRef, JSX } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useAnimation, useInView } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface AnimatedCardProps {
  title: string;
  description: React.ReactNode;
  type: "image-slider" | "video" | "simple";
  link: string;
  images?: string[];
  videoSrc?: string;
}

export function AnimatedCard({
  title,
  description,
  type,
  link,
  images = [],
  videoSrc,
}: AnimatedCardProps) {
  const { theme } = useTheme();
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.3 });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  // Image slider effect
  useEffect(() => {
    if (type === "image-slider" && images.length > 0) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [type, images.length]);

  // Play video on hover for video cards
  const handleMouseEnter = () => {
    if (type === "video" && videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    if (type === "video" && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
    hover: {
      boxShadow:
        theme === "dark"
          ? "0 0 10px #00f, 0 0 20px #00f, 0 0 30px #00f"
          : "0 0 10px rgba(0, 0, 255, 0.3), 0 0 20px rgba(0, 0, 255, 0.2)",
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
    initial: {
      y: 0,
      boxShadow: "none",
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <Link href={link}>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={controls}
        variants={cardVariants}
        whileHover="hover"
        whileTap="hover"
        className={`rounded-xl overflow-hidden ${
          theme === "dark"
            ? "bg-gray-800 border border-neon-blue border-glow"
            : "bg-white border border-gray-200 shadow-md"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative h-48 w-full overflow-hidden">
          {type === "image-slider" && images.length > 0 && (
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="h-full w-full"
            >
              <Image
                src={images[currentImageIndex]}
                alt={title}
                fill
                style={{ objectFit: "cover" }}
              />
            </motion.div>
          )}

          {type === "video" && videoSrc && (
            <video
              ref={videoRef}
              src={videoSrc}
              muted
              loop
              playsInline
              className="h-full w-full object-cover"
            />
          )}

          {type === "simple" && (
            <div
              className={`h-full w-full flex items-center justify-center ${
                theme === "dark"
                  ? "bg-gradient-to-r from-blue-900 to-purple-900"
                  : "bg-gradient-to-r from-blue-100 to-purple-100"
              }`}
            >
              <span
                className={`text-4xl font-bold ${
                  theme === "dark" ? "text-neon-blue" : "text-blue-800"
                }`}
              >
                {title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3
            className={`font-semibold text-lg mb-2 ${
              theme === "dark" ? "text-neon-blue" : "text-gray-800"
            }`}
          >
            {title}
          </h3>
          <div
            className={`text-sm ${
              theme === "dark" ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {description}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
