# Random People Full Stack Assignment

Working React and Node application for browsing random profiles, saving them to a backend, and editing or deleting saved profiles.

## Tech Stack

- React, TypeScript, and Vite for a fast strict frontend setup.
- Redux Toolkit for predictable app-level state management with low boilerplate.
- React Router for the required screen navigation.
- Node, TypeScript, and Express for a minimal backend API.
- Zod for request validation at the backend boundary.
- JSON file persistence in `server/data/people.json`, chosen to keep the assignment easy to run without external database setup.

## Prerequisites

- Node.js 20 or newer.
- npm 10 or newer.

## Install

```bash
npm run install:all
```

## Run

Start the server:

```bash
npm run dev:server
```

Start the client in another terminal:

```bash
npm run dev:client
```

Open `http://localhost:5173`.

The client expects the API at `http://localhost:4000/api`. Override it with:

```bash
VITE_API_BASE_URL=http://localhost:4000/api npm run dev --prefix client
```

## Build

```bash
npm run build
```

## API

- `GET /api/health`
- `GET /api/people`
- `POST /api/people`
- `PATCH /api/people/:id`
- `DELETE /api/people/:id`

## Notes and Shortcuts

- No authentication, as requested.
- Persistence is file-based instead of a hosted database.
- UI is custom CSS to keep dependencies small.
- Production follow-ups would include automated tests, stronger logging, Docker, CI, and duplicate-save handling rules.
