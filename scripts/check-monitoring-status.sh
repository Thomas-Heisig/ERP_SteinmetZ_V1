#!/bin/bash
# SPDX-License-Identifier: MIT
# scripts/check-monitoring-status.sh
#
# Check the status of monitoring services and infrastructure

set -e

echo "🔍 ERP SteinmetZ - Monitoring Status Check"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo "📊 Checking Backend Status..."
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running${NC}"
    echo "   Start with: npm run dev:backend"
fi
echo ""

# Check monitoring endpoints
echo "📈 Checking Monitoring Endpoints..."

# Check metrics endpoint
if curl -s http://localhost:3000/api/monitoring/metrics > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Metrics endpoint (JSON) available${NC}"
else
    echo -e "${RED}❌ Metrics endpoint not available${NC}"
fi

# Check Prometheus endpoint
if curl -s http://localhost:3000/api/monitoring/metrics/prometheus > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Prometheus endpoint available${NC}"
else
    echo -e "${RED}❌ Prometheus endpoint not available${NC}"
fi

# Check monitoring health
if curl -s http://localhost:3000/api/monitoring/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Monitoring health endpoint available${NC}"
else
    echo -e "${RED}❌ Monitoring health endpoint not available${NC}"
fi
echo ""

# Check Docker containers
echo "🐳 Checking Docker Monitoring Stack..."

# Check if docker is available
DOCKER_CMD=""
if command -v docker-compose &> /dev/null; then
    DOCKER_CMD="docker-compose"
elif docker compose version &> /dev/null 2>&1; then
    DOCKER_CMD="docker compose"
fi

if [ -n "$DOCKER_CMD" ]; then
    # Get list of monitoring containers
    CONTAINERS=$(docker ps --filter "name=prometheus" --filter "name=grafana" --filter "name=jaeger" --filter "name=zipkin" --filter "name=otel-collector" --format "{{.Names}}" 2>/dev/null || echo "")
    
    if [ -z "$CONTAINERS" ]; then
        echo -e "${YELLOW}⚠️  No monitoring containers running${NC}"
        echo "   Start with: cd monitoring && ./start-monitoring.sh"
    else
        echo -e "${GREEN}✅ Monitoring containers found:${NC}"
        for container in $CONTAINERS; do
            STATUS=$(docker inspect -f '{{.State.Status}}' "$container" 2>/dev/null)
            if [ $? -ne 0 ]; then
                echo -e "   ${RED}✗${NC} $container (inspection failed)"
            elif [ "$STATUS" = "running" ]; then
                echo -e "   ${GREEN}✓${NC} $container (running)"
            else
                echo -e "   ${RED}✗${NC} $container ($STATUS)"
            fi
        done
    fi
else
    echo -e "${YELLOW}⚠️  Docker not available or not running${NC}"
fi
echo ""

# Check Prometheus
echo "📊 Checking Prometheus..."
if curl -s http://localhost:9090/-/healthy > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Prometheus is healthy${NC}"
    echo "   Access at: http://localhost:9090"
else
    echo -e "${YELLOW}⚠️  Prometheus not accessible${NC}"
fi
echo ""

# Check Grafana
echo "📈 Checking Grafana..."
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Grafana is healthy${NC}"
    echo "   Access at: http://localhost:3001"
    echo "   Default credentials: admin/admin"
else
    echo -e "${YELLOW}⚠️  Grafana not accessible${NC}"
fi
echo ""

# Check Jaeger
echo "🔍 Checking Jaeger (Distributed Tracing)..."
if curl -s http://localhost:16686/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Jaeger is accessible${NC}"
    echo "   Access at: http://localhost:16686"
else
    echo -e "${YELLOW}⚠️  Jaeger not accessible${NC}"
fi
echo ""

# Check configuration files
echo "📝 Checking Configuration Files..."

if [ -f "monitoring/prometheus/prometheus.yml" ]; then
    echo -e "${GREEN}✅ Prometheus config exists${NC}"
else
    echo -e "${RED}❌ Prometheus config missing${NC}"
fi

if [ -f "monitoring/grafana/erp-steinmetz-dashboard.json" ]; then
    echo -e "${GREEN}✅ Grafana dashboard config exists${NC}"
else
    echo -e "${RED}❌ Grafana dashboard config missing${NC}"
fi

if [ -f "monitoring/prometheus/alert-rules.yml" ]; then
    echo -e "${GREEN}✅ Alert rules config exists${NC}"
else
    echo -e "${RED}❌ Alert rules config missing${NC}"
fi
echo ""

# Summary and recommendations
echo "📋 Summary and Recommendations"
echo "=============================="
echo ""

# Check if backend is running
BACKEND_RUNNING=false
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    BACKEND_RUNNING=true
fi

# Check if monitoring stack is running
MONITORING_RUNNING=false
if curl -s http://localhost:9090/-/healthy > /dev/null 2>&1; then
    MONITORING_RUNNING=true
fi

if [ "$BACKEND_RUNNING" = true ] && [ "$MONITORING_RUNNING" = true ]; then
    echo -e "${GREEN}🎉 All systems operational!${NC}"
    echo ""
    echo "Your monitoring is fully configured and running."
    echo ""
    echo "Quick Links:"
    echo "  - Backend Health:    http://localhost:3000/api/health"
    echo "  - Metrics (JSON):    http://localhost:3000/api/monitoring/metrics"
    echo "  - Metrics (Prom):    http://localhost:3000/api/monitoring/metrics/prometheus"
    echo "  - Prometheus:        http://localhost:9090"
    echo "  - Grafana:           http://localhost:3001 (admin/admin)"
    echo "  - Jaeger:            http://localhost:16686"
elif [ "$BACKEND_RUNNING" = true ]; then
    echo -e "${YELLOW}⚠️  Backend is running, but monitoring stack is not${NC}"
    echo ""
    echo "To start monitoring:"
    echo "  cd monitoring && ./start-monitoring.sh"
elif [ "$MONITORING_RUNNING" = true ]; then
    echo -e "${YELLOW}⚠️  Monitoring stack is running, but backend is not${NC}"
    echo ""
    echo "To start backend:"
    echo "  npm run dev:backend"
else
    echo -e "${RED}❌ Neither backend nor monitoring is running${NC}"
    echo ""
    echo "To start everything:"
    echo "  1. Start backend:     npm run dev:backend"
    echo "  2. Start monitoring:  cd monitoring && ./start-monitoring.sh"
fi
echo ""

echo "📚 Documentation"
echo "================"
echo "  - Monitoring Setup:  monitoring/README.md"
echo "  - System Status:     docs/SYSTEM_STATUS.md"
echo "  - Project Analysis:  docs/PROJECT_ANALYSIS_2025_12_14.md"
echo ""
