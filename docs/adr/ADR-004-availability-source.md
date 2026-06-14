# ADR-004: Availability Source

## Background

Calendar sync is the common complexity trap in scheduling apps.

## Decision

Do not sync calendars. Generate candidate slots from static availability rules, then subtract Google FreeBusy intervals and local active bookings.

## Alternatives Considered

- Webhook/watch channels: useful at scale but unnecessary for one booking page.
- Periodic sync: more failure modes and stale data.

## Trade-offs

Availability calls depend on Google API latency, but correctness is simpler.

## Consequences

If Google Calendar is disconnected or unavailable, booking is disabled.
