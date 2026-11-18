import type { CollectionSlug, GlobalSlug, Payload, PayloadRequest, File } from 'payload'

import { contact as contactPageData } from './contact-page'
import { image1 } from './image-1'
import { image2 } from './image-2'
import { imageHero1 } from './image-hero-1'

const collections: CollectionSlug[] = [
  'notes',
  'chapters',
  'books',
  'missions',
  'projects',
  'time-logs',
  'test-scores',
  'categories',
  'media',
  'pages',
  'search',
]

const globals: GlobalSlug[] = ['header', 'footer']

const categories = ['Technology', 'News', 'Finance', 'Design', 'Software', 'Engineering']

// Next.js revalidation errors are normal when seeding the database without a server running
// i.e. running `yarn seed` locally instead of using the admin UI within an active app
// The app is not running to revalidate the pages and so the API routes are not available
// These error messages can be ignored: `Error hitting revalidate route for...`
export const seed = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('Seeding database...')

  // we need to clear the media directory before seeding
  // as well as the collections and globals
  // this is because while `yarn seed` drops the database
  // the custom `/api/seed` endpoint does not
  payload.logger.info(`— Clearing collections and globals...`)

  // clear the database
  await Promise.all(
    globals.map((global) =>
      payload.updateGlobal({
        slug: global,
        data: {
          navItems: [],
        },
        depth: 0,
        context: {
          disableRevalidate: true,
        },
      }),
    ),
  )

  for (const collection of collections) {
    if (Boolean(payload.collections[collection]?.config?.versions)) {
      await payload.db.deleteVersions({ collection, req, where: {} })
    }
    await payload.db.deleteMany({ collection, req, where: {} })
  }

  payload.logger.info(`— Seeding demo author and user...`)

  await payload.delete({
    collection: 'users',
    depth: 0,
    where: {
      email: {
        equals: 'demo-author@example.com',
      },
    },
  })

  payload.logger.info(`— Seeding media...`)

  const [image1Buffer, image2Buffer, image3Buffer, hero1Buffer] = await Promise.all([
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/3.x/templates/website/src/endpoints/seed/image-post1.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/3.x/templates/website/src/endpoints/seed/image-post2.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/3.x/templates/website/src/endpoints/seed/image-post3.webp',
    ),
    fetchFileByURL(
      'https://raw.githubusercontent.com/payloadcms/payload/refs/heads/3.x/templates/website/src/endpoints/seed/image-hero1.webp',
    ),
  ])

  const [demoAuthor, image1Doc, image2Doc, image3Doc, imageHomeDoc] = await Promise.all([
    payload.create({
      collection: 'users',
      data: {
        name: 'Demo Author',
        email: 'demo-author@example.com',
        password: 'password',
        role: 'user',
      },
    }),
    payload.create({
      collection: 'media',
      data: image1,
      file: image1Buffer,
    }),
    payload.create({
      collection: 'media',
      data: image2,
      file: image2Buffer,
    }),
    payload.create({
      collection: 'media',
      data: image2,
      file: image3Buffer,
    }),
    payload.create({
      collection: 'media',
      data: imageHero1,
      file: hero1Buffer,
    }),
  ])

  await Promise.all(
    categories.map((category) =>
      payload.create({
        collection: 'categories',
        draft: false,
        data: {
          title: category,
          slug: category,
          type: 'general',
        },
      }),
    ),
  )

  payload.logger.info(`— Seeding ToggleDawn study materials...`)

  const projectDoc = await payload.create({
    collection: 'projects',
    data: {
      title: 'Target Exam 2026',
      description: 'Unified study plan and habit tracking for upcoming engineering competitive tests.',
      status: 'active',
    },
  })

  const missionDoc = await payload.create({
    collection: 'missions',
    draft: false,
    data: {
      title: 'Physics & Mechanics Mastery',
      type: 'study',
      status: 'active',
      targetHours: 120,
      targetConfig: { mode: 'total', totalTargetHours: 120 },
      project: projectDoc.id,
    },
  })

  const bookDoc = await payload.create({
    collection: 'books',
    draft: false,
    data: {
      title: 'Concepts of Physics - Volume 1',
      author: 'H. C. Verma',
      subject: 'Physics',
      totalPages: 462,
      slug: 'concepts-of-physics-vol-1',
      mission: missionDoc.id,
      _status: 'published',
    },
  })

  const chapterDoc = await payload.create({
    collection: 'chapters',
    draft: false,
    data: {
      title: 'Rotational Dynamics and Kinematics',
      pageCount: 38,
      progressStatus: 'in-progress',
      slug: 'rotational-dynamics',
      book: bookDoc.id,
      _status: 'published',
    },
  })

  await payload.create({
    collection: 'notes',
    draft: false,
    data: {
      title: 'Moment of Inertia Formulas & Parallel Axis Theorem',
      slug: 'moment-of-inertia-formulas',
      chapter: chapterDoc.id,
      _status: 'published',
      content: {
        root: {
          type: 'root',
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Moment of inertia formulas and theorems for competitive exams.',
                  version: 1,
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
        },
      },
    },
  })

  await payload.create({
    collection: 'test-scores',
    data: {
      examName: 'Physics Exam #1',
      subject: 'Physics',
      scoreObtained: 85,
      totalScore: 100,
      examDate: new Date().toISOString(),
      mission: missionDoc.id,
    },
  })

  payload.logger.info(`— Seeding pages...`)

  const [_, contactPage] = await Promise.all([
    payload.create({
      collection: 'pages',
      draft: false,
      data: {
        title: 'Home',
        slug: 'home',
        _status: 'published',
        hero: {
          type: 'none',
        },
        layout: [],
      },
    }),
    payload.create({
      collection: 'pages',
      draft: false,
      data: contactPageData(),
    }),
  ])

  payload.logger.info(`— Seeding globals...`)

  await Promise.all([
    payload.updateGlobal({
      slug: 'header',
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Study',
              url: '/books',
            },
          },
          {
            link: {
              type: 'reference',
              label: 'Contact',
              reference: {
                relationTo: 'pages',
                value: contactPage.id,
              },
            },
          },
        ],
      },
    }),
    payload.updateGlobal({
      slug: 'footer',
      data: {
        navItems: [
          {
            link: {
              type: 'custom',
              label: 'Admin',
              url: '/super-master',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Source Code',
              newTab: true,
              url: 'https://github.com/payloadcms/payload/tree/3.x/templates/website',
            },
          },
          {
            link: {
              type: 'custom',
              label: 'Payload',
              newTab: true,
              url: 'https://payloadcms.com/',
            },
          },
        ],
      },
    }),
  ])

  payload.logger.info('Seeded database successfully!')
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, {
    credentials: 'include',
    method: 'GET',
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`)
  }

  const data = await res.arrayBuffer()

  return {
    name: url.split('/').pop() || `file-${Date.now()}`,
    data: Buffer.from(data),
    mimetype: `image/${url.split('.').pop()}`,
    size: data.byteLength,
  }
}
