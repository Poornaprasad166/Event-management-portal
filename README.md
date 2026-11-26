# Aurelia Live — Commercial Event Management & Ticketing Portal


## Business Upgrade Overview
Transformed into **Aurelia Live Productions**, a commercial event organizer and ticketing operations platform while strictly preserving all required Next.js App Router file paths (`app/events/page.tsx`, `app/events/[id]/page.tsx`, `app/admin/events/page.tsx`, `app/api/events/...`, `lib/auth.ts`, `lib/db.ts`) and core syllabus concepts:
1. **Forms:** Multi-field production publishing form (category, ticket pricing in INR, venue capacity, client house) and delegate tier selection (`Standard Pass` vs `VIP All-Access`).
2. **CRUD Operations:** Full PostgreSQL-backed `GET`, `POST`, `PUT`, and `DELETE` endpoints with capacity tracking and automatic `AUR-<id>-XXXX` e-ticket reference generation.
3. **Authentication & Authorization:** Role-based session cookies distinguishing **Event Organizer Admins** (access to revenue KPIs and CRUD mutations) from **Corporate Delegates / Ticket Buyers**.

## Setup & Deployment
1. Run `npm install`.
2. Run `npm run dev` locally, 
