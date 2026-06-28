# Bokra Stay

Bokra Stay is a full-stack, production-ready rental marketplace built specifically for the Ethiopian market, featuring property listings, host verification, secure bookings, and AI-powered reviews.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma
- **Storage:** Supabase Storage (Buckets: `avatars`, `documents`, `properties`)
- **Payments:** Chapa
- **AI Integration:** Groq (Review Summarization)
- **Email:** Resend
- **Styling:** Tailwind CSS + Shadcn UI

## 🚀 Production Deployment Guide

Before deploying this application to production (e.g., Vercel), ensure the following environment variables and configurations are set.

### 1. Database & Prisma
Ensure you run `npx prisma db push` against your production database to create all tables (including the newly added `Favorite` model).
```env
DATABASE_URL="postgres://..."
DIRECT_URL="postgres://..."
```

### 2. Payments (Chapa)
Replace the stub keys with real production keys from your Chapa Dashboard.
```env
CHAPA_SECRET_KEY="CHASECK_TEST-..."
```
**Important Webhook Setup:** 
In your Chapa dashboard settings, set your webhook URL to:
`https://<your-production-domain>.com/api/payments/webhook`

### 3. Email (Resend)
Add your API key to enable production email sending. If left empty, the app will gracefully mock emails to the console.
```env
RESEND_API_KEY="re_..."
```

### 4. AI (Groq)
Replace the stub key with a real production API key.
```env
GROQ_API_KEY="gsk_..."
```

### 5. Storage (Supabase)
Ensure your Supabase project has public buckets created for:
- `avatars`
- `documents`
- `properties`
```env
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

## Running Locally

```bash
npm install
npm run dev
```
