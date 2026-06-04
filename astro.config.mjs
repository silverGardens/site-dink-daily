import { readFileSync } from 'fs'
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'

// prebuild has already written brand.config.json with the live domain if available.
let site = 'https://site-dink-daily.netlify.app'
try {
  const brand = JSON.parse(readFileSync('./src/brand.config.json', 'utf8'))
  if (brand.domain) site = `https://${brand.domain}`
} catch {}

export default defineConfig({
  site,
  integrations: [sitemap()],
  output: 'static',
  vite: {
    plugins: [tailwindcss()]
  }
})
