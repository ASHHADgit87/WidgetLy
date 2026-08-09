# WidgetLy

**WidgetLy** is an embeddable widget and lead-capture platform built with **Next.js 15, React 19, TypeScript, Prisma, PostgreSQL, Three.js, and NextAuth**. Users create customizable widgets, generate a single embed snippet, and safely accept submissions from any website. Every request is validated, rate-limited, spam-filtered, geo-enriched, and stored in a tenant-isolated dashboard.

---

# Problem Statement

Modern websites need lightweight, trusted ways to capture leads, signups, feedback, and conversions — without building and maintaining custom forms for every page.

Fragmented form tools force teams to juggle multiple vendors, copy-paste brittle scripts, and sacrifice control over design and data ownership.

Embedding third-party scripts often opens the door to spam, abuse, and cross-origin security gaps that standard form builders don’t adequately address.

WidgetLy solves this with a single embeddable script tag, a hardened server-side pipeline, and a real-time analytics dashboard — giving teams full control over capture, validation, and data isolation.

---

# Core Integration

WidgetLy uses **Next.js 15 App Router**, **Prisma ORM**, **NextAuth v5**, **Three.js**, and **Upstash Redis** to deliver a secure, high-performance widget platform.

### Stack Integration

| Component | Role |
|---|---|
| `Next.js 15` | App Router, server actions, API routes, middleware |
| `React 19` | Client-side dashboard and widget previews |
| `TypeScript` | End-to-end type safety |
| `Prisma + PostgreSQL` | Tenant-isolated data layer |
| `NextAuth v5` | Credentials-based authentication |
| `Three.js / R3F` | Dynamic 3D animated widget backgrounds |
| `Upstash Redis` | IP and widget rate limiting |
| `Resend` | Transactional email notifications |
| `Zod` | Runtime schema validation |

---

### Request Pipeline
Inbound Request → CORS Check → Rate Limit → Honeypot → Geo Enrichment → Validate → Store → Notify → Dashboard


---

# Architecture

WidgetLy follows a **modular multi-tier SaaS architecture**:

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS |
| API | Route handlers (`/api/submissions`, `/api/widgets`, `/api/widget-bundle`) |
| Auth | NextAuth v5 (credentials + JWT session) |
| Database | PostgreSQL via Prisma (Neon) |
| Cache / Rate Limit | Upstash Redis |
| Email | Resend |
| 3D Graphics | Three.js, React Three Fiber |
| Validation | Zod |

---

# BaaS

WidgetLy is delivered as a **Backend-as-a-Service (BaaS)** for lead capture. Developers and marketers embed a script tag, configure widget fields and theme, and instantly accept validated, spam-resistant submissions — all without managing infrastructure.

---

# Features

### Widget System

| Capability | Detail |
|---|---|
| Widget types | 10 types: Signup Form, Contact Form, CTA Popover, Newsletter Bar, Exit Intent, Waitlist, Feedback/NPS, Chat Bubble, Discount Reveal, Event RSVP |
| Custom fields | Dynamic field definitions per widget |
| Theme engine | Deterministic theme generation from seed; unique palettes per widget |
| Versioned bundles | Immutable JS bundle URLs per version |
| Embed snippet | Single `<script>` tag with config + bundle URL |
| Live preview | Real iframe preview with 3D animated backgrounds |
| Active / inactive toggle | Instant enable/disable without code changes |

### Security & Hardening

| Capability | Detail |
|---|---|
| CORS enforcement | Configurable allowed origins per widget |
| Rate limiting | Per-IP and per-widget via Upstash Redis |
| Honeypot | Hidden `company_website` field; bot submissions silently dropped |
| Input validation | Zod schemas for all public endpoints |
| Tenant isolation | Every query scoped to `tenantId` at the database layer |
| Geo enrichment | Dual-provider IP-to-location with automatic fallback |

### Analytics & Dashboard

| Capability | Detail |
|---|---|
| Submission storage | JSON payload with IP, geo, timestamps |
| Per-widget stats | Total submissions, recent activity, breakdowns |
| Geo breakdown | Country, region, city distribution |
| Submissions table | Expandable rows with full field data |
| Profile management | Name, email, password updates |

### 3D Backgrounds

| Capability | Detail |
|---|---|
| Theme-driven visuals | Colors, particles, and geometry derived from widget theme seed |
| Three.js scenes | Multiple background variants: soft bokeh, wave ribbons, floating boxes, connection cluster, 3D scatter, geometric shapes, ring orbit |
| Additive blending | Subtle particle effects with configurable opacity |
| Responsive canvas | Auto-resize with retry loop for reliable rendering |

### Data Model

| Entity | Key Fields |
|---|---|
| `User` | `id`, `name`, `email`, `passwordHash`, `createdAt` |
| `Widget` | `id`, `tenantId`, `type`, `title`, `fields`, `displayOptions`, `bundleVersion`, `isActive` |
| `Submission` | `id`, `widgetId`, `tenantId`, `data`, `ipAddress`, `country`, `region`, `city`, `geoProvider`, `createdAt` |

---

# API Reference

| Method | Path | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/widgets/:id/config` | Public · CORS | Cached widget config for embed script |
| `POST` | `/api/submissions` | Public · CORS | Public submission endpoint with full validation pipeline |
| `GET` | `/api/widget-bundle/:version` | Public · CORS | Versioned widget JavaScript bundle |
| `GET / POST` | `/api/widgets` | Authenticated | Tenant-isolated widget CRUD |
| `GET` | `/api/widgets/:id/submissions` | Authenticated | Owner-only submissions, paginated |
| `GET` | `/api/dashboard/stats` | Authenticated | Aggregate counts, per-widget stats, geo breakdown |

---

# Processing Capability

| Capability | Detail |
|---|---|
| Submission throughput | Rate-limited per IP and per widget |
| Widget count | Unlimited per tenant |
| Field complexity | Arbitrary JSON field definitions per widget |
| Embed scale | Any number of external websites via CORS allowlist |
| Geo resolution | Dual-provider fallback for uptime |
| Notification delivery | Email via Resend on successful submission |

---

# Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, Tailwind CSS, Framer Motion |
| Backend | Next.js Route Handlers, Server Actions |
| Auth | NextAuth v5 (Credentials provider, JWT sessions) |
| Database | PostgreSQL (Neon), Prisma ORM |
| Cache / Rate Limit | Upstash Redis |
| Email | Resend |
| 3D / Graphics | Three.js, React Three Fiber |
| Validation | Zod |
| Deployment | Vercel |

---

# Live Demo

https://widgetly-sigma.vercel.app/

---

## Creator & Developer

- **Muhammad Ashhadullah Zaheer**

- LinkedIn: https://www.linkedin.com/in/muhammad-ashhadullah-zaheer-41194a340/

