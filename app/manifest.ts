/**
 * Web App Manifest
 * Week 2 Priority 5.2: PWA Capabilities
 * Provides configuration for Progressive Web App functionality
 */

import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Lewis Perez - Senior Software Engineer Portfolio',
    short_name: 'Lewis Perez',
    description: 'AI-powered portfolio and digital twin of Lewis Perez, Senior Software Engineer specializing in full-stack development, cloud architecture, and AI integration.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['portfolio', 'technology', 'ai'],
    lang: 'en-US',
    dir: 'ltr',
  };
}
