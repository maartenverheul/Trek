This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Markers via PostGIS

This app persists map markers in a Postgres + PostGIS database using Knex.

- Set environment variables in `.env.local` (see `.env.example`).
- Initialize schema and optional sample data via Knex:

```bash
npm run knex:migrate
npm run knex:seed # optional
```

### Quick PostGIS on Windows (Docker)

If you don't have Postgres/PostGIS locally, you can run via Docker:

```powershell
docker run -d --name trek-postgis -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=trek -p 5432:5432 postgis/postgis:16-3.4
```

Then set in `.env.local`:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/trek
DATABASE_SSL=false
```

### Usage

- Server actions in `app/actions/markers.ts` provide `getMarkersAction`, `saveMarkerAction`, and `deleteMarkerAction`.
- Data is stored with a `geometry(Point, 4326)` column; queries project `lat`/`lng` via `ST_Y`/`ST_X`.
