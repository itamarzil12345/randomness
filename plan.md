# Full Stack Home Assignment Implementation Plan

## Goal

Build a working full stack application that displays random people from `randomuser.me`, supports filtering and profile details in React, and persists selected profiles through a TypeScript Node backend with a lightweight database.

The implementation will prioritize a complete, working flow over excessive features, while keeping the code structured enough to demonstrate React and Node best practices.

## Proposed Stack

### Frontend

- React with TypeScript, using Vite for fast setup and development.
- React Router for the required screen navigation.
- Redux Toolkit for state management, because the assignment explicitly asks for a state management tool and Redux Toolkit provides predictable global state with low boilerplate.
- Material UI for UI components, because no design is provided and it gives accessible, production-grade inputs, buttons, tables/lists, and layout primitives quickly.
- Axios or native `fetch` for HTTP calls. Prefer native `fetch` unless Axios becomes useful for shared interceptors or typed API helpers.

### Backend

- Node.js with TypeScript.
- Express for the HTTP API, because the assignment asks for a minimal backend and Express keeps the API simple.
- SQLite as the persistent database, using Prisma or better-sqlite3.
- Prefer Prisma if time allows, because it gives typed DB access and migrations; otherwise use better-sqlite3 for a smaller setup.
- Zod for validating request bodies at the API boundary if time allows.

## Repository Structure

Use two clear folders under the same repository:

```text
client/
  src/
    app/
    features/people/
    pages/
    components/
    api/
server/
  src/
    db/
    routes/
    services/
    types/
README.md
plan.md
```

This satisfies the requirement for a clear distinction between client and server projects while keeping submission simple.

## Data Model

Normalize Random User profiles into an app-specific `Person` shape instead of passing raw API objects through the whole app.

Suggested shape:

```ts
type Person = {
  id: string;
  source: "random" | "saved";
  gender: string;
  name: {
    title: string;
    first: string;
    last: string;
  };
  email: string;
  phone: string;
  picture: {
    thumbnail: string;
    large: string;
  };
  location: {
    country: string;
    streetNumber: number;
    streetName: string;
    city: string;
    state: string;
  };
  dob: {
    age: number;
    date: string;
  };
};
```

For unsaved Random User profiles, use `login.uuid` as the id. For saved DB profiles, use the database id or preserve the original uuid as a stable id.

## Backend API

Implement only the endpoints needed by the frontend:

```text
GET    /api/people
POST   /api/people
PATCH  /api/people/:id
DELETE /api/people/:id
GET    /api/health
```

Endpoint behavior:

- `GET /api/people`: return all saved profiles.
- `POST /api/people`: save a profile received from Screen 3.
- `PATCH /api/people/:id`: update the editable name fields for a saved profile.
- `DELETE /api/people/:id`: delete a saved profile.
- `GET /api/health`: simple health check for development and verification.

Validation:

- Validate required fields on create.
- Validate name fields on update.
- Return clear HTTP statuses: `400`, `404`, `201`, `204`, and `200`.

## Frontend Screens

### Screen 0: Home

- Show two primary actions:
  - `Fetch`: fetch 10 people from `https://randomuser.me/api/?results=10`, store them in Redux, and navigate to Screen 1.
  - `History`: fetch saved people from the backend and navigate to Screen 2.
- Show loading and error states for both actions.

### Screen 1: Random People List

- Display the last fetched random users.
- Each row includes:
  - Thumbnail
  - Full name: title + first + last
  - Gender
  - Country
  - Phone
  - Email
- Add filters for name and country.
- Clicking a row navigates to Screen 3 with context that the previous screen was Screen 1.
- If no people have been fetched, show an empty state with a button back to Screen 0.

### Screen 2: Saved People List

- Reuse the same list component as Screen 1.
- Data source is the backend saved profiles collection.
- Same filters and row click behavior.
- Clicking a row navigates to Screen 3 with context that the previous screen was Screen 2.

### Screen 3: Profile Details

- Display:
  - Large profile image
  - Gender
  - Editable name fields
  - Age and year of birth
  - Address: street number + name, city, state
  - Contact: email and phone
- Buttons:
  - `Save`: visible/enabled for profiles opened from Screen 1 that are not saved yet.
  - `Delete`: visible/enabled for profiles opened from Screen 2 or saved profiles.
  - `Update`: updates name.
    - For saved profiles, call backend `PATCH`.
    - For unsaved random profiles, update the Redux random people list only.
  - `Back`: return to the previous screen.

## State Management Plan

Use Redux Toolkit slices:

```text
peopleSlice
  randomPeople
  savedPeople
  selectedPerson
  loading states
  error states
```

Async thunks:

- `fetchRandomPeople`
- `fetchSavedPeople`
- `savePerson`
- `updateSavedPerson`
- `deleteSavedPerson`

Reducers:

- `updateRandomPersonName`
- optional `setSelectedPerson`

Keep filter values in local component state because they are screen-local UI state and do not need global persistence.

## Implementation Order

1. Scaffold `client` and `server` projects.
2. Implement backend database schema and CRUD API.
3. Add backend validation and error handling.
4. Implement frontend app shell, routing, and theme.
5. Implement API clients and Redux store.
6. Build Screen 0.
7. Build reusable people list component and Screens 1 and 2.
8. Build profile details page and Save/Delete/Update behavior.
9. Add README instructions for prerequisites, install, run, and build.
10. Verify the app manually end to end.

## Testing and Verification

Minimum verification:

- Backend:
  - Start server successfully.
  - Check `/api/health`.
  - Create, list, update, and delete a saved profile.
- Frontend:
  - `Fetch` loads 10 random people and navigates to the random list.
  - Filters work by name and country.
  - Row click opens profile details.
  - Unsaved profile name update is reflected in Screen 1.
  - Save stores a profile in backend.
  - `History` loads saved profiles.
  - Saved profile update persists through backend.
  - Delete removes saved profile from backend and Screen 2.

If time allows:

- Add unit tests for backend service logic.
- Add component tests for filtering.
- Add basic end-to-end coverage with Playwright.

## Documentation

Add a root `README.md` with:

- Project overview.
- Tech stack and rationale for third-party libraries.
- Prerequisites.
- Client install/run/build commands.
- Server install/run/build commands.
- Environment variables, such as `VITE_API_BASE_URL` and `PORT`.
- Known shortcuts and production considerations.

## Expected Shortcuts

Given the suggested four-hour time limit, acceptable shortcuts:

- No authentication.
- Minimal backend API surface.
- Basic but clean UI using Material UI.
- Manual verification instead of broad automated tests if time is tight.
- Simple SQLite persistence instead of a hosted database.
- No cloud deployment unless core functionality is complete early.

## Production Follow-Ups

In a production version, improve:

- Stronger validation and API error contracts.
- Automated backend, frontend, and end-to-end tests.
- Duplicate prevention when saving the same random user twice.
- Pagination and search on saved profiles.
- Better server logging.
- Docker setup for consistent local runs.
- Cloud deployment with managed database and CI.
