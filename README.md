# professional traveling — Professional travel agency website

Vite + React + TypeScript single-page app, wired to the Makseb Travel backend API
(template_02 / Makseb Modern, PROFESSIONAL tier).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build
npm run preview    # serve the production build
```

## Environment

Copy `.env.example` to `.env.local` and set:

| Variable          | Value                                                        |
| ----------------- | ------------------------------------------------------------ |
| `VITE_API_URL`    | Backend base URL (e.g. `http://localhost:3000`)              |
| `VITE_AGENCY_ID`  | Agency id whose website content this app renders             |

The app reads `frontend/.env.global` for defaults; a non-blank value in this
app's `.env.local` overrides it.

## Endpoints consumed

- Public: `GET /agency/website-content/:agencyId` (ETag-cached)
- Admin (`/admin`): `POST /auth/signin`, `GET /auth/me`,
  `GET /agency/sections`, `GET /agency/section-details/:templateSectionId`,
  `PATCH /agency/sections/:templateSectionId`

Admin demo: `hello@professionaltraveling.com` / `StrongPass123`.
