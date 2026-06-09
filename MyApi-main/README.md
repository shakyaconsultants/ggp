# Good Gut Project API

Node.js + Express backend for the Good Gut Product SaaS platform. Serves the nutritionist portal (`ggp-saas-portal`), mobile app (`mobile_app`), and admin panel.

**Entry point:** `server.js` (port 3000)

## Quick start

```bash
npm install
cp .env.example .env   # configure MySQL, GGP_SECRET_KEY, Razorpay, Jitsi, etc.
npm run db:setup       # first time: schema + slots + admin seed
npm start              # http://localhost:3000
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npm start` | Run API |
| `npm run db:init` | Apply SQL schema and migrations |
| `npm run db:seed-slots` | Seed consultation time templates (9:00–17:30) |
| `npm run db:seed-admin` | Create default platform admin |

## Active API surfaces

| Consumer | Routes |
|----------|--------|
| Mobile app | `/login`, `/userdata`, `/usermeta`, `/dietplans/me`, meals, calls, chat, shop |
| Nutritionist portal | `/nutritionists/*`, `/saas/*`, diet/food templates, slots, billing, chat, calls |
| Admin panel (`/admin` in portal) | `/admin/login`, `/admin/analytics`, `/admin/nutritionists`, `/admin/clients`, `/admin/products` |

Client accounts are created by nutritionists via `POST /saas/nutritionists/:id/clients/signup` — there is no public client signup.

## Environment

See `.env.example` for required variables:

- `DB_*` — MySQL connection
- `GGP_SECRET_KEY` — JWT signing
- `VALID_API_KEYS` — optional admin integrations (`x-api-key`)
- `TRIAL_DAYS`, `SUBSCRIPTION_PRICE_INR`, `RAZORPAY_*` — billing
- `JITSI_DOMAIN`, `JITSI_ROOM_PREFIX`, `CALL_JOIN_MINUTES_*` — video calls

## Deployment

- **Vercel:** `vercel.json` points to `server.js`
- **Other hosts:** run `node server.js` with env vars set; ensure MySQL is reachable and WebSocket port is supported

Restart the API after env or code changes.
