# Hotel Booking System

A simple, focused hotel booking app. It does one thing well: let guests find a hotel,
pick a room for some dates, and reserve it. No upsells, no loyalty programs, no
multi-vendor marketplace mechanics — just a faithful booking flow.

## Problem

Most hotel software tries to do everything (channel management, pricing engines, CRM,
marketing, reviews). That makes them complex to build, use, and maintain. A guest who
just wants to book a room has to wade through clutter.

This project deliberately scopes down to the **booking part only**, done correctly:
- Accurate availability (no double-booking).
- Clear dates, room, price.
- A confirmed reservation a guest can trust.

## Solution

A two-sided app:

- **Guests** search hotels by location and dates, see available rooms with prices,
  and book. Mock payment confirms the reservation.
- **Admins** manage hotels, room types, and availability, and view all bookings.

Booking integrity is the core invariant: a room cannot be reserved by two guests for
overlapping dates.

### Scope decisions

| Topic | Decision |
|-------|----------|
| Users | Guests + Admin (two roles) |
| Inventory | Multiple hotels, searchable by location + dates |
| Payment | Mock payment step (no real money, shows the flow) |
| Stack | React Router v7 (framework mode) + Prisma + SQLite |

### Out of scope (intentionally)

- Real payment gateways (Stripe etc.) — mock only.
- Hotel-owner self-serve onboarding — admin manages inventory.
- Reviews, ratings, messaging, loyalty, promo codes.
- Channel/OTA sync, dynamic pricing, taxes/fees engine.
- Email/SMS notifications (confirmation shown in-app only).

## Features

### Guest
- Search hotels by location (city) + check-in / check-out dates + guest count.
- View hotel detail: photos, description, available room types with price/night.
- See only rooms actually available for the selected date range.
- Book a room: enter guest details, mock payment, get a confirmation with reference.
- View a booking by reference.

### Admin
- Auth (admin login).
- CRUD hotels (name, city, address, description, image).
- CRUD room types per hotel (name, capacity, price/night, total quantity).
- Manage availability / block dates.
- View and cancel bookings across all hotels.

### Core booking rules
- Availability is computed from room quantity minus overlapping confirmed bookings.
- No double-booking for overlapping date ranges.
- Price = nights × room price/night, shown before confirm.
- Booking states: `confirmed`, `cancelled`.

## Data model (initial)

- **Hotel**: id, name, city, address, description, imageUrl.
- **RoomType**: id, hotelId, name, capacity, pricePerNight, quantity.
- **Booking**: id, reference, roomTypeId, guestName, guestEmail, checkIn, checkOut,
  guests, totalPrice, status, createdAt.
- **User** (admin): id, email, passwordHash, role.

## Tech / architecture

- **React Router v7 framework mode** — file-based routes, `loader` for data fetch,
  `action` for mutations (search, booking, admin CRUD). SSR by default.
- **Prisma** ORM over **SQLite** (single file DB, zero infra).
- Availability + booking-integrity logic in server-side `action`/`loader` modules.
- Session-based admin auth (React Router cookie sessions).

## Build phases

1. Setup: React Router v7 framework app, Prisma, SQLite, schema + seed data.
2. Guest search route + hotel detail route + availability logic (loaders).
3. Booking flow + mock payment + confirmation (actions).
4. Admin auth + hotel/room CRUD routes.
5. Admin bookings view + cancel.
