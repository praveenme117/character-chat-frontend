Avatar Chat Frontend

Next.js frontend for the Avatar Chat MVP, displaying avatars and a chat interface.
Setup

Install dependencies: npm install
Set NEXT_PUBLIC_BACKEND_URL in .env.local (e.g., http://localhost:3001).
Run dev server: npm run dev

Structure

src/app/avatars.ts: Avatar URLs (sync with backend Avatar table).
src/app/page.tsx: Home page with avatar selection.
src/app/chat/[id]/page.tsx: Chat interface with streaming.
src/app/components/ErrorMessage.tsx: Error display component.

Deployment

Push to GitHub.
Deploy to Vercel: vercel --prod.
Set NEXT_PUBLIC_BACKEND_URL in Vercel dashboard.
