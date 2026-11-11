import { RequiredDataFromCollectionSlug } from 'payload'

export const contact = (): RequiredDataFromCollectionSlug<'pages'> => {
  return {
    slug: 'contact',
    _status: 'published',
    title: 'Contact ToggleDawn',
    hero: {
      type: 'lowImpact',
    },
    layout: [
      {
        blockType: 'faqBlock',
        heading: 'Contact & Support',
        description: 'Have questions about ToggleDawn or need help setting up your study space?',
        items: [
          {
            question: 'How does ToggleDawn help with ADHD focus?',
            answer:
              'ToggleDawn reduces executive dysfunction by keeping study materials, focus time tracking, and habit streaks in one unified low-friction interface with built-in forgiveness buffers.',
          },
          {
            question: 'How do I reach the team?',
            answer: 'You can email us directly at support@toggledawn.com.',
          },
        ],
      },
    ],
  }
}
