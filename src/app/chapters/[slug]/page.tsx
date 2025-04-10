"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/lib/Loader/Loader";

interface PageParams {
  params: Promise<{
    slug: string;
  }>;
}

export default function ChapterPage({ params }: PageParams) {
  const router = useRouter();
  const resolvedParams = React.use(params);
  const { slug } = resolvedParams;

  useEffect(() => {
    router.push(`/noteshelf?chapter=${slug}`);
  }, [router, slug]);

  return (
    <div>
      <Loader />
    </div>
  );
}
