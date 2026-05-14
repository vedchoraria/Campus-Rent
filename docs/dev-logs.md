# CampusRent Development Log

**Project:** CampusRent  
**Document Type:** Engineering Development Journal  
**Last Updated:** 2026-04-16

## Phase 1 - Product Foundation and Core Frontend

### Phase 1.1 - Frontend Setup and Project Scaffolding
- Initialized CampusRent using React + Vite and established base folder structure.
- Added global styling, reusable UI primitives, and shared component conventions.
- Set up initial page routing for landing, auth, marketplace, item details, booking, and chat.

### Phase 1.2 - Listing Domain and Marketplace Baseline
- Implemented `ListingContext` to centralize listing state operations.
- Added listing visibility controls (hide/unhide) and delete handling for owner-managed listings.
- Introduced `localStorage` persistence for listings with safe fallback to seed data.
- Delivered Marketplace discovery UI with filtering, sorting, and responsive grid behavior.

## Phase 2 - Dashboard Architecture and User Modules

### Phase 2.1 - Dashboard Routing Refactor
- Refactored dashboard navigation into nested routes under a shared dashboard layout.
- Applied protected-route access rules for authenticated user sections.
- Separated dashboard layout concerns from top-level application routing.

### Phase 2.2 - My Listings Module
- Built owner workflows for Active Listings, Pending Approvals, and Rental History.
- Connected listing operations to booking state for approval, rejection, cancellation, and return actions.
- Refined hidden listing behavior so Marketplace visibility follows listing-domain rules only.

### Phase 2.3 - My Borrowings Module
- Implemented borrower workflows for Pending, Upcoming, Ongoing, and History views.
- Added borrower-side request controls and lifecycle-aligned status presentation.
- Normalized booking display models (dates, totals, owner/requester metadata) across tabs.

## Phase 3 - Booking Lifecycle Engine and Data Integrity

### Phase 3.1 - BookingContext and Lifecycle State Engine
- Created `BookingContext` as the canonical source for booking state.
- Implemented lifecycle actions: create, approve, reject, cancel, and mark returned.
- Added booking persistence in `localStorage` with resilient hydration behavior.
- Standardized booking status constants and transition handling across modules.

### Phase 3.2 - Approval Workflow and Overlap Conflict Prevention
- Hardened approval flow so approvals update existing records rather than creating new entries.
- Enforced overlap checks at approval time against confirmed bookings (`upcoming`, `ongoing`) for the same listing.
- Excluded non-confirmed statuses (`pending`, `cancelled`, `rejected`, `completed`) from overlap validation.

### Phase 3.3 - Duplicate Booking and Rendering Fixes
- Traced booking creation path from booking confirmation and removed duplicate insertion paths.
- Added guarded booking creation logic and deduplication at context/state update layers.
- Added defensive de-duplication in borrower and lender list projections to prevent repeated rendering.
- Corrected Marketplace `Rent Now` behavior to allow future reservations while preserving overlap enforcement in booking flow.

## Phase 4 - Auditability, History Consistency, and Backend Readiness

### Phase 4.1 - Unified History and Cancellation Audit Trail
- Unified history views to include `completed`, `cancelled`, and `rejected` records for both borrower and lender dashboards.
- Added status badges in history cards for lifecycle transparency.
- Added cancellation audit metadata (`cancelledBy`, `cancelledAt`) with borrower/lender source stamping.

### Phase 4.2 - Persistence Stabilization and Backend Preparation
- Stabilized local persistence strategy for listings and bookings with canonical state normalization.
- Preserved consistent cross-dashboard synchronization after reloads.
- Prepared backend migration surface through stable context contracts and API service abstraction.
- Completed Supabase preparation groundwork without introducing backend-dependent runtime paths.

## Phase 5 - Full-Stack Backend Integration, Lifecycle Architecture & Production Deployment

### Phase 5.0 - Backend Architecture & Database Initialization

- Restructured the project into decoupled `frontend/` and `backend/` application layers.
- Initialized Node.js + Express backend infrastructure with JSON middleware and environment-aware CORS handling.
- Integrated Prisma ORM with Neon serverless PostgreSQL as the primary production database.
- Designed and finalized a strict relational schema covering:
  - `User`
  - `Listing`
  - `ListingImage`
  - `Booking`
- Migrated from loosely typed string states into strict Prisma-backed enums:
  - `BookingStatus`
  - `ListingStatus`
- Added historical booking integrity fields directly into the `Booking` model:
  - `totalPriceSnapshot`
  - `securityDepositSnapshot`
  - `ownerId`
- Added optimized B-Tree indexing on high-frequency relational queries (`ownerId`, `listingId`) to improve dashboard and marketplace scalability.
- Created an idempotent `seed.js` pipeline to populate Neon with realistic frontend-compatible seed data.

---

### Phase 5.1 - API Integration & Frontend-Backend Synchronization

- Replaced frontend mock/static state flows with real Express API integration.
- Introduced a centralized API service abstraction layer for authenticated and unauthenticated requests.
- Implemented JWT-based authentication with persistent login/session handling.
- Connected React contexts and dashboard modules directly to Neon-backed API endpoints.
- Eliminated local-only booking mutations and transitioned to database-first persistence architecture.
- Added token-aware protected route middleware across backend APIs.
- Stabilized cross-dashboard synchronization behavior after refreshes and lifecycle mutations.

---

### Phase 5.2 - Booking Lifecycle Refactor & State Machine Hardening

- Replaced simplified booking states (`pending`, `upcoming`, `ongoing`) with a production-style lifecycle engine:
  - `requested`
  - `approved`
  - `item_given`
  - `ongoing`
  - `return_pending`
  - `completed`
  - `cancelled`
  - `rejected`
- Introduced guarded lifecycle transitions with strict role-based permissions:
  - Owners manage approvals, handoff, rejection, and return confirmation.
  - Borrowers confirm receipt and initiate return requests.
- Added backend-enforced invalid transition prevention and state validation.
- Refactored borrower and owner dashboards around lifecycle-aware grouping and workflow presentation.
- Extended overlap conflict prevention across all active rental states.
- Migrated legacy booking records safely using Prisma migration workflows.

---

### Phase 5.3 - Persistence Stabilization & Reload Consistency Engineering

- Identified and resolved booking reset issues caused by frontend-only state mutations.
- Added dedicated backend `PATCH` lifecycle update endpoints for booking state transitions.
- Refactored booking mutations into API-first persistence flows followed by database refetch synchronization.
- Established the database as the canonical source of truth for booking state.
- Fixed reload inconsistencies where approved bookings reverted to pending state.
- Preserved synchronization consistency across borrower and lender dashboards after refresh cycles.

---

### Phase 5.4 - Production Infrastructure, Environment Hardening & Deployment

- Implemented production-safe CORS architecture with environment-driven frontend allowlists.
- Added strict frontend API environment validation to eliminate unsafe localhost fallbacks.
- Centralized backend deployment configuration handling through scalable config modules.
- Migrated frontend linting infrastructure to ESLint v9 flat configuration architecture.
- Added automated Prisma client generation through deployment-safe `postinstall` hooks.
- Verified backend compatibility with Render deployment infrastructure.
- Verified frontend compatibility with Vercel deployment infrastructure.
- Successfully deployed production stack:
  - Frontend → Vercel
  - Backend → Render
  - Database → Neon PostgreSQL
- Completed end-to-end production validation for:
  - JWT authentication
  - Protected APIs
  - Listing services
  - Booking lifecycle workflows
  - Prisma synchronization
  - Environment variable handling
  - Cross-origin communication

---

## Current Product State

CampusRent now operates as a fully deployed full-stack campus rental platform featuring:

- React + Vite frontend architecture
- Express.js backend services
- Prisma ORM data layer
- Neon PostgreSQL production database
- JWT authentication system
- Lifecycle-driven booking engine
- Role-based booking workflows
- Persistent database-backed synchronization
- Production deployment infrastructure
- Real-world environment and deployment management

---

## Upcoming Product Directions

Planned future enhancements include:

- Marketplace sorting enhancements:
  - Price low-to-high
  - Price high-to-low
  - Newest-first
- Footer and navigation system refinement
- Mobile responsiveness and UX polish
- Payment integration workflows
- Extend-rental-duration functionality
- Quick-view modal experience
- Community donation inventory model:
  - Users may donate items into CampusRent inventory.
  - Donors retain lifetime revenue-sharing rights on future rentals generated from donated assets.