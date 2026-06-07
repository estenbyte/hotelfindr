# hotelfindr

Budget-friendly hotel booking for Bangladesh. Search by city and dates, filter
by budget, read guest reviews, and book a room with card or bKash — confirmed in
under a minute with a boarding-pass style pass and QR code.

## Tech stack

- **React Router v7** (framework mode, SSR)
- **Prisma 7** + **PostgreSQL** (via `@prisma/adapter-pg` driver adapter)
- **Tailwind CSS v4** · Bricolage Grotesque + Geist Mono
- **Vercel** serverless deploy (`@vercel/react-router` preset)

## Features

- City/date/guest search with a **budget filter** and cheapest-first sort
- Hotel detail with a comprehensive **amenities** grid and **ratings & reviews**
- Booking flow with **card + bKash** payment and a no-double-booking guarantee
- **Track a booking** by reference; confirmation pass with a scannable **QR code**

## Getting started (local)

Requires Node 20+, pnpm, and a local PostgreSQL.

```bash
pnpm install

# create a database, then point .env at it
echo 'DATABASE_URL="postgresql://<user>@localhost:5432/hotelfindr"' > .env
echo 'SESSION_SECRET="dev-secret-change-me"' >> .env

# create tables and load sample data (100 hotels)
pnpm db:push
pnpm db:seed

pnpm dev
```

App runs at `http://localhost:5173`.
Admin seed account: `admin@hotelfindr.test` / `admin123`.

### Useful scripts

| Script           | Purpose                                  |
| ---------------- | ---------------------------------------- |
| `pnpm dev`       | Dev server with HMR                      |
| `pnpm build`     | Production build (Vercel serverless)     |
| `pnpm typecheck` | Prisma typegen + `tsc`                   |
| `pnpm db:push`   | Sync schema to the database              |
| `pnpm db:seed`   | Seed hotels, rooms, reviews, amenities   |
| `pnpm db:studio` | Open Prisma Studio                       |

## Deploying to Vercel

The app is configured for Vercel's serverless runtime. The Prisma client is
generated on install (`postinstall: prisma generate`), so no client is checked in.

**1. Import the repo** into Vercel (it auto-detects React Router — no build
settings needed).

**2. Create a Postgres database.** Use Vercel Storage → Postgres, or
[Neon](https://neon.tech). Copy the **pooled** connection string (the host with
`-pooler` in it) — serverless functions open many short-lived connections.

**3. Set environment variables** in the Vercel project (Settings → Environment
Variables):

| Variable         | Value                                          |
| ---------------- | ---------------------------------------------- |
| `DATABASE_URL`   | your **pooled** Postgres connection string     |
| `SESSION_SECRET` | any long random string                         |

**4. Create the tables and seed the cloud database** once, from your machine,
pointing at the production URL:

```bash
DATABASE_URL="<your-pooled-postgres-url>" pnpm exec prisma db push
DATABASE_URL="<your-pooled-postgres-url>" pnpm exec tsx prisma/seed.ts
```

**5. Deploy.** Pushing to `main` triggers a deploy automatically; or hit
**Redeploy** in the dashboard. The live site will have the seeded hotels and
fully persistent bookings.

> **Note:** This project uses PostgreSQL, not SQLite — SQLite's single-file
> storage can't run on serverless platforms (read-only, ephemeral filesystem).

---

Developed by [Ebn Sina](https://m.me/ebnsina.dev).
