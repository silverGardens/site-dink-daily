// Prebuild: fetch live brand config from n8n and write src/brand.config.json.
// Requires env vars: SITE_SLUG, N8N_WEBHOOK_GET_SITE_DETAIL, N8N_ADMIN_KEY
// If vars are absent (local dev), the existing brand.config.json is used as-is.
import { writeFileSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const configPath = join(__dirname, '../src/brand.config.json')

const slug = process.env.SITE_SLUG
const webhookUrl = process.env.N8N_WEBHOOK_GET_SITE_DETAIL
const adminKey = process.env.N8N_ADMIN_KEY ?? ''

if (!slug || !webhookUrl) {
  console.log('[brand] SITE_SLUG or N8N_WEBHOOK_GET_SITE_DETAIL not set — using existing brand.config.json')
  process.exit(0)
}

console.log(`[brand] Fetching config for site: ${slug}`)

try {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
    body: JSON.stringify({ site_id: slug }),
  })

  if (!res.ok) {
    console.warn(`[brand] Webhook returned ${res.status} — keeping existing brand.config.json`)
    process.exit(0)
  }

  const json = await res.json()
  const data = json.data ?? json
  const bc = data?.brand_config ?? {}
  const site = data?.site ?? {}

  // Read existing config so manually-set fields (navLinks, contactEmail, etc.) are preserved
  // when n8n doesn't store them yet.
  let existing = {}
  try { existing = JSON.parse(readFileSync(configPath, 'utf8')) } catch {}

  const config = {
    ...existing,
    siteName:        site.name              ?? existing.siteName        ?? '',
    tagline:         bc.tagline             ?? site.tagline             ?? existing.tagline        ?? '',
    description:     bc.description         ?? existing.description     ?? '',
    primaryColor:    bc.primary_color       ?? existing.primaryColor    ?? '#2563EB',
    secondaryColor:  bc.secondary_color     ?? existing.secondaryColor  ?? '#1C2128',
    accentColor:     bc.accent_color        ?? existing.accentColor     ?? '#E6EDF3',
    backgroundColor: bc.background_color    ?? existing.backgroundColor ?? '#0F1117',
    surfaceColor:    bc.surface_color       ?? existing.surfaceColor    ?? '#1E293B',
    textColor:       bc.text_color          ?? existing.textColor       ?? '#E6EDF3',
    mutedColor:      bc.muted_color         ?? existing.mutedColor      ?? '#94A3B8',
    fontHeading:     bc.font_heading        ?? existing.fontHeading     ?? 'Inter',
    fontBody:        bc.font_body           ?? existing.fontBody        ?? 'Inter',
    logoText:        site.name              ?? existing.logoText        ?? '',
    logoUrl:         bc.logo_url            ?? existing.logoUrl         ?? '',
    faviconUrl:      bc.favicon_url         ?? existing.faviconUrl      ?? '',
    twitterUrl:      bc.twitter_url         ?? existing.twitterUrl      ?? '',
    instagramUrl:    bc.instagram_url       ?? existing.instagramUrl    ?? '',
    youtubeUrl:      bc.youtube_url         ?? existing.youtubeUrl      ?? '',
    contactEmail:    bc.contact_email       ?? existing.contactEmail    ?? '',
    domain:          site.domain            ?? existing.domain          ?? '',
    slug:            site.slug              ?? existing.slug            ?? slug,
  }

  writeFileSync(configPath, JSON.stringify(config, null, 2))
  console.log(`[brand] brand.config.json updated for: ${site.name ?? slug}`)
} catch (err) {
  console.warn(`[brand] Fetch failed: ${err.message} — keeping existing brand.config.json`)
}
