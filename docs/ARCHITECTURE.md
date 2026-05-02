# CampusRent Engineering State & Architecture

**Document Type:** System Architecture & Migration Status  
**Last Updated:** 2026-05-02  
**Current Phase:** Phase 5 - API Integration & Hybrid Migration  

---

## 1. High-Level Architecture Overview
CampusRent is actively transitioning from a client-heavy, local-storage mock application into a full-stack, enterprise-grade monolithic repository. 
- **Frontend:** React + Vite, currently reliant on React Context (`ListingContext`, `BookingContext`) for state management and hybrid data caching.
- **Backend:** Node.js + Express, utilizing a strict decoupled layered architecture.
- **Database:** Neon Serverless PostgreSQL managed via Prisma ORM.

## 2. Backend Folder Architecture
The backend enforces a strict separation of concerns to guarantee modularity and testability:
- **`routes/`**: Handles HTTP method mapping and URL parsing.
- **`controllers/`**: Extracts `req`/`res` objects, handles HTTP status codes, and catches errors.
- **`services/`**: Contains core business logic, validation rules, and Prisma database queries.
- **`utils/`**: Contains shared singletons, such as the `prismaClient` to prevent connection exhaustion.

*Why this was chosen:* This three-layer architecture ensures that business logic is decoupled from HTTP transport layers. This makes the system highly testable, easier to debug, and prepared for future scaling (e.g., swapping REST for GraphQL or moving to microservices).

## 3. Prisma + Neon Integration
The platform uses Neon Serverless PostgreSQL for scalable, instantly available database connections. Prisma ORM is used for schema management, migrations, and type-safe database queries.
- **Connection Pooling:** Prisma connects to Neon using connection pooling to handle serverless cold starts efficiently.
- **Indexes:** B-Tree indexes are explicitly defined on high-traffic foreign keys (`ownerId`, `listingId`, `status`) to prevent sequential scans during Marketplace filtering and Dashboard aggregation.

## 4. Current Relational Schema Overview
The database schema revolves around four core models with strict referential integrity:
- **`User`**: The foundational model. Contains roles (borrower vs lender is implicit via relations).
- **`Listing`**: Relates to `User` (owner). Enforces a strict `ListingStatus` enum (`active`, `hidden`, `deleted`).
- **`ListingImage`**: One-to-many from `Listing`, ordered via `displayOrder`.
- **`Booking`**: The central junction table. Requires strict relations to both `Listing` and `User` (borrower). 

*Why this was chosen:* We introduced historical snapshots (`totalPriceSnapshot`, `securityDepositSnapshot`) and `ownerId` directly onto the `Booking` table. This ensures financial auditability—if an owner changes a listing's daily rate tomorrow, existing historical bookings remain financially accurate.

## 5. API Architecture Overview
The API is currently RESTful and stateless.
- **Implemented Endpoints:**
  - `GET /api/listings`: Fetches all active listings with owner metadata and images.
  - `GET /api/listings/:id`: Fetches a single listing with owner metadata, ordered images, and active bookings for overlap calculation.
- **Aborted/Reconsidered Endpoints:**
  - `POST /api/bookings`: Temporarily rejected pending a pivot toward proper Authentication.

## 6. Frontend/Backend Data Flow (Data Mapping Layer)
Currently, the frontend uses an `api.js` abstraction wrapper utilizing `fetch`. The data flows through a **Translation/Mapping Layer** located directly inside the Contexts (e.g., `ListingContext`). 

*Why this was chosen:* Instead of rewriting the entire React frontend (which relies heavily on mock keys like `pricePerDay` or `mrp`), the Context intercepts the raw Prisma JSON (e.g., `dailyRentalRate`) and maps it to the legacy shape. This ensures complex UI components like `PriceBreakdown` and `ItemCard` function perfectly without modifications.

## 7. Incremental Migration Strategy
The project is undergoing a **Hybrid Incremental Migration**. We are replacing the data layer piece-by-piece rather than rewriting the entire application simultaneously.

*Why this was chosen:* A "Big Bang" rewrite of a complex state engine (like the booking lifecycle) is risky. By keeping the UI frozen and migrating just the data fetching mechanisms, we maintain a continuously deployable, working application. We also added graceful fallbacks where if the API fails, it seamlessly degrades to `mockData.js`.

## 8. Current Hybrid / Transitional Areas
- **Marketplace & Item Details:** 100% Backend-driven. Data is fetched via API and mapped locally.
- **Dashboards & Rental Lifecycle:** Currently Frontend-driven but actively transitioning. Relies on `BookingContext` and `localStorage`, causing state synchronization tension.
- **Booking Creation & Lifecycle Mutations:** The mutation flow was recently attempted via API but rejected by engineering. The strategy shifted because mixing backend persistence with frontend-context-driven dashboards caused architectural tension. 

## 9. Current Risks & Unfinished Systems
- **State Desync:** If a user opens two tabs, the localStorage-driven Dashboards might desync from the live Neon database Marketplace.
- **Context Bloat:** The frontend `BookingContext` is becoming massive because it handles simulated backend logic (e.g., overlap detection, status transitions).
- **Hardcoded Identifiers:** We currently lack Authentication, meaning any backend operations require seeded "mock" users to satisfy relational constraints.

## 10. Recommended Next Milestones

Based on recent engineering decisions, the roadmap has shifted to prioritize **read stabilization** over mutations to resolve the architectural tension between local context and backend persistence. The roadmap MUST follow this strict order:

### Milestone 1: Dashboard Read Migration (Current Priority)
Implement `GET /api/bookings/my-requests` and `/api/listings/my-listings` (or similar query layers). This will gradually migrate booking reads to backend APIs and allow us to rip out the heavy `localStorage` logic from the Dashboards.

### Milestone 2: Stabilize Dashboard Synchronization
Ensure that all dashboard read flows securely and accurately display database state, resolving all desync issues between the Marketplace and the Dashboards.

### Milestone 3: Introduce Booking Mutations Cleanly
With a stabilized read layer, safely re-introduce `POST /api/bookings` and the PUT endpoints for Approve, Reject, Cancel, and Complete actions. Moving the state transition engine entirely to the backend will no longer cause context tension since the dashboard will just refetch live data.

### Milestone 4: Authentication & User Sessions
Implement proper Authentication (JWT or Session-based). Once the lifecycle persistence flow is fully stabilized, Auth will seamlessly replace the temporary seeded user identifiers (`borrowerId`, `ownerId`) to secure the platform for production.
