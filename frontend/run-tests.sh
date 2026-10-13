#!/bin/sh
set -e
DIR="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
JSC="/System/Library/Frameworks/JavaScriptCore.framework/Versions/Current/Helpers/jsc"
TMP="$(mktemp)"
cat "$DIR/emi.js" "$DIR/emi.test.js" > "$TMP"
"$JSC" "$TMP"
STATUS=$?
rm -f "$TMP"
exit "$STATUS"
