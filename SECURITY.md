# Security Policy

## Reporting a vulnerability

Please do not report vulnerabilities in public issues. Contact the project
maintainer privately through GitHub's security advisory reporting for this
repository. Include the affected area, impact, and steps to reproduce. You will
receive a response as soon as practical.

## Secrets

Never commit secrets. Do not put secret keys in `.env.example`, source code, or
the frontend. Keep server-side provider keys in the relevant server-side secret
store. If a secret is exposed, revoke and rotate it immediately.
