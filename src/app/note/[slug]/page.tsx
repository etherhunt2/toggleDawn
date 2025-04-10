"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Footer } from "@/components/layout/Footer";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Tag,
  User,
} from "lucide-react";
import gsap from "gsap";
import axios from "axios";
import DOMPurify from "dompurify";
import Mammoth from "@/lib/HiveHynesUtils/Manmoth";
import DisplayPDF from "@/lib/HiveHynesUtils/DisplayPDF";
import ViewImage from "@/lib/HiveHynesUtils/ViewImage";
import ViewTable from "@/lib/HiveHynesUtils/ViewTable";
import ShowCode from "@/lib/HiveHynesUtils/ShowCode";
import Loader from "@/lib/Loader/Loader";

interface Note {
  _id: {
    $oid: string;
  };
  noteId: string;
  index: number;
  title: string;
  slug: string;
  category: string[] | undefined;
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
  user: string | null;
}

interface Category {
  _id: {
    $oid: string;
  };
  categoryId: string;
  title: string;
  slug: string;
  type: "notes";
  description: string;
  date: {
    $date: string;
  };
  __v: number;
  badge: string;
}

interface Params {
  slug: string;
  [key: string]: string;
}

interface Section {
  id: number;
  type: string;
  src?: string;
  alt?: string;
  content?: any;
}

export default function NotePage() {
  const { slug } = useParams<Params>();
  const { theme } = useTheme();
  const [note, setNote] = useState<Note>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [previousNote, setPreviousNote] = useState<Note>();
  const [nextNote, setNextNote] = useState<Note>();
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState("hidden");
  const [cursorText, setCursorText] = useState("");
  const { scrollYProgress } = useScroll();
  const [scrollProgress, setScrollProgress] = useState(0);
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroDetailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNote = async () => {
      if (!slug) return;
      // Fetch note data from the API
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/note`, {
        params: { slug },
      });
      if (res.data) {
        setNote(res.data);
        setLoading(false);
      } else {
        setNote(undefined);
        setLoading(false);
      }
    };
    fetchNote();
  }, [slug]);

  useEffect(() => {
    if (note && note.category) {
      // Fetch categories based on the note's categories
      const fetchCategories = async () => {
        try {
          // Send all category IDs as a comma-separated string
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/category`,
            {
              params: { ids: note.category?.join(",") || "" },
            }
          );

          const allCategories = response.data;

          // Filter out categories that are not of type "note"
          const filteredCategories: Category[] = allCategories.filter(
            (category: Category): boolean => category.type === "notes"
          );
          setCategories(filteredCategories);
        } catch (error) {
          console.error("Error fetching categories:", error);
          setCategories([]);
        }
      };
      fetchCategories();
    }
  }, [note]);

  useEffect(() => {
    const fetchNoteAndNavigation = async () => {
      if (!note) return;

      if (note.index === 0) {
        // For first note, only fetch the next note's title
        const nextRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/next-note`,
          {
            params: {
              index: note.index,
              slug: note.slug,
              chapter: note.chapter,
            },
          }
        );
        setNextNote(nextRes.data);
      } else {
        // For other notes, fetch both previous and next notes
        const [prevRes, nextRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API}/prev-note`, {
            params: {
              index: note.index,
              chapter: note.chapter,
            },
          }),
          axios.get(`${process.env.NEXT_PUBLIC_API}/next-note`, {
            params: {
              index: note.index,
              chapter: note.chapter,
            },
          }),
        ]);

        setPreviousNote(prevRes.data);
        setNextNote(nextRes.data);
      }
    };

    fetchNoteAndNavigation();
  }, [note]);

  // Handle scroll progress for reading indicator
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setScrollProgress(latest);
  });

  // Custom cursor for navigation
  const handleMouseMove = (e: React.MouseEvent) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };

  // GSAP animations for hero section using useEffect instead of useGSAP
  useEffect(() => {
    if (note && heroTitleRef.current && heroDetailsRef.current) {
      gsap.from(heroTitleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(heroDetailsRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
      });
    }
  }, [note]);

  // Handle swipe navigation on mobile
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 150 && nextNote) {
      // Swipe left - go to next note
      window.location.href = `/note/${nextNote.slug}`;
    }

    if (touchEnd - touchStart > 150 && previousNote) {
      // Swipe right - go to previous note
      window.location.href = `/note/${previousNote.slug}`;
    }
  };

  // Handle cursor variants for navigation
  const handlePrevEnter = () => {
    setCursorVariant("prev");
    setCursorText("Prev");
  };

  const handleNextEnter = () => {
    setCursorVariant("next");
    setCursorText("Next");
  };

  const handleNavLeave = () => {
    setCursorVariant("hidden");
    setCursorText("");
  };

  if (!note) {
    return (
      <main
        className={
          theme === "dark"
            ? "dark bg-gray-950 text-white"
            : "bg-gray-50 text-gray-900"
        }
      >
        <Navbar />
        <div className="container mx-auto px-4 pt-28 pb-20 flex items-center justify-center">
          <Loader />
        </div>
        <Footer />
      </main>
    );
  }

  if (note === undefined) {
    return (
      <main
        className={
          theme === "dark"
            ? "dark bg-gray-950 text-white"
            : "bg-gray-50 text-gray-900"
        }
      >
        <Navbar />
        <div className="container mx-auto px-4 pt-28 pb-20 flex items-center justify-center">
          <p> No Note Found </p>
        </div>
        <Footer />
      </main>
    );
  }

  const renderSection = (section: Section) => {
    switch (section.type) {
      case "image":
        return (
          <div key={section.id} className="input-group mb-3">
            <ViewImage
              fileName={section.src || ""}
              alt={`Preview ${section.alt || ""}`}
            />
          </div>
        );
      case "file":
        return (
          <div key={section.id} className="mb-3">
            {section.src && section.src.endsWith(".pdf") ? (
              <DisplayPDF
                fileUrl={section.src}
                handleClosePreview={() => {}}
                removeSection={() => {}}
              />
            ) : section.src ? (
              <Mammoth
                fileUrl={section.src}
                fileType="docx"
                handleClosePreview={() => {}}
                removeSection={() => {}}
              />
            ) : (
              <div>Error: File source is missing or invalid.</div>
            )}
          </div>
        );
      case "html":
        return (
          <div key={section.id} className="card mb-3">
            <div
              className="card-body"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(section.content),
              }}
            />
          </div>
        );
      case "editor":
        return (
          <div key={section.id} className="card mb-3">
            <div
              className="card-body"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(section.content),
              }}
            />
          </div>
        );
      case "table":
        return (
          section.content?.columns &&
          section.content?.data && (
            <div key={section.id} className="card mb-3">
              <div className="card-body">
                <ViewTable
                  columns={section.content.columns}
                  data={section.content.data}
                />
              </div>
            </div>
          )
        );
      case "code":
        return (
          <div key={section.id} className="card mb-3">
            <div className="card-body">
              <ShowCode code={section.content} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return loading ? (
    <Loader />
  ) : (
    <main
      className={
        theme === "dark"
          ? "dark bg-gray-950 text-white"
          : "bg-gray-50 text-gray-900"
      }
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseMove={handleMouseMove}
    >
      <Navbar />
      <Sidebar />

      {/* Rest of the JSX remains the same */}
      {/* Reading Progress Bar */}
      <motion.div
        className={`fixed top-0 left-0 right-0 h-1 z-50 ${
          theme === "dark" ? "bg-neon-yellow" : "bg-blue-600"
        }`}
        style={{ scaleX: scrollProgress, transformOrigin: "0%" }}
      />

      {/* Custom Cursor for Navigation */}
      <motion.div
        className="fixed hidden md:flex items-center justify-center rounded-full pointer-events-none z-50"
        variants={{
          default: {
            height: 10,
            width: 10,
            opacity: 0.4,
            backgroundColor:
              theme === "dark"
                ? "rgba(80, 170, 255, 0.5)"
                : "rgba(37, 99, 235, 0.5)",
          },
          hidden: {
            height: 10,
            width: 10,
            opacity: 0,
            backgroundColor:
              theme === "dark"
                ? "rgba(80, 170, 255, 0.5)"
                : "rgba(37, 99, 235, 0.5)",
          },
          prev: {
            height: 80,
            width: 80,
            backgroundColor:
              theme === "dark"
                ? "rgba(80, 170, 255, 0.7)"
                : "rgba(37, 99, 235, 0.7)",
          },
          next: {
            height: 80,
            width: 80,
            backgroundColor:
              theme === "dark"
                ? "rgba(80, 170, 255, 0.7)"
                : "rgba(37, 99, 235, 0.7)",
          },
        }}
        animate={cursorVariant}
        style={{
          left: cursorPosition.x - 40,
          top: cursorPosition.y - 40,
          x: "-50%",
          y: "-50%",
        }}
      >
        {cursorVariant !== "default" && (
          <div className="flex items-center justify-center text-white font-medium">
            {cursorVariant === "prev" && (
              <ChevronLeft className="mr-1" size={18} />
            )}
            {cursorText}
            {cursorVariant === "next" && (
              <ChevronRight className="ml-1" size={18} />
            )}
          </div>
        )}
      </motion.div>

      {/* Hero Section */}
      <section className="relative mt-12 md:mt-3 h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <div
            className={`absolute inset-0 ${
              theme === "dark" ? "bg-black/70" : "bg-black/50"
            }`}
          ></div>
        </div>

        <div className="relative h-full container mx-auto px-4 flex flex-col justify-center items-center text-white">
          <h1
            ref={heroTitleRef}
            className="text-4xl md:text-6xl font-bold text-center mb-6 max-w-4xl"
          >
            {note.title}
          </h1>

          <div
            ref={heroDetailsRef}
            className="flex flex-wrap justify-center gap-4 text-sm md:text-base opacity-80"
          >
            <div className="flex items-center">
              <Calendar size={16} className="mr-2" />
              <span>{new Date(note.date.$date).toLocaleDateString()}</span>
            </div>
            {note.user && (
              <div className="flex items-center">
                <User size={16} className="mr-2" />
                <span>{note.user}</span>
              </div>
            )}
            {categories && categories.length > 0 && (
              <div className="flex items-center">
                <Tag size={16} className="mr-2" />
                <span>
                  {categories.map((category, index) => (
                    <span key={category._id.$oid}>
                      {category.title}
                      {index < categories.length - 1 ? ", " : ""}
                    </span>
                  ))}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {note.content.map((section) => (
              <div key={section.id} className="mb-6">
                {renderSection(section)}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Previous/Next Navigation */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {previousNote && (
              <div
                onMouseEnter={handlePrevEnter}
                onMouseLeave={handleNavLeave}
                className="col-span-1"
              >
                <Link href={`/note/${previousNote.slug}`}>
                  <motion.div
                    whileHover={{ x: -10 }}
                    className={`h-full p-6 rounded-xl flex items-center cursor-pointer ${
                      theme === "dark"
                        ? "bg-gray-800 border border-neon-blue border-glow"
                        : "bg-white border border-gray-200 shadow-md"
                    }`}
                  >
                    <ArrowLeft
                      className={`mr-4 ${
                        theme === "dark" ? "text-neon-blue" : "text-blue-600"
                      }`}
                    />
                    <div>
                      <div className="text-sm opacity-70">Previous</div>
                      <h3
                        className={`font-semibold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {previousNote.title}
                      </h3>
                    </div>
                  </motion.div>
                </Link>
              </div>
            )}

            {nextNote && (
              <div
                onMouseEnter={handleNextEnter}
                onMouseLeave={handleNavLeave}
                className="col-span-1"
              >
                <Link href={`/note/${nextNote.slug}`}>
                  <motion.div
                    whileHover={{ x: 10 }}
                    className={`h-full p-6 rounded-xl flex items-center justify-end text-right cursor-pointer ${
                      theme === "dark"
                        ? "bg-gray-800 border border-neon-blue border-glow"
                        : "bg-white border border-gray-200 shadow-md"
                    }`}
                  >
                    <div>
                      <div className="text-sm opacity-70">Next</div>
                      <h3
                        className={`font-semibold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {nextNote.title}
                      </h3>
                    </div>
                    <ArrowRight
                      className={`ml-4 ${
                        theme === "dark" ? "text-neon-blue" : "text-blue-600"
                      }`}
                    />
                  </motion.div>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
