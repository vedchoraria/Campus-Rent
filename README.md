# CampusRent

<div align="center">

![CampusRent](https://img.shields.io/badge/CampusRent-Campus%20Rental%20Platform-4F46E5?style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)

**A production-deployed, full-stack peer-to-peer campus rental platform.**  
Built on a lifecycle-driven booking engine, JWT-protected APIs, and a database-first synchronization architecture.

[**Live Demo →**](https://campus-rent-sigma.vercel.app) [**Backend Health →**](https://campus-rent-m98g.onrender.com/health)

</div>

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Problem Statement](#2-problem-statement)
3. [Key Features](#3-key-features)
4. [Tech Stack](#4-tech-stack)
5. [System Architecture](#5-system-architecture)
6. [Booking Lifecycle Engine](#6-booking-lifecycle-engine)
7. [Role-Based Booking Workflows](#7-role-based-booking-workflows)
8. [Authentication Flow](#8-authentication-flow)
9. [Database Design](#9-database-design)
10. [API Architecture](#10-api-architecture)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Folder Structure](#12-folder-structure)
13. [Environment Variables](#13-environment-variables)
14. [Local Development Setup](#14-local-development-setup)
15. [Production Deployment](#15-production-deployment)
16. [Roadmap](#16-roadmap)
17. [Screenshots](#17-screenshots)
18. [License](#18-license)

---

## 1. Project Overview

CampusRent is a full-stack, production-deployed campus rental marketplace that enables students to list, discover, and rent items from one another — textbooks, electronics, equipment, and more. 

The platform evolved from a frontend-only prototype into a hardened full-stack system with a production-grade booking lifecycle engine, persistent database-backed state, and role-segregated rental workflows. Every booking transition is enforced at the API layer with overlap conflict prevention, guarded state machine transitions, and audit-stamped cancellation metadata. The database is the canonical source of truth; the frontend is a pure consumer of backend state.

---

## 2. Problem Statement

Campus students frequently need items — textbooks, tools, cameras, sports gear — for short periods. Buying is wasteful. Borrowing informally is unreliable. Existing rental platforms are not student-context-aware and carry no trust, lifecycle transparency, or conflict enforcement.

CampusRent solves this by providing:

- A structured marketplace with searchable, filterable listings
- A lifecycle-tracked rental system with explicit handoff and return stages
- Role-segregated dashboards for owners and borrowers
- Overlap-safe booking enforcement to prevent double-renting
- An audit trail on every booking action, including cancellations

---

## 3. Key Features

**Marketplace**
- Filterable, sortable item grid with category and availability controls
- Individual listing pages with rental pricing, security deposit, and availability window
- Listing visibility controls for owners (hide/unhide without deleting)

**Booking Lifecycle**
- Eight-stage booking state machine: `requested → approved → item_given → ongoing → return_pending → completed` (with `cancelled` and `rejected` as terminal failure paths)
- Overlap conflict detection enforced at approval time against all active confirmed bookings
- Guarded transitions that prevent invalid state jumps regardless of client input

**Owner Dashboard**
- Active listings management, pending approval queue, rental history
- Lifecycle action controls: approve, reject, confirm handoff, confirm return
- Cancellation audit trail with timestamp and actor metadata

**Borrower Dashboard**
- Tabbed views across Pending, Upcoming, Ongoing, and History
- Borrower-side lifecycle controls: confirm receipt, initiate return request
- Full booking history including completed, cancelled, and rejected records

**Authentication & Security**
- JWT-based authentication with persistent login state
- Token-aware protected route middleware on all backend APIs
- Environment-driven CORS enforcement with no localhost fallback in production

**Infrastructure**
- Frontend on Vercel, backend on Render, database on Neon PostgreSQL
- Prisma-managed schema with B-Tree indexes on high-frequency relational fields
- Deployment-safe `postinstall` hooks for automated Prisma client generation

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Styling | CSS Modules, custom UI primitives |
| State Management | React Context API (`ListingContext`, `BookingContext`) |
| Backend | Node.js, Express.js |
| ORM | Prisma ORM |
| Database | Neon serverless PostgreSQL |
| Auth | JWT (JSON Web Tokens) |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
| Database Hosting | Neon |
| Linting | ESLint v9 (flat config) |

---

## 5. System Architecture

> For complete architecture documentation including the full booking state machine, auth sequence diagram, ER schema, and CORS flow — see [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

### Deployment Topology

```mermaid
graph TD
    subgraph Vercel["🌐 Vercel (Frontend)"]
        FE["React + Vite SPA"]
    end

    subgraph Render["⚙️ Render (Backend)"]
        API["Express.js API Server"]
        MW["JWT Middleware · Role Validation · Guard Checks"]
        PRM["Prisma ORM Client"]
        API --> MW --> PRM
    end

    subgraph Neon["🗄️ Neon (PostgreSQL)"]
        DB[("PostgreSQL · User · Listing · Booking")]
    end

    FE -->|"HTTPS · JWT Bearer"| API
    PRM -->|"Connection Pool · SSL"| DB
```

### Frontend Request Flow

```mermaid
graph LR
    MP["Marketplace"] --> CTX
    OD["Owner Dashboard"] --> CTX
    BD["Borrower Dashboard"] --> CTX

    subgraph CTX["React Context Layer"]
        LC["ListingContext"]
        BC["BookingContext"]
    end

    CTX --> SVC["API Service Layer"]
    SVC -->|"HTTPS"| API["Express.js Backend"]
    API -->|"JSON Response"| SVC
    SVC -->|"State Refetch"| CTX
```

**The frontend never reads from local state after a mutation.** Every write is followed by a backend refetch — the database is the canonical source of truth.

### Key Architectural Decisions

- **Database as source of truth** — No booking mutation is committed until persisted in Neon and refetched. The frontend never reads from its own local state after a mutation.
- **Decoupled layers** — `frontend/` and `backend/` are fully independent deployable units with no shared modules.
- **API service abstraction** — All frontend API calls route through a centralized service layer handling auth token injection, error normalization, and base URL resolution.
- **Context as projection layer** — React contexts are view-layer projections of backend state, not independent state stores.

---

## 6. Booking Lifecycle Engine

The booking engine is the core of CampusRent. Rather than a naive two-state `pending/confirmed` model, it implements an eight-stage lifecycle that mirrors real-world rental handoff and return processes.

```
                         ┌──────────┐
                         │ requested│  ← Borrower submits request
                         └────┬─────┘
                    ┌─────────┴──────────┐
                    ▼                    ▼
              ┌──────────┐         ┌──────────┐
              │ approved │         │ rejected │  ← Owner decision
              └────┬─────┘         └──────────┘
                   │
                   ▼
            ┌────────────┐
            │ item_given │  ← Owner confirms handoff
            └─────┬──────┘
                  │
                  ▼
            ┌──────────┐
            │  ongoing │  ← Borrower confirms receipt
            └─────┬────┘
                  │
                  ▼
          ┌───────────────┐
          │ return_pending│  ← Borrower initiates return
          └──────┬────────┘
                 │
                 ▼
           ┌──────────┐
           │completed │  ← Owner confirms return
           └──────────┘

     At any active stage:
           ┌──────────┐
           │cancelled │  ← Either party, with audit stamp
           └──────────┘
```

**Overlap conflict prevention** is enforced at the `requested → approved` transition. Before any approval is committed, the engine queries all bookings for the same listing in states `approved`, `item_given`, `ongoing`, or `return_pending` and validates that the requested date range does not intersect. Overlapping requests are rejected with a structured error response. States `requested`, `cancelled`, `rejected`, and `completed` are explicitly excluded from conflict checks.

**Guarded transitions** are enforced on every `PATCH` request to the booking endpoint. The backend validates:

1. The current booking status is a valid predecessor for the requested transition.
2. The requesting user holds the correct role for that transition (owner vs. borrower).
3. No invalid intermediate state can be reached by replaying or replying requests.

**Cancellation audit metadata** — `cancelledBy` and `cancelledAt` — is stamped at persistence time on every cancellation, preserving which party initiated and when.

---

## 7. Role-Based Booking Workflows

Booking actions are strictly partitioned by role. No route or controller executes a lifecycle action unless the JWT-authenticated user matches the required actor for that transition.

| Transition | Actor | Guard Condition |
|---|---|---|
| `requested → approved` | Owner | Overlap check passes, requester !== owner |
| `requested → rejected` | Owner | Active request exists |
| `approved → item_given` | Owner | Booking in `approved` state |
| `item_given → ongoing` | Borrower | Booking in `item_given` state |
| `ongoing → return_pending` | Borrower | Booking in `ongoing` state |
| `return_pending → completed` | Owner | Booking in `return_pending` state |
| `* → cancelled` | Owner or Borrower | Booking not already terminal |

This table is enforced at the API middleware layer — the frontend renders affordances based on role and status, but the backend independently re-validates every transition attempt.

---

## 8. Authentication Flow

```
User submits credentials
         │
         ▼
  POST /auth/login
         │
  ┌──────▼──────────┐
  │  Validate user  │
  │  bcrypt compare │
  └──────┬──────────┘
         │
  ┌──────▼──────────────────────┐
  │  Sign JWT                   │
  │  { userId, email, role }    │
  │  Expiry: configurable       │
  └──────┬──────────────────────┘
         │
  Token returned to client
         │
  Client stores token (memory / localStorage)
         │
  All subsequent requests:
  Authorization: Bearer <token>
         │
  ┌──────▼──────────────────────┐
  │  JWT Middleware              │
  │  Verify signature            │
  │  Extract userId + role       │
  │  Attach to req.user          │
  └──────┬──────────────────────┘
         │
  Route handler executes
```

- Registration hashes passwords with bcrypt before persistence.
- JWTs are stateless — no session store is required on the backend.
- Protected routes return `401 Unauthorized` for missing or invalid tokens.
- Role information embedded in the token is used for lifecycle guard validation without additional database lookups.

---

## 9. Database Design

The schema is managed entirely through Prisma migrations against Neon PostgreSQL. All enums are Prisma-backed to prevent invalid string states from entering the database.

```
┌──────────────────────────────────────────┐
│ User                                     │
│──────────────────────────────────────────│
│ id           String   @id @default(uuid) │
│ email        String   @unique            │
│ password     String   (hashed)           │
│ name         String                      │
│ createdAt    DateTime @default(now())    │
│                                          │
│ listings     Listing[]                   │
│ bookings     Booking[] (as borrower)     │
│ ownedBookings Booking[] (as owner)       │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ Listing                                  │
│──────────────────────────────────────────│
│ id              String  @id              │
│ title           String                   │
│ description     String                   │
│ pricePerDay     Float                    │
│ securityDeposit Float                    │
│ category        String                   │
│ status          ListingStatus (enum)     │
│ ownerId         String  @@index          │
│                                          │
│ images          ListingImage[]           │
│ bookings        Booking[]                │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ ListingImage                             │
│──────────────────────────────────────────│
│ id        String @id                     │
│ url       String                         │
│ listingId String @@index                 │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│ Booking                                  │
│──────────────────────────────────────────│
│ id                    String  @id        │
│ listingId             String  @@index    │
│ borrowerId            String             │
│ ownerId               String             │
│ startDate             DateTime           │
│ endDate               DateTime           │
│ status                BookingStatus      │
│ totalPriceSnapshot    Float              │  ← Historical integrity
│ securityDepositSnapshot Float            │  ← Historical integrity
│ cancelledBy           String?            │
│ cancelledAt           DateTime?          │
│ createdAt             DateTime           │
└──────────────────────────────────────────┘

enum BookingStatus {
  requested | approved | item_given | ongoing
  return_pending | completed | cancelled | rejected
}

enum ListingStatus {
  active | hidden | deleted
}
```

**Design decisions:**

- `totalPriceSnapshot` and `securityDepositSnapshot` are denormalized onto the Booking record at creation time. This preserves historical booking costs even if the listing's pricing changes after the booking is made.
- `ownerId` is duplicated onto Booking (beyond the foreign key via Listing) to enable direct owner-based queries without joining through Listing — critical for dashboard performance at scale.
- B-Tree indexes on `ownerId` and `listingId` cover the most frequent query patterns: owner dashboard loads and overlap conflict checks.

---

## 10. API Architecture

The backend exposes a RESTful API organized by resource. All mutating routes require a valid JWT.

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Register a new user | No |
| `POST` | `/auth/login` | Login and receive JWT | No |
| `GET` | `/auth/me` | Get authenticated user profile | Yes |

### Listings

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/listings` | Get all visible listings (marketplace) | No |
| `GET` | `/listings/:id` | Get single listing detail | No |
| `POST` | `/listings` | Create a new listing | Yes (owner) |
| `PATCH` | `/listings/:id` | Update listing fields or visibility | Yes (owner) |
| `DELETE` | `/listings/:id` | Soft-delete a listing | Yes (owner) |
| `GET` | `/listings/mine` | Get authenticated user's listings | Yes |

### Bookings

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/bookings` | Create a booking request | Yes (borrower) |
| `GET` | `/bookings/borrower` | Get all bookings as borrower | Yes |
| `GET` | `/bookings/owner` | Get all bookings as owner | Yes |
| `PATCH` | `/bookings/:id/status` | Execute a lifecycle transition | Yes (role-guarded) |
| `GET` | `/bookings/:id` | Get single booking detail | Yes |

**CORS policy** is environment-driven. In production, only the Vercel frontend origin is allowlisted. The backend rejects all cross-origin requests from unlisted origins — there is no localhost fallback active in the production environment.

---

## 11. Deployment Architecture

```
┌─────────────────────┐     HTTPS      ┌──────────────────────┐
│   Vercel (Frontend) │◄──────────────►│   Render (Backend)   │
│                     │                │                       │
│  React + Vite SPA   │                │  Express.js API       │
│  Auto-deploy: main  │                │  Auto-deploy: main    │
│                     │                │  postinstall: prisma  │
│  VITE_API_URL=       │                │  generate             │
│  render backend URL │                │                       │
└─────────────────────┘                └──────────┬────────────┘
                                                   │
                                          Prisma Client
                                                   │
                                       ┌───────────▼────────────┐
                                       │   Neon PostgreSQL       │
                                       │   (Serverless Postgres) │
                                       │                         │
                                       │   Connection pooling    │
                                       │   Branching support     │
                                       └─────────────────────────┘
```

**Why this stack:**

- **Vercel** handles React/Vite SPA deployments with zero configuration, automatic preview deployments per branch, and edge CDN delivery.
- **Render** provides a persistent Node.js runtime suitable for Express.js servers — unlike serverless functions, it maintains the Prisma connection pool efficiently. The `postinstall` hook ensures `prisma generate` runs automatically on every deploy without manual steps.
- **Neon** is a serverless PostgreSQL provider with instant branching for staging environments, autoscaling, and connection pooling — directly compatible with Prisma's connection URL format.

---

## 12. Folder Structure

```
Campus-Rent/
├── frontend/                         # React + Vite SPA
│   ├── src/
│   │   ├── components/               # Reusable UI primitives
│   │   │   ├── ui/                   # Buttons, badges, cards, modals
│   │   │   └── layout/               # Navbar, footer, dashboard shell
│   │   ├── context/
│   │   │   ├── ListingContext.jsx     # Listing state + API integration
│   │   │   └── BookingContext.jsx     # Booking lifecycle state + API
│   │   ├── pages/
│   │   │   ├── Marketplace/          # Discovery, filtering, grid
│   │   │   ├── ListingDetail/        # Item detail + booking initiation
│   │   │   ├── Dashboard/
│   │   │   │   ├── MyListings/       # Owner listing management
│   │   │   │   └── MyBorrowings/     # Borrower booking management
│   │   │   └── Auth/                 # Login, register
│   │   ├── services/
│   │   │   └── api.js                # Centralized API service layer
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── utils/                    # Date helpers, status mappers
│   │   └── constants/                # Booking status constants
│   ├── .env.production
│   ├── vite.config.js
│   └── eslint.config.js              # ESLint v9 flat config
│
├── backend/                          # Express.js API
│   ├── prisma/
│   │   ├── schema.prisma             # Canonical data model + enums
│   │   ├── migrations/               # Prisma migration history
│   │   └── seed.js                   # Idempotent seed pipeline
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── listing.routes.js
│   │   │   └── booking.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── listing.controller.js
│   │   │   └── booking.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js    # JWT verification + req.user
│   │   │   └── cors.config.js        # Environment-aware CORS
│   │   ├── services/
│   │   │   └── booking.service.js    # Lifecycle guard logic
│   │   └── config/
│   │       └── index.js              # Centralized env config
│   ├── server.js
│   └── package.json                  # includes postinstall: prisma generate
│
└── docs/                             # Architecture docs / assets
```

---

## 13. Environment Variables

### Frontend (`frontend/.env.production` / `.env.local`)

```env
VITE_API_URL=https://your-backend.onrender.com
```

> **Note:** The frontend validates `VITE_API_URL` at startup and will throw a hard error if it is missing. There is no unsafe `localhost` fallback in any environment.

### Backend (`backend/.env`)

```env
# Database
DATABASE_URL=postgresql://user:password@neon-host/campusrent?sslmode=require

# Auth
JWT_SECRET=your-strong-jwt-secret-min-32-chars
JWT_EXPIRY=7d

# Server
PORT=4000
NODE_ENV=production

# CORS
FRONTEND_URL=https://your-app.vercel.app
```

---

## 14. Local Development Setup

### Prerequisites

- Node.js ≥ 18.x
- npm ≥ 9.x
- A Neon PostgreSQL database (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/vedchoraria/Campus-Rent.git
cd Campus-Rent
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET, etc.

npm install
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js   # Optional: populate with seed data
```

### 3. Start the backend server

```bash
npm run dev
# Backend running at http://localhost:4000
```

### 4. Configure the frontend

```bash
cd ../frontend
cp .env.example .env.local
# Set VITE_API_URL=http://localhost:4000

npm install
```

### 5. Start the frontend dev server

```bash
npm run dev
# Frontend running at http://localhost:5173
```

### 6. Run Prisma Studio (optional)

```bash
cd backend
npx prisma studio
# Visual DB explorer at http://localhost:5555
```

---

## 15. Production Deployment

### Database — Neon

1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string from the dashboard
3. Set it as `DATABASE_URL` in your backend environment

### Backend — Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repository, set root directory to `backend/`
3. Build command: `npm install`
4. Start command: `node start`
5. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRY`, `FRONTEND_URL`, `NODE_ENV=production`

> Render will automatically run `postinstall` (which executes `prisma generate`) during every deploy.

To apply migrations in production:

```bash
npx prisma migrate deploy
```

### Frontend — Vercel

1. Import the repository on [vercel.com](https://vercel.com)
2. Set root directory to `frontend/`
3. Framework preset: Vite
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy

Vercel will auto-deploy on every push to `main`. Preview deployments are generated for all pull requests.

---

## 16. Roadmap

**Marketplace Enhancements**
- Sorting: price low-to-high, price high-to-low, newest-first
- Quick-view modal for listings without full page navigation
- Pagination and infinite scroll for large item grids

**UX & Mobile**
- Full mobile responsiveness pass across all dashboard views
- Footer and global navigation system refinement
- Toast notification system for lifecycle events

**Booking & Rental**
- Extend-rental-duration workflow mid-booking
- In-app messaging/chat between owner and borrower
- Payment integration (Stripe or Razorpay) for deposit handling

**Platform & Community**
- Community donation inventory model: users donate items into CampusRent's pool and retain lifetime revenue-sharing rights on future rentals generated from their donated assets
- Review and rating system post-completion
- Listing analytics for owners (views, booking conversion rate)

**Infrastructure**
- Neon branch-per-PR preview environments
- Backend rate limiting and request logging
- Automated integration test suite for booking lifecycle transitions

---

## 17. Screenshots

> _Screenshots coming soon. Live demo available at [campus-rent-sigma.vercel.app](https://campus-rent-sigma.vercel.app)_

| View | Description |
|---|---|
| `marketplace.png` | Item discovery grid with filters |
| `listing-detail.png` | Single listing page with booking form |
| `owner-dashboard.png` | Owner's active listings and approval queue |
| `borrower-dashboard.png` | Borrower's rental status across lifecycle tabs |
| `booking-lifecycle.png` | Live booking status transitions |

---

## 18. License

This project is licensed under the [MIT License](./LICENSE).

