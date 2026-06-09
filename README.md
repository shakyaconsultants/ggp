# Good Gut Product — SaaS (current status)

Multi-tenant nutrition platform: nutritionists run their practice from a web dashboard, clients use the mobile app, and platform admins use a separate admin panel.

## Repo layout

| Folder | Role |
|--------|------|
| `MyApi-main/` | Node.js + Express API (MySQL) — port **3000** |
| `ggp-saas-portal/` | React + Vite web app — landing, nutritionist dashboard, admin panel — port **5174** |
| `mobile_app/` | Flutter client app (existing Good Gut mobile experience) |

---

## What is working

### Public website (`ggp-saas-portal`)
- Marketing landing page
- Nutritionist **sign up** and **login**
- JWT session with auto logout on expiry

### Nutritionist dashboard (`/dashboard`)
- **Clients** — create client login (email + password), update status/notes, remove from practice, copy credentials
- **Client profile** — view health details filled in by the client in the mobile app
- **Consultation slots** — set availability by date
- **Food catalog** — CRUD food items with macros
- **Food templates** — group catalog items into reusable meals
- **Diet templates** — weekly meal structures (foods or food templates)
- **Diet plans** — assign plans to clients with date ranges; import from diet templates
- **Exercises** — exercise library + assign workouts to clients (visible in mobile app)
- **Profile** — update practice details
- Flash toasts for errors/success; sanitized API error messages (no raw HTML)

### Platform admin panel (`/admin`)
- Admin login (separate from nutritionist auth)
- **Overview** — SaaS analytics (KPIs, growth, top practices)
- **Nutritionists** — searchable list, practice detail pages
- **Clients** — filter by nutritionist + status
- **Shop catalog** — CRUD products for future in-app shop mapping

### API (`MyApi-main`)
- Existing nutritionist, client, diet, food, exercise, and slot endpoints
- **SaaS client routes** (`sqlroutes/saasPortal.js`) — nutritionists create client accounts from the portal
- **Admin routes** (`sqlroutes/admin.js`) — analytics, tenants, clients, shop products
- Swagger docs at `/api-docs`

### Mobile app (`mobile_app`)
- Clients log in with credentials created by their nutritionist
- Clients complete their own profile in the app; nutritionist sees it in the dashboard
- Diet plans, meals, exercises, and calls use the existing API

---

## Quick start

### 1. API
```bash
cd MyApi-main
npm install
# configure .env (MySQL, GGP_SECRET_KEY, etc.)
npm run db:init          # first time
npm run db:seed-admin    # first time
npm start                # http://localhost:3000
```

### 2. SaaS portal
```bash
cd ggp-saas-portal
npm install
npm run dev              # http://localhost:5174
```

Portal proxies API requests via `VITE_API_URL=/api` (see `vite.config.js`).

### 3. Mobile (optional)
```bash
cd mobile_app
flutter pub get
flutter run
```

---

## Default access

| Role | URL | Notes |
|------|-----|--------|
| Landing | http://localhost:5174/ | Public site |
| Nutritionist | http://localhost:5174/register | Self-service signup |
| Nutritionist dashboard | http://localhost:5174/dashboard | After login |
| Admin | http://localhost:5174/admin/login | Seeded admin user (see `db:seed-admin`) |

**Important:** After backend changes, restart the API (`npm start` in `MyApi-main`). A stale API process can return outdated responses.

---

## Architecture (high level)

```
Nutritionist (web) ──► ggp-saas-portal ──► MyApi-main ──► MySQL
Admin (web)        ──► /admin/*         ──► /admin/*   ──► MySQL
Client (mobile)    ──► mobile_app       ──► /api/*     ──► MySQL
```

Each nutritionist is a tenant: their clients, foods, templates, diet plans, and exercises are scoped by `nutritionist_id`.

---

## Not in scope yet

- Team accounts / multi-seat billing
- Nutritionist creation from admin (practices self-register)
- Global unfiltered client list in admin (clients are viewed per nutritionist)
- Full shop checkout in the mobile app (admin catalog is prepared for future mapping)

---

## Subscription & pricing (Razorpay)

| Phase | What happens |
|-------|----------------|
| **Signup** | 15-day free trial starts (₹1,000 value) — full dashboard + client app access |
| **During trial** | Yellow banner in dashboard shows days remaining |
| **After 15 days** | Dashboard redirects to `/billing`; clients cannot log into the mobile app |
| **Payment** | ₹1,000/year via Razorpay — restores dashboard + client app for 1 year |

### API env (`MyApi-main/.env`)

```env
TRIAL_DAYS=15
SUBSCRIPTION_PRICE_INR=1000
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

Run migration after pulling: `npm run db:init` (includes subscription columns) or apply `sql/migrations/add_nutritionist_subscription.sql`.

Restart API after env changes.

---

## Health check

- API: http://localhost:3000/test
- API docs: http://localhost:3000/api-docs
