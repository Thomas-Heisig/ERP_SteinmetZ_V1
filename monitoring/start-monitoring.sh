#!/bin/bash

# Monitoring Stack Startup Script
# Quick start script for the ERP SteinmetZ monitoring infrastructure

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}ERP SteinmetZ Monitoring Stack${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Function to check if docker-compose or docker compose is available
docker_compose_cmd() {
    if command -v docker-compose &> /dev/null; then
        docker-compose "$@"
    else
        docker compose "$@"
    fi
}

# Parse command line arguments
PROFILE="default"
DETACH="-d"

while [[ $# -gt 0 ]]; do
    case $1 in
        --profile)
            PROFILE="$2"
            shift 2
            ;;
        --fg|--foreground)
            DETACH=""
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --profile PROFILE    Choose profile: default, advanced, zipkin"
            echo "  --fg, --foreground   Run in foreground (don't detach)"
            echo "  --help, -h          Show this help message"
            echo ""
            echo "Profiles:"
            echo "  default    - Prometheus + Grafana + Jaeger (recommended)"
            echo "  advanced   - Includes OTLP Collector + Alertmanager"
            echo "  zipkin     - Use Zipkin instead of Jaeger"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo -e "${GREEN}Starting monitoring stack with profile: ${PROFILE}${NC}"
echo ""

# Start services based on profile
case $PROFILE in
    default)
        echo -e "${BLUE}Starting: Prometheus + Grafana + Jaeger${NC}"
        docker_compose_cmd up $DETACH prometheus grafana jaeger
        ;;
    advanced)
        echo -e "${BLUE}Starting: Full stack with OTLP Collector and Alertmanager${NC}"
        docker_compose_cmd --profile advanced up $DETACH
        ;;
    zipkin)
        echo -e "${BLUE}Starting: Prometheus + Grafana + Zipkin${NC}"
        docker_compose_cmd --profile zipkin up $DETACH prometheus grafana zipkin
        ;;
    *)
        echo -e "${RED}Unknown profile: ${PROFILE}${NC}"
        echo "Available profiles: default, advanced, zipkin"
        exit 1
        ;;
esac

# Wait a moment for services to start
if [ -n "$DETACH" ]; then
    echo ""
    echo -e "${YELLOW}Waiting for services to start...${NC}"
    sleep 5

    # Check if services are running
    echo ""
    echo -e "${BLUE}Service Status:${NC}"
    docker_compose_cmd ps

    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Monitoring Stack Started Successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "${BLUE}Access URLs:${NC}"
    echo -e "  📊 Prometheus:  ${GREEN}http://localhost:9090${NC}"
    echo -e "  📈 Grafana:     ${GREEN}http://localhost:3001${NC} (admin/admin)"
    
    if [ "$PROFILE" = "zipkin" ]; then
        echo -e "  🔍 Zipkin UI:   ${GREEN}http://localhost:9411${NC}"
    else
        echo -e "  🔍 Jaeger UI:   ${GREEN}http://localhost:16686${NC}"
    fi
    
    if [ "$PROFILE" = "advanced" ]; then
        echo -e "  🚨 Alertmanager: ${GREEN}http://localhost:9093${NC}"
        echo -e "  📡 OTLP Collector Health: ${GREEN}http://localhost:13133${NC}"
    fi
    
    echo ""
    echo -e "${BLUE}Backend Configuration:${NC}"
    echo -e "  Update your ${YELLOW}apps/backend/.env${NC}:"
    echo ""
    echo -e "  ${GREEN}OTEL_TRACES_ENABLED=true${NC}"
    echo -e "  ${GREEN}OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces${NC}"
    echo ""
    echo -e "${BLUE}Commands:${NC}"
    echo -e "  Stop:    ${YELLOW}docker-compose down${NC}"
    echo -e "  Logs:    ${YELLOW}docker-compose logs -f${NC}"
    echo -e "  Restart: ${YELLOW}docker-compose restart${NC}"
    echo ""
else
    echo ""
    echo -e "${GREEN}Monitoring stack running in foreground${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
fi
