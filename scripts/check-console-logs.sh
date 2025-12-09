#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# Check for console.log statements in source code

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Checking for console.log statements..."

# Get staged files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$' | grep -v '.test.' | grep -v '.spec.' | grep -v 'node_modules' || true)

if [ -z "$STAGED_FILES" ]; then
    echo -e "${GREEN}✅ No source files staged${NC}"
    exit 0
fi

FOUND=0
for FILE in $STAGED_FILES; do
    if [ -f "$FILE" ]; then
        # Check for console.log but exclude console.warn and console.error
        MATCHES=$(git diff --cached "$FILE" | grep -E "^\+.*console\.(log|info|debug)" | grep -v "^\+.*\/\/" || true)
        if [ -n "$MATCHES" ]; then
            echo -e "${RED}❌ Found console.log in: $FILE${NC}"
            echo "$MATCHES"
            FOUND=1
        fi
    fi
done

if [ $FOUND -eq 1 ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Console.log statements found!${NC}"
    echo "Please use structured logging instead:"
    echo "  Backend: import { logger } from '@/utils/logger'"
    echo "  Frontend: import { logger } from '@/utils/logger'"
    echo ""
    echo "Or use console.warn() / console.error() if intentional."
    exit 1
fi

echo -e "${GREEN}✅ No console.log found${NC}"
exit 0
