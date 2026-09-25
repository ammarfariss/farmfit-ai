# Security

## Secrets

Never commit:

- API keys;
- access tokens;
- passwords;
- private keys;
- service credentials;
- real `.env` files.

Use environment variables and keep only placeholder variable names in `.env.example`.

## If a Secret Is Accidentally Committed

Deleting the file is not enough because Git history may still contain the secret.

Immediately:

1. revoke/rotate the credential;
2. remove it from the working tree;
3. notify the team;
4. clean history if necessary.

## Personal Data

FarmFit's core planning workflow should not require personally identifiable information.

Do not collect or store PII unless it is genuinely necessary and documented.

## External Services

Third-party APIs may log requests or apply their own privacy/usage terms. Document any external service actually used by the final prototype.

## Reporting a Security Problem

Do not post active credentials or exploitable sensitive details in a public GitHub issue. Contact the repository owner/team directly through the available project communication channel.
