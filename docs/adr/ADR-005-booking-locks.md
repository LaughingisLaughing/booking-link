# ADR-005: Booking Locks

## Background

Google Calendar FreeBusy and SQLite writes cannot be made atomically across systems. Two visitors could submit the same slot at nearly the same time.

## Decision

Booking uses a local pending lock before the final Google event insert:

1. Validate the requested start belongs to the configured static availability window.
2. Insert a `pending` booking with a unique active start time.
3. Recheck Google FreeBusy and other local active bookings, excluding the new lock.
4. Create the Google event.
5. Mark the booking `confirmed`, or `failed` on error.

## Alternatives Considered

- Check FreeBusy first and then write: simpler but more race-prone.
- Distributed lock/Redis: overbuilt for a personal single-instance app.

## Trade-offs

This does not eliminate an external Google Calendar event created in the tiny window before `events.insert`, but it prevents duplicate bookings within this app.

## Consequences

Deployment should remain single-instance unless the lock moves to a shared transactional database.
