#!/usr/bin/env bash
# One-time per clone: enable repo git hooks for COMMIT_TEMPLATE.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -d ".githooks" ]; then
  echo "error: .githooks/ not found in $ROOT" >&2
  exit 1
fi

chmod +x .githooks/* .github/scripts/validate-commit-message.sh 2>/dev/null || true

git config core.hooksPath .githooks

echo "Git hooks enabled for $(basename "$ROOT"):"
echo "  core.hooksPath = .githooks"
echo ""
echo "Commits will load .github/COMMIT_TEMPLATE and validate the subject line."
echo "Dry-run: .github/scripts/validate-commit-message.sh --range origin/main..HEAD"
