# Secrets and FERPA

## Keep secrets on your computer only

- **Do not commit** `.env`, `.env.local`, or files with API keys, OAuth secrets, or Kaltura admin credentials.
- Copy `.env.example` to `.env` on **your machine** and fill in real values there. `.env` stays gitignored.
- Instructional designers and developers store credentials locally or in approved institutional tools — **not in GitHub**.

## Cursor and AI chat

- Do not paste **passwords**, **tokens**, or **student data** into Cursor prompts.
- Do not ask the AI to commit `.env` files.

## FERPA

- Do not put **student names**, **UGA IDs**, or **grades** in code, commits, or AI messages.
- Use anonymized or aggregated data when testing.

## If you accidentally staged a secret

1. Stop — do not push.
2. Ask your lead for help removing the file from git history if it was already pushed.
3. Rotate the exposed credential.
