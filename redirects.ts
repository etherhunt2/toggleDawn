import type { NextConfig } from 'next'

export const redirects: NextConfig['redirects'] = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header' as const,
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  return [
    {
      source: '/admin',
      destination: '/super-master',
      permanent: false,
    },
    {
      source: '/admin/:path*',
      destination: '/super-master/:path*',
      permanent: false,
    },
    internetExplorerRedirect,
  ]
}
