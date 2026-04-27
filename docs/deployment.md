# Deployment

## Local Development

Install dependencies:

```bash
npm run install:all
```

Start the backend:

```bash
npm run dev:server
```

Start the frontend:

```bash
npm run dev:client
```

Open:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

## Hosting Notes

The backend is a normal long-running Express server, which is a good fit for:

- Render Web Service
- Railway
- Fly.io
- AWS container or VM hosting

The frontend can be deployed separately as a static site.

## SQLite Persistence

Saved profiles are stored in:

```text
server/data/people.sqlite
```

For hosted deployments, SQLite should be placed on persistent storage. On Render, that means adding a persistent disk and configuring the backend to write the database there.

For a Vercel-only serverless deployment, local SQLite is not reliable because serverless filesystems are ephemeral. A hosted database such as Neon, Supabase, or Turso would be a better production choice.
