# Contributing to FarmFit AI

FarmFit AI is an open-source hackathon project.

## Before You Push

1. Pull the latest `main`.
2. Never commit:
   - API keys;
   - passwords;
   - tokens;
   - `.env` files;
   - private data.
3. Keep implementation claims consistent with the code.
4. Add any new external API/dataset to `docs/DATA_SOURCES.md`.
5. Add licence/attribution information to `docs/DATA_LICENSES.md`.
6. Prefer clear commit messages.

## Suggested Commit Messages

- `feat: add portfolio optimizer`
- `feat: add map plot selection`
- `data: integrate NASA POWER weather inputs`
- `fix: enforce water constraint`
- `docs: update run instructions`

## Pull / Push Workflow

```bash
git pull origin main
git status
git add .
git commit -m "describe the change"
git push origin main
```

Do not force-push shared `main` during the hackathon unless the team explicitly agrees.

## Documentation Rule

If a feature is not implemented, label it planned/future. Do not write documentation that makes an unimplemented feature appear complete.
