import { MetadataRoute } from 'next'

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
    updatedAt?: string;
}

interface Chapter {
    _id: {
        $oid: string;
    };
    chapterId: string;
    title: string;
    slug: string;
    category: string[];
    featuredImage: string;
    altImage: string;
    description: string;
    __v: number;
    book: string;
    updatedAt?: string;
}

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
    updatedAt?: string;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const backendUrl = process.env.NEXT_PUBLIC_API || 'http://localhost:3000/api'

    // Static routes configuration
    const staticRoutes = [
        {
            url: `${baseUrl}`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'daily' as const,
            priority: 1
        },
        {
            url: `${baseUrl}/bookshelf`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly' as const,
            priority: 0.8
        },
        {
            url: `${baseUrl}/chapters`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly' as const,
            priority: 0.8
        },
        {
            url: `${baseUrl}/noteshelf`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly' as const,
            priority: 0.8
        }
    ]

    try {
        // Dynamically fetch projects items
        const projectData = await fetch(`${backendUrl}/projects`).then(res => res.json())
        const projectRoutes = projectData.map((project: Project) => ({
            url: `${baseUrl}/project/${project.slug}`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly' as const,
            priority: 0.6
        }))

        // Dynamically fetch bookshelf items
        const bookData = await fetch(`${backendUrl}/books`).then(res => res.json())
        const bookRoutes = bookData.map((book: Book) => ({
            url: `${baseUrl}/book/${book.slug}`,
            lastModified: new Date(book.updatedAt || new Date()).toISOString(),
            changeFrequency: 'monthly' as const,
            priority: 0.6
        }))

        // Dynamically fetch chapters items
        const chaptersData = await fetch(`${backendUrl}/books`).then(res => res.json())
        const chaptersRoutes = chaptersData.map((chapter: Chapter) => ({
            url: `${baseUrl}/chapters/${chapter.slug}`,
            lastModified: new Date(chapter.updatedAt || new Date()).toISOString(),
            changeFrequency: 'monthly' as const,
            priority: 0.6
        }))

        // Dynamically fetch noteshelf items
        const notesData = await fetch(`${backendUrl}/notes`).then(res => res.json())
        const noteRoutes = notesData.map((note: any) => ({
            url: `${baseUrl}/note/${note.slug}`,
            lastModified: new Date(note.updatedAt || new Date()).toISOString(),
            changeFrequency: 'weekly' as const,
            priority: 0.7
        }))

        return [...staticRoutes, ...bookRoutes, ...noteRoutes, ...projectRoutes, ...chaptersRoutes]
    } catch (error) {
        // If dynamic data fetching fails, return only static routes
        console.error('Error generating sitemap:', error)
        return staticRoutes
    }
}
