"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { AnimatedCard } from "@/components/ui/AnimatedCard";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import axios from "axios";

interface Note {
  _id: {
    $oid: string;
  };
  noteId: string;
  index: number;
  title: string;
  slug: string;
  category: string[];
  project: string;
  book: string;
  chapter: string;
  content: Array<{
    id: number;
    type: string;
    index: number;
    content: string;
  }>;
  status: string;
  date: {
    $date: string;
  };
  __v: number;
  publish: boolean;
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

export default function NoteShelf() {
  const { theme } = useTheme();
  const searchParams = useSearchParams();
  const chapterSlug = searchParams.get("chapter");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/notes${
            chapterSlug ? `?chapterSlug=${chapterSlug}` : ""
          }`
        );
        if (response.data) {
          setNotes(response.data);
          setLoading(false);
        } else {
          alert(response.data.message);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        setLoading(false);
      }
    };

    fetchChapters();
  }, [chapterSlug]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/categories?type=notes`
        );
        if (response.data) {
          const cats = response.data;
          setCategories(cats);
          if (loading === true) {
            setLoading(false);
          }
        } else if (response.data.message) {
          alert(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Dummy data for notes
  const notte = [
    {
      title: "User Interface Design Principles",
      description:
        "Notes about the core principles of designing intuitive user interfaces.",
      type: "image-slider" as const,
      link: "/note/user-interface-design",
      images: ["/img/ui1.jpg", "/img/ui2.jpg", "/img/ui3.jpg"],
      category: "design",
    },
    {
      title: "Clean Code Architecture",
      description: "Best practices for writing maintainable and scalable code.",
      type: "image-slider" as const,
      link: "/note/clean-code",
      images: ["/img/code1.jpg", "/img/code2.jpg", "/img/code3.jpg"],
      category: "programming",
    },
    {
      title: "Cognitive Biases in Decision Making",
      description: "How mental shortcuts affect our decisions and judgment.",
      type: "image-slider" as const,
      link: "/note/cognitive-biases",
      images: ["/img/brain1.jpg", "/img/brain2.jpg", "/img/brain3.jpg"],
      category: "psychology",
    },
    {
      title: "Evolution of Human Societies",
      description: "Notes on how human societies have evolved over millennia.",
      type: "image-slider" as const,
      link: "/note/human-societies",
      images: ["/img/society1.jpg", "/img/society2.jpg", "/img/society3.jpg"],
      category: "history",
    },
    {
      title: "Habit Formation Techniques",
      description:
        "Scientific approaches to building and breaking habits effectively.",
      type: "image-slider" as const,
      link: "/note/habit-formation",
      images: ["/img/habit1.jpg", "/img/habit2.jpg", "/img/habit3.jpg"],
      category: "self-help",
    },
    {
      title: "Deep Work Methodology",
      description:
        "Framework for achieving focused and productive work sessions.",
      type: "image-slider" as const,
      link: "/note/deep-work",
      images: ["/img/focus1.jpg", "/img/focus2.jpg", "/img/focus3.jpg"],
      category: "productivity",
    },
  ];

  // Filter notes based on selected category
  const filteredNotes =
    selectedCategory === "all"
      ? notes
      : notes.filter((note) => note.category.includes(selectedCategory));

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
            Your Notes Collection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg mb-8"
          >
            Browse your personal notes and insights. Click on any note to view
            its detailed content.
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
            {categories &&
              categories.map((category) => (
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

      {/* Notes Grid */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {notes &&
              filteredNotes.map((note) => (
                <AnimatedCard
                  key={note.index}
                  title={note.title}
                  description={
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          (typeof note.content?.[0]?.content === "string"
                            ? note.content[0].content.substring(0, 100) + "..."
                            : "") || "",
                      }}
                    />
                  }
                  type={`simple` as const}
                  link={`/note/${note.slug}`}
                />
              ))}
          </motion.div>
        </div>
      </section>

      {/* Recent Activity Section */}
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
            Recent Activity
          </motion.h2>

          <div className="space-y-4">
            {/* Activity Cards */}
            {[
              {
                title: "Updated 'User Interface Design Principles'",
                time: "2 hours ago",
              },
              {
                title: "Created new note on 'Cognitive Biases'",
                time: "Yesterday",
              },
              {
                title: "Added images to 'Clean Code Architecture'",
                time: "3 days ago",
              },
              {
                title: "Shared 'Deep Work Methodology' with team",
                time: "1 week ago",
              },
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`p-4 rounded-lg ${
                  theme === "dark"
                    ? "bg-gray-800 border-l-4 border-neon-blue"
                    : "bg-white border-l-4 border-blue-500 shadow-sm"
                }`}
              >
                <div className="flex justify-between items-center">
                  <h3
                    className={`font-medium ${
                      theme === "dark" ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {activity.title}
                  </h3>
                  <span
                    className={`text-xs ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {activity.time}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
