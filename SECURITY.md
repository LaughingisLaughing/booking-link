# Security Policy

## Reporting a Vulnerability

Please do not open a public issue for secrets, OAuth token handling bugs, or calendar authorization problems.

Use GitHub's private vulnerability reporting for this repository once it is published. If private reporting is not enabled yet, contact the repository owner privately before sharing details in public.

Expected response target: acknowledgement within 7 days, followed by a fix plan or status update when the issue is confirmed.

## Secret Handling

- Never commit `.env`, SQLite databases, OAuth client JSON files, private keys, or downloaded credentials.
- Rotate any Google OAuth client secret that has been committed, shared, or pasted into public logs.
- Delete local `data/*.db*` files before publishing example archives.
