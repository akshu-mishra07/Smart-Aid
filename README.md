# Smart Aid

An AI-powered web platform for India that connects marginalized communities with **44 government welfare schemes**, **43 assistance centers**, and **35 job opportunities**. Built with multilingual support (English/Hindi), an eligibility checker, document verification workflow, and a secure admin dashboard.

![Smart Aid](https://img.shields.io/badge/Platform-India-green) ![License](https://img.shields.io/badge/License-MIT-blue) ![Node](https://img.shields.io/badge/Node.js-v20+-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)

---

## Features

- **Eligibility Checker** -- 3-step wizard matching users with welfare schemes based on age, income, category, disability status
- **Scheme Browser** -- Filterable, searchable list of government welfare schemes
- **Assistance Center Locator** -- Find nearby NGOs, hospitals, food distribution centers, shelters, legal aid
- **Job Board** -- Daily wage, government, skilled, NGO, and healthcare job listings
- **Document Management** -- Upload identity documents (Aadhar, PAN, certificates) with admin approval workflow
- **Admin Dashboard** -- Platform statistics, scheme management, document review, user list
- **Multilingual** -- Full English/Hindi toggle throughout the UI
- **Responsive Design** -- Works on desktop, tablet, and mobile

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | pnpm workspaces |
| **Frontend** | React 19, Vite, Tailwind CSS 4, shadcn/ui, Wouter |
| **Backend** | Express 5, TypeScript |
| **Database** | PostgreSQL + Drizzle ORM |
| **Auth (Users)** | Clerk (OAuth + email) |
| **Auth (Admin)** | Standalone credentials with HMAC-SHA256 tokens |
| **API Client** | Orval (auto-generated from OpenAPI spec) |
| **Validation** | Zod |
| **Charts** | Recharts |

---

## Project Structure

```
smart-aid/
├── artifacts/
│   ├── api-server/          # Express API server
│   ├── smart-aid/           # React + Vite frontend
│   └── mockup-sandbox/      # Component preview server (dev only)
├── lib/
│   ├── api-spec/            # OpenAPI spec + Orval codegen config
│   ├── api-client-react/    # Auto-generated React Query hooks
│   ├── api-zod/             # Auto-generated Zod validation schemas
│   └── db/                  # Drizzle ORM schema + database client
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

---

## Prerequisites

- **Node.js** v20 or higher
- **pnpm** v10 or higher (`npm install -g pnpm`)
- **PostgreSQL** 14 or higher
- **Clerk account** (free tier works) -- for user authentication

---

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/akshu-mishra07/Smart-Aid.git
cd Smart-Aid
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up PostgreSQL

Create a PostgreSQL database:

```bash
# Using psql
createdb smartaid

# Or using psql CLI
psql -U postgres -c "CREATE DATABASE smartaid;"
```

### 4. Set Up Clerk

1. Go to [clerk.com](https://clerk.com) and create a new application
2. In your Clerk dashboard, go to **API Keys**
3. Copy the **Publishable Key** and **Secret Key**

### 5. Configure Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/smartaid

# Clerk Authentication (Users)
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key

# Admin Authentication (Standalone)
ADMIN_USERNAME=smartaid_admin
ADMIN_PASSWORD=SmartAid@2026
SESSION_SECRET=your_random_secret_string_here

# Server
PORT=8080
NODE_ENV=development
```

Generate a secure `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 6. Push Database Schema

```bash
pnpm --filter @workspace/db run push
```

This creates all required tables: `schemes`, `jobs`, `assistance_centers`, `documents`, `users`, `activity`.

### 7. Generate API Client

```bash
pnpm --filter @workspace/api-spec run codegen
```

### 8. Start the Application

Open two terminal windows:

**Terminal 1 -- API Server:**
```bash
pnpm --filter @workspace/api-server run dev
```

The API server will start on `http://localhost:8080`. On first run, it automatically seeds the database with 44 schemes, 43 assistance centers, and 35 jobs.

**Terminal 2 -- Frontend:**
```bash
pnpm --filter @workspace/smart-aid run dev
```

The frontend will start on a local port (shown in terminal output).

### 9. Access the Application

- **Frontend:** `http://localhost:5173` (or the port shown in terminal)
- **API:** `http://localhost:8080/api`
- **Admin Login:** `http://localhost:5173/admin-login`
  - Username: `smartaid_admin`
  - Password: `SmartAid@2026`

---

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm run build` | Typecheck + build all packages |
| `pnpm run typecheck` | Run TypeScript type checking |
| `pnpm --filter @workspace/api-server run dev` | Start API server (dev mode) |
| `pnpm --filter @workspace/smart-aid run dev` | Start frontend (dev mode) |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API client from OpenAPI spec |
| `pnpm --filter @workspace/db run push` | Push database schema changes |

---

## Database Schema

| Table | Description |
|-------|-------------|
| `schemes` | Government welfare schemes with eligibility criteria |
| `jobs` | Employment opportunities across India |
| `assistance_centers` | NGOs, hospitals, food centers, shelters |
| `documents` | User-uploaded identity documents with approval status |
| `users` | Registered user profiles |
| `activity` | Platform activity audit log |

---

## Authentication

### User Auth (Clerk)
- Sign in at `/sign-in`, sign up at `/sign-up`
- Supports Google OAuth and email/password
- Required for document uploads

### Admin Auth (Standalone)
- Completely separate from user authentication
- Login at `/admin-login` with username/password
- HMAC-SHA256 signed tokens with 24-hour expiry
- All admin API endpoints are protected with `requireAdmin` middleware

---

## API Endpoints

### Public
- `GET /api/schemes` -- List schemes (with filters)
- `GET /api/schemes/:id` -- Get scheme details
- `GET /api/jobs` -- List jobs (with filters)
- `GET /api/jobs/:id` -- Get job details
- `GET /api/assistance-centers` -- List assistance centers (with filters)
- `GET /api/stats/summary` -- Platform statistics
- `GET /api/eligibility/check` -- Check scheme eligibility

### Authenticated (Clerk)
- `GET /api/documents` -- List user's documents
- `POST /api/documents` -- Upload document metadata
- `DELETE /api/documents/:id` -- Delete own document

### Admin (Standalone Token)
- `POST /api/admin/login` -- Admin login
- `GET /api/admin/check` -- Verify admin session
- `GET /api/admin/users` -- List all users
- `GET /api/admin/documents` -- List all documents
- `PATCH /api/admin/documents/:id/status` -- Approve/reject document
- `POST /api/admin/schemes` -- Create scheme
- `PUT /api/admin/schemes/:id` -- Update scheme
- `DELETE /api/admin/schemes/:id` -- Delete scheme

---

## Troubleshooting

### Database connection fails
- Ensure PostgreSQL is running: `pg_isready`
- Verify your `DATABASE_URL` format: `postgresql://user:password@host:port/database`

### Clerk errors
- Ensure both `CLERK_SECRET_KEY` and `VITE_CLERK_PUBLISHABLE_KEY` are set
- The publishable key starts with `pk_test_` (development) or `pk_live_` (production)

### Admin login fails
- Ensure `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `SESSION_SECRET` are set
- `SESSION_SECRET` is required -- the server will crash on startup without it

### API client errors after schema changes
- Run `pnpm --filter @workspace/api-spec run codegen` to regenerate the API client

---

## License

MIT
