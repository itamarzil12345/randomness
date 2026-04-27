# Codebase Guidelines

## TypeScript

- Use strict TypeScript in both client and server projects.
- Avoid `any`. If a type is unknown, use `unknown` and narrow it explicitly.
- Define shared domain types for people, API payloads, and API responses.
- Prefer explicit return types for exported functions, service functions, and API handlers.
- Keep nullable values visible in the type system with `null` or `undefined`, and handle them before rendering or persisting data.

## File Size

- Keep each source file at 150 lines of code or fewer.
- If a file grows beyond 150 lines, split it by responsibility:
  - UI components into smaller presentational components.
  - Redux logic into slice, selectors, and thunks if needed.
  - Backend routes, services, validation, and database access into separate files.
- Do not split files only to hide complexity. Each extracted file should have a clear purpose.

## Structure

- Keep client and server clearly separated:

```text
client/
server/
```

- Group code by feature where possible.
- Keep reusable UI in `components`.
- Keep API calls in dedicated API modules.
- Keep backend request handling, business logic, and persistence in separate layers:
  - routes/controllers for HTTP concerns.
  - services for application logic.
  - repositories/database modules for persistence.
- Avoid circular dependencies.

## Constants

- No magic strings or magic numbers in business logic.
- Move repeated strings, route paths, storage keys, API URLs, validation limits, and status labels into named constants.
- Use enums or string literal unions for constrained values such as profile source, loading status, and gender if needed.
- Keep constants close to their feature unless they are genuinely shared.

## Naming

- Use clear, specific names that describe intent.
- Prefer `savedPeople`, `randomPeople`, `updatePersonName`, and `fetchSavedPeople` over vague names like `data`, `items`, `handleClick`, or `process`.
- Name React components with PascalCase.
- Name hooks with the `use` prefix.
- Name boolean values as questions or states, such as `isLoading`, `hasError`, and `canSave`.

## React

- Prefer functional components and hooks.
- Keep components focused:
  - Page components coordinate data loading and navigation.
  - Presentational components render UI.
  - Form components own local form state where appropriate.
- Keep screen-local UI state local, such as filters and temporary input values.
- Keep cross-screen profile data in Redux.
- Do not duplicate server state unnecessarily.
- Handle loading, empty, and error states for each async screen.

## Redux

- Use Redux Toolkit.
- Use async thunks for API calls.
- Keep reducers pure.
- Put derived data in selectors when it is reused or non-trivial.
- Do not store values in Redux that can be derived from existing state unless it improves clarity.

## Backend

- Keep Express route handlers thin.
- Validate request bodies before calling services.
- Return consistent JSON errors.
- Use proper HTTP status codes.
- Keep database access isolated from route handlers.
- Do not trust client-provided data without validation.

## Error Handling

- Surface user-friendly errors in the UI.
- Log useful server-side errors without exposing internal details to the client.
- Avoid silent failures.
- Prefer explicit error branches over broad catch blocks that hide the cause.

## Formatting

- Use a formatter consistently.
- Keep imports organized.
- Remove unused imports, dead code, commented-out code, and temporary logs before submission.
- Prefer simple code over clever abstractions.

## Documentation

- Document setup and run commands in `README.md`.
- Document third-party library choices and their benefits.
- Note intentional shortcuts and what would be improved in production.
- Keep comments short and useful. Do not comment obvious code.

## Verification

- Before submission, verify:
  - Server starts successfully.
  - Client starts successfully.
  - Random users can be fetched.
  - Saved users can be loaded from the backend.
  - Save, update, delete, filter, and back navigation work.
  - Production builds complete for both client and server.
