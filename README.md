<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LinkVerse

LinkVerse is a relationship-first workspace for mapping product ideas, research notes, and references in one visual system.

## Highlights

- Mind graphs, notes, and resources in one workspace
- Seed content for product strategy, launch planning, and architecture thinking
- Configurable Gemini Flash integration for graph generation and copilot actions

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Add your API key:
   - Recommended: copy `.env.example` to `.env.local` and fill in `VITE_AI_API_KEY`
   - Quick local edit: replace the placeholder in [`ai.config.ts`](./ai.config.ts)
3. Run the app:
   `npm run dev`

## AI Config

The default model is `gemini-2.5-flash`.

If you want to switch models or keep a visible fallback config in the repo, edit [`ai.config.ts`](./ai.config.ts). For normal local development, `.env.local` is the safer place for your real key.
