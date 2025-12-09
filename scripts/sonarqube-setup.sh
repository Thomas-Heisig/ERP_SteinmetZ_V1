#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
# SonarQube Setup Script

set -e

echo "🔍 SonarQube Setup Script"
echo "=========================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

if [ ! -f "sonar-project.properties" ]; then
    echo -e "${RED}❌ Error: sonar-project.properties not found${NC}"
    exit 1
fi

echo "✅ Found sonar-project.properties"
echo ""
echo "📝 Required GitHub Secrets:"
echo "   - SONAR_TOKEN"
echo "   - SONAR_HOST_URL"
echo ""

read -p "Have you configured these secrets? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "📖 Configure at: https://github.com/Thomas-Heisig/ERP_SteinmetZ_V1/settings/secrets/actions"
    exit 1
fi

echo ""
echo "🧪 Running Tests with Coverage..."
npm run test:coverage -w @erp-steinmetz/backend
npm run test:coverage -w @erp-steinmetz/frontend

echo ""
echo "📊 Checking Coverage Reports..."
[ -f "apps/backend/coverage/lcov.info" ] && echo -e "${GREEN}✅ Backend coverage${NC}" || exit 1
[ -f "apps/frontend/coverage/lcov.info" ] && echo -e "${GREEN}✅ Frontend coverage${NC}" || exit 1

echo ""
echo "✅ Setup complete!"
echo "Next: git push to trigger SonarQube analysis"
