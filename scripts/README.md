# Scripts (`uga-lit-components`)

Helper scripts for local development and content authoring. None of these ship in `dist/js/uga-components.js`.

## One-time setup

| Script | Command | Purpose |
|--------|---------|---------|
| [setup-git-hooks.sh](setup-git-hooks.sh) | `./scripts/setup-git-hooks.sh` | Enable `.githooks/` (commit template + message validation). Sets `core.hooksPath` for this repo clone only. |

Commit validation also runs in CI via [.github/scripts/validate-commit-message.sh](../.github/scripts/validate-commit-message.sh).

## npm scripts

| npm command | Script | Purpose |
|-------------|--------|---------|
| `npm run test:kaltura` | [test-kaltura-plays.ts](test-kaltura-plays.ts) | Dev-only: test Kaltura admin session and play count for an entry ID. |
| `npm run quiz:csv-to-json -- <in.csv> [out.json]` | [csv-to-json.ts](csv-to-json.ts) | Convert eLC question-import CSV to `uga-quiz` JSON (same parser as runtime `type="csv"`). |

### `test:kaltura`

```bash
npm run test:kaltura
npm run test:kaltura -- 1_yourEntryId
```

**Requires:** `kaltura-secrets.ts` (copy from `kaltura-secrets.example.ts`, gitignored). Uses `src/lib/api/kaltura-client.ts`, which is **not** imported by Lit components in the bundle.

### `quiz:csv-to-json`

```bash
npm run quiz:csv-to-json -- demo/quiz/quiz-sample.csv demo/quiz/quiz-sample-converted.json
```

If `out.json` is omitted, writes alongside the CSV with a `.json` extension.

See [docs/QUIZ_JSON_FORMAT.md](../docs/QUIZ_JSON_FORMAT.md) for CSV layout and quiz attributes.

## Secrets

- **Kaltura:** `kaltura-secrets.ts` only — never commit. Not used by the production component bundle.
- **No `.env`** in these scripts except what you add locally for other tooling.

## For Cursor agents

- Prefer **`npm run`** entries above over hand-running `tsx` paths.
- Do not commit `kaltura-secrets.ts` or paste admin secrets into chat.
- `setup-git-hooks.sh` changes local git config; run only when the user wants hooks.
