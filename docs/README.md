# Documentation

This folder documents the application architecture, data flow, API surface, and deployment considerations for the Random People assignment.

## Contents

- [Architecture](./architecture.md): high-level system structure and module responsibilities.
- [API](./api.md): backend endpoints used by the React client.
- [State Management](./state-management.md): Redux Toolkit state shape and async flows.
- [Deployment](./deployment.md): local run model and hosting notes.
- [Diagrams](./diagrams): Mermaid diagrams for architecture and user flows.

## Design Goals

- Keep the frontend and backend clearly separated.
- Keep the backend API intentionally small.
- Use strict TypeScript across client and server.
- Use Redux Toolkit for predictable frontend state management.
- Use TypeORM over SQLite so persistence code avoids handwritten SQL.
- Keep files small and organized by responsibility.
