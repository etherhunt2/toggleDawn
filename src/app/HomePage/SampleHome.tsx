"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface Project {
  _id: {
    $oid: string;
  };
  projectId: string;
  title: string;
  slug: string;
  category: string[];
  featuredImage: string;
  coverImage: string;
  coverImageAlt: string;
  altImage: string;
  deadline: {
    $date: string;
  };
  description: string;
}

export default function HomePage() {
  const { theme } = useTheme();

  // Dummy data for cards
  const imageCards = [
    {
      title: "Explore Books",
      description: "Discover curated collections of books that inspire and engage.",
      type: "image-slider" as const,
      link: "/bookshelf",
      images: ["/img/book1.jpg", "/img/book2.jpg", "/img/book3.jpg"],
    },
    {
      title: "Learn Coding",
      description: "Access resources to master programming languages and techniques.",
      type: "image-slider" as const,
      link: "/bookshelf",
      images: ["/img/coding1.jpg", "/img/coding2.jpg", "/img/coding3.jpg"],
    },
    {
      title: "Creative Writing",
      description: "Find inspiration for your next great story or article.",
      type: "image-slider" as const,
      link: "/bookshelf",
      images: ["/img/writing1.jpg", "/img/writing2.jpg", "/img/writing3.jpg"],
    },
  ];

  const videoCards = [
    {
      title: "Animation Tutorials",
      description: "Learn the art of animation with step-by-step guides.",
      type: "video" as const,
      link: "/bookshelf",
      videoSrc: "/video/animation.mp4",
    },
    {
      title: "Design Patterns",
      description: "Explore essential design patterns for modern development.",
      type: "video" as const,
      link: "/bookshelf",
      videoSrc: "/video/design.mp4",
    },
    {
      title: "Digital Art",
      description: "Master digital art with professional techniques and tools.",
      type: "video" as const,
      link: "/bookshelf",
      videoSrc: "/video/art.mp4",
    },
  ];

  return (
    <main className={theme === "dark" ? "dark bg-gray-950 text-white" : "bg-gray-50 text-gray-900"}>
      <Navbar />
      <Sidebar />
      
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="pt-28 pb-20 px-4"
      >
        <div className="container mx-auto text-center">
          <motion.h1 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className={`text-4xl md:text-6xl font-bold mb-6 ${theme === "dark" ? "text-neon-blue" : "text-blue-600"}`}
          >
            Welcome to Toggle Dawn
          </motion.h1>
          <motion.p 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl max-w-3xl mx-auto mb-10"
          >
            Your personal knowledge repository for organizing notes, books, and creative ideas. 
            Explore our elegant interface designed for immersive learning and writing experiences.
          </motion.p>
        </div>
      </motion.section>

      {/* Image Slider Cards Section */}
      <section className="py-18 px-4 bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto">
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={`text-2xl md:text-3xl font-bold mb-8 ${theme === "dark" ? "text-neon-blue" : "text-blue-600"}`}
          >
            Popular Categories
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {imageCards.map((card, index) => (
              <AnimatedCard
                key={index}
                title={card.title}
                description={card.description}
                type={card.type}
                link={card.link}
                images={card.images}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Video Cards Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto">
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className={`text-2xl md:text-3xl font-bold mb-8 ${theme === "dark" ? "text-neon-blue" : "text-blue-600"}`}
          >
            Featured Tutorials
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videoCards.map((card, index) => (
              <AnimatedCard
                key={index}
                title={card.title}
                description={card.description}
                type={card.type}
                link={card.link}
                videoSrc={card.videoSrc}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className={`py-20 px-4 text-center ${
          theme === "dark" 
            ? "bg-gradient-to-r from-blue-900 to-purple-900" 
            : "bg-gradient-to-r from-blue-50 to-purple-50"
        }`}
      >
        <div className="container mx-auto max-w-3xl">
          <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${theme === "dark" ? "text-neon-blue" : "text-blue-700"}`}>
            Ready to Organize Your Knowledge?
          </h2>
          <p className={`text-lg mb-8 ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
            Join our community of learners and create your personalized collection of notes and resources.
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-8 py-3 rounded-full text-white font-medium ${
              theme === "dark" 
                ? "bg-blue-600 border border-neon-blue border-glow" 
                : "bg-blue-600 shadow-lg"
            }`}
          >
            Get Started
          </motion.button>
        </div>
      </motion.section>

      <Footer />
    </main>
  );
}