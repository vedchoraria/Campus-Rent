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

## Current Phase – Backend Migration Planning
- Frontend domain models, lifecycle transitions, and audit metadata are stabilized for migration.
- Booking/listing state contracts are ready to be mapped to persistent backend tables and policies.
- Migration planning is active with focus on replacing local persistence with backend-backed workflows.

### Phase 5.0 - Backend Architecture & Database Initialization
- Restructured project into decoupled rontend/ and ackend/ directories.
- Initialized Node.js/Express backend on port 5000 with CORS and JSON middleware.
- Set up Prisma ORM and connected to Neon serverless PostgreSQL database.
- Finalized strict relational database schema including User, Listing, ListingImage, and Booking models.
- Migrated from generic string states to strict database Enums (BookingStatus, ListingStatus).
- Implemented historical data integrity by adding 	otalPriceSnapshot, securityDepositSnapshot, and ownerId directly to the Booking table.
- Added highly practical, production-ready B-Tree indexes on foreign keys (ownerId, listingId) to prevent sequential scans on dashboards and marketplace filters.
- Created idempotent seed.js script that successfully populated the Neon database with the frontend's mock profile and listing data.

## Current Phase - API Route Implementation
- Database is fully provisioned and seeded.
- Next step is to replace frontend static imports with Express /api/* route connections.
