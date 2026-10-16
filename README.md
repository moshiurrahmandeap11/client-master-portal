# Chakri Sheba Client (Frontend UI)
**Next.js 15 App Router Frontend for Chakri Sheba Platform**

## Tech Stack
* **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
* **Styling:** Tailwind CSS + Lucide Icons
* **Typography:** `SolaimanLipi` everywhere (17px buttons, 16px body text)
* **SEO:** Server-Side Metadata, JSON-LD Schema.org JobPosting

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Check `.env.local`:
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3050
NEXT_PUBLIC_API_URL=http://localhost:6969/api
INTERNAL_BACKEND_URL=http://localhost:6969
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3050](http://localhost:3050) in your browser. All API requests (`/api/*` and `/uploads/*`) are automatically proxied to the backend server running on `http://localhost:6969`.

## Build for Production
```bash
npm run build
npm start
```
