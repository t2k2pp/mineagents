#!/usr/bin/env bash

# Check if a prompt was provided
if [ -z "$1" ]; then
  echo "Usage: $0 \"<prompt_text>\""
  exit 1
fi

PROMPT="$1"
LOG_PATH="$HOME/.agent_prompts.jsonl"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

if command -v jq >/dev/null 2>&1; then
  JSON_ENTRY=$(jq -n --arg ts "$TIMESTAMP" --arg p "$PROMPT" '{timestamp: $ts, prompt: $p}' -c)
else
  # Fallback to basic escaping if jq is not installed
  ESCAPED_PROMPT=$(echo "$PROMPT" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')
  JSON_ENTRY="{\"timestamp\":\"$TIMESTAMP\",\"prompt\":\"$ESCAPED_PROMPT\"}"
fi

echo "$JSON_ENTRY" >> "$LOG_PATH"
