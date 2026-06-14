# ADR-001: Tech Stack Selection

## Background

The app is single-owner and personal-use. It needs a public booking page, server-side Google Calendar calls, and low operational overhead.

## Decision

Use Next.js App Router, TypeScript, Node 25, built-in SQLite, and Google Calendar API.

## Alternatives Considered

- Cal.diy fork: too much surface area.
- Express + Vite: more moving parts.
- PostgreSQL: better for SaaS, unnecessary for a personal app.

## Trade-offs

SQLite and Next.js are simple, but multi-instance deployment needs care. This is acceptable because the app is personal and local/Railway single-instance first.

## Consequences

Railway deployment should use one instance and persistent disk.
