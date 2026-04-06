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

## Features

1. **Eligibility Checker** — 3-step wizard that matches users with welfare schemes based on age, income, category, disability status, etc.
2. **Scheme Browser** — Filterable list of government schemes with search
3. **Assistance Centers** — NGOs, hospitals, food distribution centers
4. **Employment** — Job listings with filters for daily wage, skilled, government, NGO positions
5. **Document Management** — Upload and track verification status of identity documents
6. **Admin Dashboard** — Stats, scheme management, user list, recent activity feed, bar chart
7. **Multilingual** — English/Hindi toggle throughout the UI

## Database Tables

- `schemes` — Government welfare schemes
- `assistance_centers` — NGOs, hospitals, food centers
- `jobs` — Employment opportunities
- `documents` — User-uploaded identity documents
- `users` — Registered users
- `activity` — Platform activity feed

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/smart-aid run dev` — run frontend locally

## Design

- Color palette: Warm saffron/amber primary (#B8681A) on cream background
- Typography: Playfair Display (serif headings) + Inter (sans body)
- Theme: Light mode (warm cream) with dark mode support

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
