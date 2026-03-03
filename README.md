<div align="center">
  <h1>🎟️ TixWix — Event Ticketing Platform</h1>
  <p><strong>A full-stack event ticketing web application for movies, concerts, and MLS soccer matches.</strong></p>
  <p>Built with React, TypeScript, Supabase, and Three.js</p>

  <br />

  ![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
  ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)
  ![Three.js](https://img.shields.io/badge/Three.js-3D_Rendering-000000?logo=threedotjs&logoColor=white)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)
</div>

---

## 📖 About

**TixWix** is a comprehensive event ticketing platform that allows users to browse, select, and book tickets for movies, live concerts, and MLS soccer matches — all from a single unified interface. The platform features real-time seat availability, interactive 3D stadium visualization, role-based access control, and a full admin dashboard for managing events and bookings.

This project was developed as part of **CSE370** to demonstrate proficiency in full-stack web development, relational database design, and modern frontend engineering.

---

## ✨ Features

### 🎬 Movie Booking
- Browse currently showing and upcoming movies
- View movie details (cast, director, rating, trailers)
- Select showtimes across multiple cinema halls
- Interactive seat map with real-time availability
- Multiple ticket types (Standard, Premium, VIP)

### 🎵 Concert Ticketing
- Explore upcoming concerts with artist info
- Section-based ticket purchasing (GA, VIP, Backstage)
- Dynamic pricing per section with availability tracking

### ⚽ MLS Soccer Matches
- Browse upcoming MLS fixtures with team logos
- **3D interactive stadium viewer** built with Three.js / React Three Fiber
- Section-based seat selection with tier pricing (Standard, Premium, VIP)
- Real-time seat availability per section

### 🔐 Authentication & Authorization
- Email/password authentication via Supabase Auth
- Password reset flow with email verification
- Role-based access control (Admin, Moderator, User) using a dedicated `user_roles` table with `SECURITY DEFINER` functions to prevent privilege escalation
- Protected admin routes

### 📊 Admin Dashboard
- Manage movies, concerts, and MLS matches
- View booking analytics with Recharts
- Promo code management
- User and review moderation

### 💰 Promotions & Discounts
- Promo code system with percentage/fixed discount types
- Configurable validity periods, usage limits, and minimum purchase thresholds
- Applicable to specific event categories

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (SPA)                     │
│  React 18 · TypeScript · React Router · TanStack     │
│  Query · Tailwind CSS · Radix UI · Three.js          │
├─────────────────────────────────────────────────────┤
│                   Supabase Client                    │
│  Auth · Realtime Subscriptions · REST API            │
├─────────────────────────────────────────────────────┤
│                 Supabase Backend                     │
│  PostgreSQL · Row Level Security · Edge Functions    │
│  Storage · Auth (JWT)                                │
└─────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

The PostgreSQL database is designed with normalized tables and enforced referential integrity:

| Table | Description |
|---|---|
| `movies` | Movie catalog with metadata, genres, cast |
| `halls` | Cinema halls / venues with capacity and amenities |
| `showtimes` | Scheduled movie screenings linked to halls |
| `seats` | Individual seats per hall with type and pricing multipliers |
| `concerts` | Concert events with artist, venue, and pricing |
| `concert_sections` | Ticket sections per concert (GA, VIP, etc.) |
| `mls_matches` | MLS soccer fixtures with team info |
| `stadium_sections` | Stadium seating sections with 3D position data |
| `bookings` | User booking records with payment and promo tracking |
| `booking_items` | Individual tickets within a booking |
| `reviews` | User reviews for movies and concerts |
| `promo_codes` | Discount codes with validation rules |
| `profiles` | Extended user profile data |
| `user_roles` | Role assignments (admin/moderator/user) |

All tables have **Row Level Security (RLS)** enabled with granular policies. Admin role checks use a `SECURITY DEFINER` function (`has_role`) to prevent recursive RLS evaluation.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Language** | TypeScript 5.8 |
| **Frontend Framework** | React 18 with Vite |
| **Routing** | React Router v6 |
| **State Management** | TanStack Query (server state), React Context (auth) |
| **Styling** | Tailwind CSS 3.4 + custom design tokens |
| **UI Components** | Radix UI primitives with custom variants (shadcn/ui pattern) |
| **3D Rendering** | Three.js via @react-three/fiber + @react-three/drei |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod validation |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions, Storage) |
| **Authentication** | Supabase Auth (email/password, JWT sessions) |
| **Linting** | ESLint 9 with TypeScript plugin |

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- npm or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/tixwix.git
cd tixwix

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase URL and anon key to .env

# Start the development server
npm run dev
```

The app will be available at `http://localhost:8080`.

### Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public API key |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── booking/        # Seat map and booking flow
│   ├── concerts/       # Concert cards and listing
│   ├── home/           # Landing page sections (Hero, NowShowing, etc.)
│   ├── layout/         # Header, Footer, Layout wrapper
│   ├── movies/         # Movie cards and listing
│   ├── stadium/        # 3D stadium viewer (Three.js)
│   └── ui/             # Reusable UI primitives (Button, Card, Dialog, etc.)
├── data/               # Mock data for development
├── hooks/              # Custom hooks (useAuth, useAdminRole, useBookingDiscounts)
├── integrations/
│   └── supabase/       # Supabase client and generated types
├── lib/                # Utility functions
├── pages/              # Route-level page components
│   ├── AdminDashboard  # Admin panel with analytics
│   ├── Movies / MovieDetail
│   ├── Concerts / ConcertDetail
│   ├── MLSMatches / MLSMatchDetail
│   ├── BookingConfirmation
│   ├── Login / ResetPassword
│   └── Profile
└── index.css           # Design tokens and global styles
```

---

## 👥 Team

Built by **Priyo**, **Likhan**, and **Mercy** for CSE370.

---

## 📄 License

This project is for academic purposes. All rights reserved.
