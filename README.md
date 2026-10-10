# TECRA — Department of Information Technology
### Sri Ranganathar Institute of Engineering and Technology (SRIET)
**Autonomous Institution • Approved by AICTE, New Delhi • Affiliated to Anna University, Chennai**
*Athipalayam, Coimbatore – 641110, Tamil Nadu, India*

[![CI Pipeline](https://github.com/sriet-it/tecra-portal/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.8-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20M0-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x%20Strict-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Proprietary%20SRIET-gold)](LICENSE)

---

## 🏛 Executive Overview

The **TECRA Information Technology Portal** is a production-ready, full-stack departmental web application designed and built specifically for the **Department of Information Technology at Sri Ranganathar Institute of Engineering and Technology (SRIET)**.

Inspired by premier engineering institutions (such as KGiSL Institute of Technology and Sri Krishna College of Engineering), this platform delivers an institutional, high-density academic portal combining immersive visual identity, interactive 3D computing networks, real-time database persistence, and an enterprise administrative control center.

### Core Highlights
- **100% Resilient Hybrid Data Architecture**: Built on MongoDB Atlas & Mongoose 8 with an automated zero-downtime offline fallback layer. The site operates with full data fidelity even in offline exhibition modes.
- **Next-Gen Tech Stack**: Next.js 16.3.8 App Router with Turbopack, React 19.2.8 Server Components, and Tailwind CSS v4 custom theme tokens.
- **Three.js Interactive Node Network**: Custom 3D computational node graph canvas reacting dynamically to cursor velocity on the hero landing poster.
- **Admin Management Console**: Dedicated `/admin` portal with Web Crypto HMAC-SHA256 authenticated sessions, faculty CRUD, event management, media archival, inquiry inbox, and live system telemetry.
- **SEO & Institutional Structured Data**: Schema.org JSON-LD (`EducationalOrganization`, `Event`, `BreadcrumbList`), dynamic `sitemap.xml`, and `robots.txt`.
- **WCAG 2.1 AA Accessibility**: Skip-to-content accessible anchor, focus rings, semantic landmark roles, and responsive layouts across mobile, tablet, and ultra-wide screens.

---

## 🗺 Application Route Architecture

### Public Academic & Student Life Routes
| Route | Description | Rendering Mode |
|---|---|---|
| `/` | Department Landing Homepage, Three.js hero, quick metrics, why IT, HOD desk teaser, events carousel | Static (SSG) |
| `/about` | Department vision, mission, curriculum highlights, academic leadership desk | Static (SSG) |
| `/faculty` | Faculty Directory with real-time search, designation filters, and contact visibility toggles | Static (SSG) / Hybrid |
| `/student-life` | Student Life Hub: IT Association, Clubs, Achievements, and Placements | Static (SSG) |
| `/student-life/it-association` | TECRA Student Association: Office bearers, annual initiatives, and constitution | Static (SSG) |
| `/clubs` | Clubs Overview with cards for all 4 departmental organizations | Static (SSG) |
| `/clubs/[slug]` | Dedicated pre-rendered routes for `technexus`, `aesthetic-ai-club`, `fine-arts-club`, `media-club` | Pre-rendered (SSG) |
| `/events` | Departmental Events Portal with upcoming workshops, symposiums, and hackathons | Static (SSG) |
| `/events/[slug]` | Dynamic Event Detail page with schedule, rules, and registration link | Pre-rendered (SSG) |
| `/gallery` | Media Archival with 8 category tabs, 4-column responsive grid, and full-screen lightbox | Static (SSG) |
| `/achievements` | Student & Faculty Competitive Awards, Hackathon Victories, and Publications | Static (SSG) |
| `/placements` | Placement Statistics, LPA metrics, Top Hiring Partners, and Verified Batch summaries | Static (SSG) |
| `/alumni` | Alumni Network, Batch Registers with PDF download cards, and Graduate Testimonials | Static (SSG) |
| `/campus-life` | Laboratories, Library, Sports Complex, Hostel, and Transportation facilities | Static (SSG) |
| `/contact` | Inquiry Portal with Zod-validated submission form, campus coordinates, and Google Maps | Static (SSG) |
| `/privacy` | Data protection policy and student privacy standards | Static (SSG) |
| `/sitemap.xml` | Dynamically generated XML sitemap adhering to Google Search Console specs | Dynamic XML |
| `/robots.txt` | Crawler directives allowing search engines while guarding `/admin/*` and `/api/*` | Dynamic Text |

### Administrative Control Center Routes
| Route | Description | Protection |
|---|---|---|
| `/admin/login` | Institutional administrator sign-in portal with seed auto-fill helper | Public (Guarded) |
| `/admin` | Main Control Dashboard with telemetry metric cards, recent inquiries, and quick actions | HMAC Session |
| `/admin/faculty` | Faculty CRUD Manager with photo upload and public contact visibility toggles | HMAC Session |
| `/admin/events` | Events & Announcements Manager with automatic slug derivation and status toggles | HMAC Session |
| `/admin/gallery` | Media Archival Manager with drag-and-drop file upload and lightbox preview | HMAC Session |
| `/admin/messages` | Inquiries Inbox with read/unread flags, archive, and direct mailto client reply | HMAC Session |
| `/admin/system-health` | Real-time diagnostic console monitoring DB latency, memory heap, domain SSL, and CI | HMAC Session |

### API Endpoints
| Endpoint | Method | Functionality |
|---|---|---|
| `/api/contact` | `POST` | Validated contact form endpoint with honeypot and token-bucket rate limiter (10 req/min/IP) |
| `/api/log-error` | `POST` | Client-side error telemetry logger recording exceptions into Mongoose `ErrorLog` |
| `/api/admin/login` | `POST` | Authenticates administrator credentials and issues secure HTTP-only cookie |
| `/api/admin/logout` | `POST` | Clears administrative session cookie |
| `/api/admin/me` | `GET` | Validates session token and returns active administrator profile |
| `/api/admin/health` | `GET`, `POST` | System diagnostics endpoint checking DB latency, memory, SSL, and error logs |
| `/api/admin/upload` | `POST` | Secure asset upload handler validating MIME type and 5MB size limit to `/public/uploads/` |
| `/api/admin/faculty` | `GET`, `POST` | Query all faculty or register new faculty member |
| `/api/admin/faculty/[id]` | `PUT`, `DELETE` | Update faculty profile or remove faculty from directory |
| `/api/admin/events` | `GET`, `POST` | Query all event notices or publish new event |
| `/api/admin/events/[id]` | `PUT`, `DELETE` | Update event notice or remove event |
| `/api/admin/gallery` | `GET`, `POST` | Query all gallery assets or archive new photograph |
| `/api/admin/gallery/[id]` | `DELETE` | Remove photograph from gallery |
| `/api/admin/messages` | `GET` | Retrieve inquiries with read/unread counters |
| `/api/admin/messages/[id]` | `PATCH`, `DELETE` | Toggle read/archive status or permanently delete inquiry |

---

## 🚀 Quickstart & Local Development

### 1. Prerequisites
- **Node.js**: `v20.x` or higher (`v22` / `v26` supported)
- **npm**: `v10.x` or higher
- Optional: Local MongoDB instance running on port 27017, or a free MongoDB Atlas M0 Cluster.

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/sriet-it/tecra-portal.git
cd tecra-portal

# Install dependencies cleanly
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

Ensure the following variables are defined in `.env.local`:
```env
# Database Connection (MongoDB Atlas or local)
DATABASE_URL=mongodb://localhost:27017/tecra_it

# Web Crypto Session Secret (min 32 characters)
AUTH_SECRET=tecra_super_secret_auth_key_change_in_production_min_32_chars

# Public Base URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Administrative Credentials
ADMIN_SEED_EMAIL=admin@tecra.sriet.ac.in
ADMIN_SEED_PASSWORD=TecraAdminSecurePass2026!

# Email Service (Optional for live outbound mail notifications)
EMAIL_FROM=noreply@tecra.sriet.ac.in
```

### 4. Database Seeding (Optional)
To seed initial faculty, events, gallery, and association records into MongoDB:
```bash
npm run seed
```
*(Note: If MongoDB is offline, the website automatically loads from the built-in resilient data fallback layer).*

### 5. Running the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to view the live website.

### 6. Production Build & Verification
```bash
# Run ESLint validation
npm run lint

# Run strict TypeScript type check
npx tsc --noEmit

# Compile Next.js production build
npm run build

# Start the production server
npm run start
```

---

## 🔐 Administrative Access & Management

1. Navigate to **[http://localhost:3000/admin/login](http://localhost:3000/admin/login)**.
2. Enter the authorized administrative credentials:
   - **Administrative Email**: `admin@tecra.sriet.ac.in`
   - **Security Password**: `TecraAdminSecurePass2026!`
   *(A "Fill Credentials" auto-fill button is provided on the login page for convenience during evaluation).*
3. Upon authentication, you will be redirected to the **Admin Control Center (`/admin`)**.
4. The administrative session is cryptographically signed using Web Crypto HMAC-SHA256 and stored in an HTTP-Only secure cookie (`tecra_admin_session`, 7-day validity).

---

## 🔄 Automated CI/CD Workflow (`.github/workflows/ci.yml`)

The repository includes a production-grade GitHub Actions continuous integration workflow that triggers automatically on every push or pull request to `main` and `master`:

```yaml
name: TECRA IT CI/CD Pipeline
on: [push, pull_request]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit

  build-production:
    needs: lint-and-typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
      - run: test -d .next || exit 1
```

---

## ☁️ Production Deployment Guide

### Option A: Deployment to Vercel (Recommended)
1. Push the repository to GitHub: `git push origin main`.
2. Import the project into the [Vercel Dashboard](https://vercel.com/new).
3. Configure Environment Variables in **Project Settings ➔ Environment Variables**:
   - `DATABASE_URL`: `mongodb+srv://<username>:<password>@cluster.mongodb.net/tecra_it?retryWrites=true&w=majority`
   - `AUTH_SECRET`: Random 64-character secret key.
   - `ADMIN_SEED_EMAIL`: `admin@tecra.sriet.ac.in`
   - `ADMIN_SEED_PASSWORD`: Secure production password.
   - `NEXT_PUBLIC_SITE_URL`: `https://tecra.sriet.ac.in`
4. Click **Deploy**. Vercel will automatically build the standalone Next.js App Router application across the Edge Global CDN.
5. In **Domains**, add `tecra.sriet.ac.in`. Point DNS `CNAME` to `cname.vercel-dns.com`. Vercel automatically provisions Let's Encrypt TLS 1.3 certificates.

### Option B: Node.js VPS / Docker Server
```bash
# Build the production application
npm run build

# Start the Node.js production server with PM2
npm install -g pm2
pm2 start npm --name "tecra-portal" -- start -- -p 3000

# Setup Nginx reverse proxy with SSL
# /etc/nginx/sites-available/tecra.sriet.ac.in
server {
    server_name tecra.sriet.ac.in;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🎨 Design System & Aesthetic Principles

- **Primary Colors**: Midnight Blue (`#070B18`, `#0B132B`, `#111C44`), Institutional Navy (`#1E3A8A`), Warm Gold (`#DDA853`), Sand (`#E2D4C9`), Ivory (`#F8F9FA`).
- **Accents**: Neon Cyan (`#00F0FF`), Emerald Green (`#10B981`), Ruby Rose (`#F43F5E`), Amber (`#F59E0B`).
- **Typography**:
  - Headings: `Manrope` (Variable Google Font)
  - Body & UI: `Inter` (Variable Google Font)
  - Code & Badges: JetBrains Mono / SF Mono
- **Glassmorphism**: Semi-transparent dark surfaces with `backdrop-blur-md` and `border border-white/10`.

---

## 📞 Department Directory & Contacts

- **Institution**: Sri Ranganathar Institute of Engineering and Technology (SRIET)
- **Department**: Department of Information Technology (TECRA)
- **Address**: Athipalayam, Coimbatore – 641110, Tamil Nadu, India
- **Head of Department**: Dr. K. Radhika M.E., Ph.D. (`hod.it@sriet.ac.in`)
- **Department Office**: Room 201, Block B (Computing Sciences Block)
- **Admissions Helpline**: `+91 94432 12345` / `admissions@sriet.ac.in`
- **Official Website**: [https://tecra.sriet.ac.in](https://tecra.sriet.ac.in)

---

*Developed for the Department of Information Technology, Sri Ranganathar Institute of Engineering and Technology. All rights reserved.*
