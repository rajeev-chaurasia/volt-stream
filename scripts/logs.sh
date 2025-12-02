#!/bin/bash

# View logs for a specific service or all services

SERVICE=${1:-"all"}

if [ "$SERVICE" = "all" ]; then
    echo "📊 Tailing all service logs..."
    tail -f logs/*.log
elif [ -f "logs/$SERVICE.log" ]; then
    echo "📊 Tailing $SERVICE logs..."
    tail -f "logs/$SERVICE.log"
else
    echo "Available logs:"
    ls -1 logs/*.log 2>/dev/null || echo "No logs found. Have you started the services?"
    echo ""
    echo "Usage: ./scripts/logs.sh [service]"
    echo "Examples:"
    echo "  ./scripts/logs.sh           # All logs"
    echo "  ./scripts/logs.sh server    # Just gRPC server"
    echo "  ./scripts/logs.sh worker    # Just storage worker"
    echo "  ./scripts/logs.sh simulator # Just simulator"
fi
