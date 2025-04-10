import { generateMetadata as generateSEOMetadata } from "@/lib/TDutils/seo";
import axios from "axios";
import { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { note?: string };
}): Promise<Metadata> {
  const defaultKeywords = [
    "note",
    "notes",
    "note details",
    "note content",
    "note library",
  ];

  try {
    console.log("searchParams: ", searchParams.note);
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/note`, {
      params: { slug: searchParams.note },
    });

    const note = response.data;
    const noteKeywords = note.keywords || note.tags || [];

    return generateSEOMetadata({
      title: `Toggle Dawn | Note${note.title ? ` | ${note.title}` : ""}`,
      description: note.description
        ? `${note.description.substring(0, 100)}...`
        : "Explore detailed content of your notes on Toggle Dawn",
      ogImage: note.featuredImage || "/img/notes.jpg",
      keywords: [...defaultKeywords, ...noteKeywords],
    });
  } catch (error) {
    return generateSEOMetadata({
      title: "Toggle Dawn | Note",
      description: "Explore detailed content of your notes on Toggle Dawn",
      ogImage: "/img/notes.jpg",
      keywords: defaultKeywords,
    });
  }
}

export default function NoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
