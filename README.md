# AI Tools Daily

Niche content site — Astro static build, deployed on Netlify, managed via Brand Command Center.

## Local Setup
```
git clone <repo>
cp .env.example .env
# Set PUBLIC_NEWSLETTER_WEBHOOK to your n8n webhook URL
npm install
npm run dev
```

## Adding Blog Posts
Create a `.md` file in `src/content/blog/` with the correct frontmatter schema, then `git push`. Netlify auto-deploys.

## Updating Brand
Edit `src/brand.config.json`, then `git push`. Netlify auto-deploys. Brand config can also be updated via n8n automation triggered from the admin panel.

## Newsletter
The signup form submits to `PUBLIC_NEWSLETTER_WEBHOOK`. n8n receives `email`, `firstName`, `siteSlug`, and `source`, then stores the subscriber in a Data Table.
