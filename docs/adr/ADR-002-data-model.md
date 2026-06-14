# ADR-002: Data Model

## Background

The app only needs owner OAuth tokens and booking lifecycle records.

## Decision

Store one encrypted Google OAuth token row and booking rows with status, UTC start/end, attendee data, Google event ID, and cancel token.

## Alternatives Considered

- Store mirrored Google events locally: rejected because FreeBusy can be queried live.
- Store no bookings locally: rejected because local pending locks and cancel tokens are needed.

## Trade-offs

Local bookings are not a full calendar mirror. Google Calendar remains the busy-time authority.

## Consequences

If the SQLite file is lost, existing Google events remain but cancel links created by the app stop working.
