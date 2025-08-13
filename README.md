Avatar Chat Frontend

Next.js (App Router) frontend for the Avatar Chat MVP, with i18n (next-intl), streaming chat UI, and modular structure.

Setup

1. Install dependencies
   npm install

2. Environment
   Create .env.local with:

   - NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

3. Run dev server
   npm run dev

Project structure (src/)

- app/
  - [locale]/layout.tsx: locale provider
  - [locale]/page.tsx: localized home page
  - [locale]/chat/[id]/page.tsx: chat UI
  - globals.css, layout.tsx, messages/
- components/: UI components (ChatComposer, ChatMessageList, etc.)
- hooks/: useChatStream (SSE), useConversationHistory
- lib/
  - api.ts: Axios instance (baseURL from env)
- config/
  - env.ts: NEXT_PUBLIC_BACKEND_URL accessor
- middleware.ts: next-intl locale middleware
- i18n.ts: next-intl messages loader

Notes

- Streaming uses SSE at `${NEXT_PUBLIC_BACKEND_URL}/api/chat/stream`
- API calls go through `api` client (baseURL from env)
- Local storage caches messages per locale and conversation

Deployment

- Vercel: Set NEXT_PUBLIC_BACKEND_URL env var
- Build: npm run build
- Start: npm start
