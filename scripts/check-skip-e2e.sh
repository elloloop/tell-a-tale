#!/bin/bash
# Script to check if E2E tests should be skipped

# Check the event type
if [[ "$GITHUB_EVENT_NAME" == "pull_request" ]]; then
  # Make sure the event.json file exists
  if [[ -f "$GITHUB_EVENT_PATH" ]]; then
    PR_TITLE=$(jq -r .pull_request.title "$GITHUB_EVENT_PATH")
    if [[ "$PR_TITLE" =~ \[skip-e2e\] ]]; then
      echo "Skipping E2E tests due to [skip-e2e] flag in PR title"
      echo "skip=true" >> $GITHUB_OUTPUT
      exit 0
    fi
  else
    echo "Warning: Event path file not found at $GITHUB_EVENT_PATH"
  fi
fi

# Check commit message for [skip e2e] flag
if [[ -n "$TEST_COMMIT_MSG" ]]; then
  COMMIT_MSG="$TEST_COMMIT_MSG"
else
  COMMIT_MSG=$(git log -1 --pretty=%B)
fi

if [[ "$COMMIT_MSG" =~ \[skip-e2e\] ]]; then
  echo "Skipping E2E tests due to [skip-e2e] flag in commit message"
  echo "skip=true" >> $GITHUB_OUTPUT
  exit 0
fi

# No skip flag found
echo "skip=false" >> $GITHUB_OUTPUT
