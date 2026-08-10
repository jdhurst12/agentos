# Stacked Up

A searchable, categorized reference for AI models, tools, chat apps, coding assistants, agents, web scrapers, image/video generation, voice tools, vector databases, Docker FOSS apps, and notable GitHub repos.

## Features

- Live search across all entries
- Category filter chips
- Ranked best-first within each category
- Cross-listing for tools that span multiple categories
- Tag badges (open-source, local, cloud, etc.)

## Structure

- `index.html` — self-contained single-page app (no build step)
- `data.js` — all catalog data; edit this to add/update entries
- `netlify.toml` — static site config for Netlify

## Adding Entries

Open `data.js` and add to the relevant category's `items` array:

```js
{
  name: "Tool Name",
  url: "https://example.com",
  desc: "2–4 sentence description of what it does and why it matters.",
  tags: ["open-source"],          // optional
  also: ["Other Category Title"], // optional cross-listing
}
```

Items are ranked by position — put the best/most popular entries first.

## Deploying

### Netlify (recommended)

1. Push to GitHub
2. Connect the repo in Netlify → **New site from Git**
3. Build command: *(leave blank)*
4. Publish directory: `.`

No build step needed — it's pure HTML + JS.
