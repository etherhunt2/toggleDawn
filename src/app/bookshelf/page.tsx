"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";

interface Book {
  _id: {
    $oid: string;
  };
  bookId: string;
  title: string;
  slug: string;
  category: string[];
  featuredImage: string;
  altImage: string;
  description: string;
  __v: number;
  project: string;
}

interface Category {
  _id: {
    $oid: string;
  };
  categoryId: string;
  title: string;
  slug: string;
  type: "project" | "book" | "notes" | "chapter";
  description: string;
  date: {
    $date: string;
  };
  __v: number;
  badge: string;
}

export default function Bookshelf() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const projectSlug = searchParams.get("project");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [boooks, setBoooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/books${
            projectSlug ? `?projectSlug=${projectSlug}` : ""
          }`
        );
        if (response.data) {
          setBoooks(response.data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        setLoading(false);
      }
    };

    fetchBooks();
  }, [projectSlug]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/categories?type=book`
        );
        if (response.data) {
          const cats = response.data;
          console.log("cats: ", cats);
          setCategories(cats);
          if (loading === true) {
            setLoading(false);
          }
        } else if (response.data.message) {
          alert(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Dummy data for books
  const books = [
    {
      title: "The Design of Everyday Things",
      description:
        "A powerful primer on how—and why—some products satisfy customers while others only frustrate them.",
      type: "image-slider" as const,
      link: "/noteshelf",
      images: ["/img/design1.jpg", "/img/design2.jpg", "/img/design3.jpg"],
      category: "design",
    },
    {
      title: "Clean Code",
      description:
        "A handbook of agile software craftsmanship that has helped countless programmers write better code.",
      type: "image-slider" as const,
      link: "/noteshelf",
      images: ["/img/code1.jpg", "/img/code2.jpg", "/img/code3.jpg"],
      category: "programming",
    },
  ];

  // Simple cards data (no images/videos)
  const simpleCards = [
    {
      title: "Reading List",
      description: "Books you've saved to read later",
      link: "/noteshelf",
    },
    {
      title: "Recently Added",
      description: "Books added to your library recently",
      link: "/noteshelf",
    },
    {
      title: "Reading Stats",
      description: "Track your reading progress and habits",
      link: "/noteshelf",
    },
    {
      title: "Book Collections",
      description: "Your curated book collections",
      link: "/noteshelf",
    },
    {
      title: "Reading Goals",
      description: "Set and track your reading goals",
      link: "/noteshelf",
    },
  ];

  // Filter books based on selected category
  const filteredBooks =
    selectedCategory === "all"
      ? boooks
      : boooks.filter((book) => book.category.includes(selectedCategory));

  return (
    <main
      className={
        theme === "dark"
          ? "dark bg-gray-950 text-white"
          : "bg-gray-50 text-gray-900"
      }
    >
      <Navbar />
      <Sidebar />

      {/* Hero Banner */}
      <section className="pt-28 pb-12 px-4">
        <div className="container mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`text-3xl md:text-4xl font-bold mb-4 ${
              theme === "dark" ? "text-neon-blue" : "text-blue-600"
            }`}
          >
            Your Book Collection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg mb-8"
          >
            Explore your personal library and discover new reads. Click on any
            book to view detailed notes.
          </motion.p>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            <button
              key="all"
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm transition-all ${
                selectedCategory === "all"
                  ? theme === "dark"
                    ? "bg-blue-600 text-white border-neon-blue border-glow"
                    : "bg-blue-600 text-white"
                  : theme === "dark"
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.categoryId}
                onClick={() => setSelectedCategory(category.categoryId)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  selectedCategory === category.categoryId
                    ? theme === "dark"
                      ? "bg-blue-600 text-white border-neon-blue border-glow"
                      : "bg-blue-600 text-white"
                    : theme === "dark"
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {category.title}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredBooks.map((book, index) => (
              <AnimatedCard
                key={index}
                title={book.title}
                description={
                  <div
                    dangerouslySetInnerHTML={{
                      __html: book.description.substring(0, 50) + "...",
                    }}
                  />
                }
                type={`simple` as const}
                link={`book/${book.slug}`}
                images={[book.featuredImage]}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Simple Cards Section */}
      <section className="py-12 px-4 bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto">
          <motion.h2
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`text-2xl font-bold mb-8 ${
              theme === "dark" ? "text-neon-blue" : "text-blue-600"
            }`}
          >
            Personal Library Tools
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {simpleCards.map((card, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
                className={`rounded-lg p-6 ${
                  theme === "dark"
                    ? "bg-gray-800 border border-neon-blue border-glow"
                    : "bg-white border border-gray-200 shadow-sm"
                }`}
              >
                <Link href={card.link} className="block h-full">
                  <h3
                    className={`font-semibold text-lg mb-2 ${
                      theme === "dark" ? "text-neon-blue" : "text-blue-600"
                    }`}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {card.description}
                  </p>
                  <div className="mt-4 flex justify-end">
                    <span
                      className={`text-sm font-medium ${
                        theme === "dark" ? "text-neon-blue" : "text-blue-600"
                      }`}
                    >
                      View →
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
