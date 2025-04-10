import { generateMetadata as generateSEOMetadata } from "@/lib/TDutils/seo";
import axios from "axios";
import { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { book?: string };
}): Promise<Metadata> {
  const defaultKeywords = [
    "chapter shelf",
    "chapters",
    "chapter list",
    "chapter collection",
    "chapter library",
  ];

  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/book`, {
      params: { slug: searchParams.book },
    });

    const book = response.data;
    const bookKeywords = book.keywords || book.tags || [];

    return generateSEOMetadata({
      title: `Toggle Dawn | Bookshelf${book.title ? ` | ${book.title}` : ""}`,
      description: book.description
        ? `${book.description.substring(0, 100)}...`
        : "Browse and manage your personal book collection on Toggle Dawn",
      ogImage: book.featuredImage || "/img/chapters.jpg",
      keywords: [...defaultKeywords, ...bookKeywords],
    });
  } catch (error) {
    return generateSEOMetadata({
      title: "Toggle Dawn | Bookshelf",
      description:
        "Browse and manage your personal book collection on Toggle Dawn",
      ogImage: "/img/chapters.jpg",
      keywords: defaultKeywords,
    });
  }
}

export default function CheptershelfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
