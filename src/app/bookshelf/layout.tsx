import { generateMetadata as generateSEOMetadata } from "@/lib/TDutils/seo";
import axios from "axios";
import { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { project?: string };
}): Promise<Metadata> {
  const defaultKeywords = [
    "bookshelf",
    "books",
    "book list",
    "book collection",
    "library",
  ];

  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API}/project`, {
      params: { slug: searchParams.project },
    });

    const project = response.data;
    const projectKeywords = project.keywords || project.tags || [];

    return generateSEOMetadata({
      title: `Toggle Dawn | Bookshelf${
        project.title ? ` | ${project.title}` : ""
      }`,
      description: project.description
        ? `${project.description.substring(0, 100)}...`
        : "Browse and manage your personal book collection on Toggle Dawn",
      ogImage: project.featuredImage || "/img/books.jpg",
      keywords: [...defaultKeywords, ...projectKeywords],
    });
  } catch (error) {
    return generateSEOMetadata({
      title: "Toggle Dawn | Bookshelf",
      description:
        "Browse and manage your personal book collection on Toggle Dawn",
      ogImage: "/img/books.jpg",
      keywords: defaultKeywords,
    });
  }
}

export default function BookshelfLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
