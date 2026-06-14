# ADR-003: Authentication Strategy

## Background

Only the calendar owner needs to authenticate. Visitors should not need accounts.

## Decision

Use Google OAuth web-server flow behind `ADMIN_SECRET`. Store refresh tokens encrypted with `TOKEN_ENCRYPTION_KEY`.

## Alternatives Considered

- Service account: requires calendar sharing/domain setup and is less natural for personal OAuth.
- Full user system: unnecessary for one owner.

## Trade-offs

The owner must reconnect if Google revokes or expires the refresh token.

## Consequences

`/admin` remains the operational setup surface.
