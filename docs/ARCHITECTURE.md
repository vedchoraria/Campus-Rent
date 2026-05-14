# CampusRent — System Architecture

This document covers the full technical architecture of CampusRent: deployment topology, request flow, booking state machine, database schema, and authentication pipeline.

---

## 1. Deployment Topology

```mermaid
graph TD
    subgraph Vercel["🌐 Vercel (Frontend)"]
        FE["React + Vite SPA"]
    end

    subgraph Render["⚙️ Render (Backend)"]
        API["Express.js API Server"]
        MW["JWT Middleware\nRole Validation · Guard Checks"]
        PRM["Prisma ORM Client"]
        API --> MW --> PRM
    end

    subgraph Neon["🗄️ Neon (PostgreSQL)"]
        DB[("PostgreSQL\nUser · Listing · Booking")]
    end

    FE -->|"HTTPS · JWT Bearer"| API
    PRM -->|"Connection Pool · SSL"| DB
```

---

## 2. Frontend Request Flow

```mermaid
graph LR
    MP["Marketplace"] --> CTX
    OD["Owner Dashboard"] --> CTX
    BD["Borrower Dashboard"] --> CTX

    subgraph CTX["React Context Layer"]
        LC["ListingContext"]
        BC["BookingContext"]
    end

    CTX --> SVC["API Service Layer\n(token injection · error normalization)"]
    SVC -->|"HTTPS"| API["Express.js Backend"]
    API -->|"JSON Response"| SVC
    SVC -->|"State Refetch"| CTX
```

> The frontend never reads from local state after a mutation. Every write is followed by a backend refetch — the database is the canonical source of truth.

---

## 3. Booking Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> requested : Borrower submits request

    requested --> approved : Owner approves\n(overlap check passes)
    requested --> rejected : Owner rejects

    approved --> item_given : Owner confirms handoff
    item_given --> ongoing : Borrower confirms receipt
    ongoing --> return_pending : Borrower initiates return
    return_pending --> completed : Owner confirms return

    requested --> cancelled : Either party cancels
    approved --> cancelled : Either party cancels
    item_given --> cancelled : Either party cancels
    ongoing --> cancelled : Either party cancels

    rejected --> [*]
    completed --> [*]
    cancelled --> [*]
```

### Overlap Conflict Prevention

Before any `requested → approved` transition, the engine queries all bookings for the same listing in states `approved`, `item_given`, `ongoing`, or `return_pending` and validates that no date range intersection exists. The check explicitly excludes `requested`, `cancelled`, `rejected`, and `completed` to avoid blocking legitimate future bookings from other requesters.

### Cancellation Audit

Every cancellation stamps `cancelledBy` (owner or borrower) and `cancelledAt` (UTC timestamp) onto the booking record at persistence time. This is enforced at the API layer — the client cannot modify or omit these fields.

---

## 4. Role-Based Transition Guards

```mermaid
graph TD
    ACT["Incoming PATCH /bookings/:id/status"] --> V1["Verify JWT"]
    V1 --> V2["Extract userId + role"]
    V2 --> V3{"Is transition\nvalid from\ncurrent status?"}
    V3 -->|No| E1["400 Invalid Transition"]
    V3 -->|Yes| V4{"Does user role\nmatch required\nactor?"}
    V4 -->|No| E2["403 Forbidden"]
    V4 -->|Yes| V5{"Overlap check\n(if approving)"}
    V5 -->|Conflict| E3["409 Overlap Conflict"]
    V5 -->|Clear| P["Persist transition\n+ audit metadata"]
    P --> R["Refetch + return updated booking"]
```

| Transition | Required Actor |
|---|---|
| `requested → approved / rejected` | Owner |
| `approved → item_given` | Owner |
| `item_given → ongoing` | Borrower |
| `ongoing → return_pending` | Borrower |
| `return_pending → completed` | Owner |
| `* → cancelled` | Owner or Borrower |

---

## 5. Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant A as Express API
    participant DB as Neon PostgreSQL

    C->>A: POST /auth/login { email, password }
    A->>DB: SELECT user WHERE email = ?
    DB-->>A: User record (hashed password)
    A->>A: bcrypt.compare(password, hash)
    A->>A: jwt.sign({ userId, email, role })
    A-->>C: { token, user }

    Note over C: Stores token (memory / localStorage)

    C->>A: GET /bookings/owner\nAuthorization: Bearer <token>
    A->>A: jwt.verify(token, JWT_SECRET)
    A->>A: Attach req.user = { userId, role }
    A->>DB: SELECT bookings WHERE ownerId = userId
    DB-->>A: Booking records
    A-->>C: JSON response
```

---

## 6. Database Schema

```mermaid
erDiagram
    User {
        String id PK
        String email
        String password
        String name
        DateTime createdAt
    }

    Listing {
        String id PK
        String title
        String description
        Float pricePerDay
        Float securityDeposit
        String category
        ListingStatus status
        String ownerId FK
        DateTime createdAt
    }

    ListingImage {
        String id PK
        String url
        String listingId FK
    }

    Booking {
        String id PK
        String listingId FK
        String borrowerId FK
        String ownerId
        DateTime startDate
        DateTime endDate
        BookingStatus status
        Float totalPriceSnapshot
        Float securityDepositSnapshot
        String cancelledBy
        DateTime cancelledAt
        DateTime createdAt
    }

    User ||--o{ Listing : "owns"
    User ||--o{ Booking : "borrows"
    Listing ||--o{ ListingImage : "has"
    Listing ||--o{ Booking : "booked via"
```

### Key Design Decisions

**Snapshot fields on Booking** — `totalPriceSnapshot` and `securityDepositSnapshot` are written at booking creation time from the listing's current price. If the owner later changes pricing, historical bookings retain their original cost. This is the only safe approach for financial records.

**`ownerId` denormalized onto Booking** — Rather than joining through `Listing` to find the owner on every dashboard query, `ownerId` is stored directly on `Booking`. This halves the join depth for the owner's most frequent query pattern.

**B-Tree indexes** on `Listing.ownerId` and `Booking.listingId` — these two fields appear in the `WHERE` clause of every high-frequency query (owner dashboard load, overlap conflict check, borrower history). Indexed at migration time.

**Prisma enums for status fields** — `BookingStatus` and `ListingStatus` are defined as Prisma enums backed by PostgreSQL native enums. Invalid string states cannot reach the database at the ORM layer, before any application-level validation runs.

---

## 7. CORS & Environment Architecture

```mermaid
graph LR
    subgraph Production
        FE["Vercel Frontend\ncampus-rent-sigma.vercel.app"] -->|"Allowed origin"| BE["Render Backend"]
        X["Any other origin"] -->|"Blocked"| BE
    end

    subgraph Development
        LOCAL["localhost:5173"] -->|"Allowed origin\n(dev only)"| DEV["localhost:4000"]
    end

    BE --> ENV{"NODE_ENV"}
    ENV -->|"production"| PROD_CORS["FRONTEND_URL allowlist\nNo localhost fallback"]
    ENV -->|"development"| DEV_CORS["localhost:5173 permitted"]
```

The backend reads `FRONTEND_URL` from environment at startup and constructs its CORS allowlist from that value alone. There is no hardcoded localhost fallback that could leak into the production environment — the configuration module enforces this at load time and throws if `NODE_ENV=production` and `FRONTEND_URL` is absent.
