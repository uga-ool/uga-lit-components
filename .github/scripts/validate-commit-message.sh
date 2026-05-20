#!/usr/bin/env bash
# Validates commit messages match .github/COMMIT_TEMPLATE rules (OOL).
set -euo pipefail

VAGUE_PATTERN='^(updates?|fix(es)?|fixed|stuff|wip|asdf|test|changes?|misc|todo)\.?$'

fail() {
  echo "commit-message: $*" >&2
  exit 1
}

validate_message_text() {
  local label="${1:-commit}"
  local text="$2"

  if echo "$text" | grep -qE '=== (Write your message|Before you commit|Examples)'; then
    fail "$label still contains COMMIT_TEMPLATE comment markers (delete template lines before committing)"
  fi

  local subject
  subject="$(echo "$text" | sed '/^[[:space:]]*#/d;/^[[:space:]]*$/d' | head -n 1)"

  if [ -z "$subject" ]; then
    fail "$label has no subject line (add one imperative line below the template header)"
  fi

  local len="${#subject}"
  if [ "$len" -lt 10 ] || [ "$len" -gt 72 ]; then
    fail "$label subject must be 10–72 characters (got $len): $subject"
  fi

  if echo "$subject" | grep -qiE "$VAGUE_PATTERN"; then
    fail "$label subject is too vague: $subject"
  fi
}

validate_message_file() {
  local file="$1"
  [ -f "$file" ] || fail "message file not found: $file"
  validate_message_text "commit" "$(cat "$file")"
}

validate_rev() {
  local rev="$1"
  local msg
  msg="$(git log -1 --format=%B "$rev" 2>/dev/null)" || fail "unknown revision: $rev"
  validate_message_text "commit $rev" "$msg"
}

validate_range() {
  local range="$1"
  local count=0
  local rev
  while IFS= read -r rev; do
    [ -n "$rev" ] || continue
    validate_rev "$rev"
    count=$((count + 1))
  done < <(git rev-list "$range" 2>/dev/null || true)

  if [ "$count" -eq 0 ]; then
    fail "no commits in range: $range"
  fi
  echo "Validated $count commit(s) in $range"
}

usage() {
  echo "Usage: $0 <commit-message-file>" >&2
  echo "       $0 --range <git-rev-range>   e.g. origin/main..HEAD" >&2
  exit 2
}

main() {
  if [ "$#" -eq 0 ]; then
    usage
  fi

  if [ "$1" = "--range" ]; then
    [ "$#" -eq 2 ] || usage
    validate_range "$2"
    exit 0
  fi

  if [ "$#" -eq 1 ] && [ -f "$1" ]; then
    validate_message_file "$1"
    exit 0
  fi

  if [ "$#" -eq 1 ]; then
    validate_rev "$1"
    exit 0
  fi

  usage
}

main "$@"
