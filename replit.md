# Smart Aid Workspace

## Overview

Smart Aid is an AI-powered web platform for poverty assistance and resource accessibility in India. It connects economically weaker sections with government welfare schemes, nearby assistance centers, and job opportunities.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS
- **UI components**: shadcn/ui + Radix UI
- **Charts**: Recharts
- **Routing**: Wouter

## Artifacts

- **smart-aid** (`artifacts/smart-aid/`): Main React + Vite frontend at `/`
- **api-server** (`artifacts/api-server/`): Express API server at `/api`

## Key Bug Fixes Applied

- **Orval mutation wrapper**: All `.mutate()` calls now use `{ data: {...} }` wrapper required by Orval-generated hooks. Fixed in `eligibility.tsx`, `admin.tsx`, `documents.tsx`.
- **Admin users**: Now fetches real Clerk-registered users via Clerk Backend API. Falls back to seeded DB users if no Clerk users.
- **Homepage enriched**: Features real-time sections for Featured Schemes, Latest Jobs, and Nearby Centers loaded directly from API.

## Features

1. **Eligibility Checker** — 3-step wizard that matches users with welfare schemes based on age, income, category, disability status, etc.
2. **Scheme Browser** — Filterable list of government schemes with search
3. **Assistance Centers** — NGOs, hospitals, food distribution centers
4. **Employment** — Job listings with filters for daily wage, skilled, government, NGO positions
5. **Document Management** — Upload and track verification status of identity documents (status: pending/approved/rejected)
6. **Admin Dashboard** — Stats, scheme management, document approval workflow, user list, recent activity feed, bar chart
7. **Admin Login** — Separate admin portal login page (`/admin-login`) with distinct dark styling, shield icon, and different branding from user sign-in
8. **Multilingual** — English/Hindi toggle throughout the UI

## Database Tables

- `schemes` — Government welfare schemes
- `assistance_centers` — NGOs, hospitals, food centers
- `jobs` — Employment opportunities
- `documents` — User-uploaded identity documents
- `users` — Registered users
- `activity` — Platform activity feed

## Bug Fixes Applied

1. **Case-insensitive scheme search** — Changed `like` to `ilike` so searching "pm" finds "PM Awas Yojana"
2. **Partial city filter (assistance centers)** — Changed exact `eq` to `ilike` with wildcards for partial matches (e.g. "del" finds "Delhi")
3. **Partial city filter (jobs)** — Same fix applied; typing "mum" finds Mumbai jobs
4. **Admin "View scheme" button** — Eye icon now wrapped in wouter `<Link href="/schemes/:id">` for real navigation
5. **Admin "Add Scheme" dialog** — Full create-scheme form with all fields (name/Hindi, description/Hindi, type, category, ministry, age, income, benefit, URL, active toggle) wired to `useCreateScheme` mutation
6. **Document delete** — Added DELETE `/documents/:id` API endpoint, `DeleteDocumentParams` Zod schema, and a trash button per document on the documents page (auth-scoped — users can only delete their own documents)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/smart-aid run dev` — run frontend locally

## Authentication

### User Auth (Clerk)
- `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY` — auto-provisioned
- User sign in at `/sign-in`, sign up at `/sign-up` (Google OAuth + email)
- Documents page is auth-protected (redirects to `/sign-in` if signed out)
- API: documents endpoints protected with `requireAuth` middleware (`getAuth` from `@clerk/express`)
- Documents are stored per-user via `clerkUserId` column
- Layout shows "Sign In" button for guests, user avatar dropdown for signed-in users

### Admin Auth (Standalone Credentials)
- Completely separate from Clerk — own username/password system
- `ADMIN_USERNAME` and `ADMIN_PASSWORD` env vars define the single admin account
- `POST /api/admin/login` — validates credentials, returns HMAC-SHA256 signed token (24h TTL)
- `GET /api/admin/check` — validates stored token
- Token stored in localStorage under `smart_aid_admin_token`
- `requireAdmin` middleware on all `/admin/*` routes (users, documents, schemes CRUD)
- Admin login page at `/admin-login` — dark-themed, separate from user sign-in
- Admin dashboard at `/admin` — redirects to `/admin-login` if not authenticated
- `AdminAuthProvider` context wraps admin routes in App.tsx
- `SESSION_SECRET` env var required (no fallback — fail-fast on boot if missing)

## Object Storage

Replit App Storage (GCS-backed) for real document file uploads:
- `DEFAULT_OBJECT_STORAGE_BUCKET_ID`, `PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR` — auto-provisioned
- `POST /api/storage/uploads/request-url` — returns presigned PUT URL for direct-to-GCS upload
- `GET /api/storage/objects/*` — serves uploaded files
- Documents page does two-step upload: get presigned URL → PUT file to GCS → save metadata to DB
- `objectPath` stored in `documents` table for file retrieval

## Design

- Color palette: Deep teal primary (hsl 174 62% 32%) with warm gold accents on cool off-white background
- Typography: Playfair Display (serif headings) + Inter (sans body)
- Hero: Gradient text effect, radial gradient backgrounds, subtle border accents
- Cards: Clean white with soft shadows, hover lift effects
- Header: Frosted glass effect with backdrop blur, pill-style active nav items
- CTA: Dark gradient (slate-900 to primary) with luminous button shadows
- Admin portal: Dark theme with slate/teal accents, separate from main design

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
