---
description: Enable git hooks for COMMIT_TEMPLATE (run once per clone)
---

Run the repo setup script so local commits use [`.github/COMMIT_TEMPLATE`](../../.github/COMMIT_TEMPLATE) and validate the subject line.

From the repository root:

```bash
./scripts/setup-git-hooks.sh
```

Confirm `git config core.hooksPath` returns `.githooks`. Tell the user to delete template comment lines and keep one imperative subject line when committing.

Do not change other git config unless the user asks.
