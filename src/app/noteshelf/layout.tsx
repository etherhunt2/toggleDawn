import { generateMetadata as generateSEOMetadata } from "@/lib/TDutils/seo";
import axios from "axios";
import { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { chapter?: string };
}): Promise<Metadata> {
  const defaultKeywords = [
    "note shelf",
    "notes",
    "note list",
    "note collection",
    "note library",
  ];

  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/chapter`, {
      params: { slug: searchParams.chapter },
    });

    const chapter = response.data;
    const chapterKeywords = chapter.keywords || chapter.tags || [];

    return generateSEOMetadata({
      title: `Toggle Dawn | Notes Shelf${
        chapter.title ? ` | ${chapter.title}` : ""
      }`,
      description: chapter.description
        ? `${chapter.description.substring(0, 100)}...`
        : "Browse and manage your personal book collection on Toggle Dawn",
      ogImage: chapter.featuredImage || "/img/notes.jpg",
      keywords: [...defaultKeywords, ...chapterKeywords],
    });
  } catch (error) {
    return generateSEOMetadata({
      title: "Toggle Dawn | Chapter Shelf",
      description:
        "Browse and manage your personal book collection on Toggle Dawn",
      ogImage: "/img/notes.jpg",
      keywords: defaultKeywords,
    });
  }
}

export default function NoteshelfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
