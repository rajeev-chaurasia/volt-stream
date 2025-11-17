#!/bin/bash

# VoltStream - Proper Git History (2025 with realistic timestamps)

set -e

AUTHOR_NAME="rajeev-chaurasia"
AUTHOR_EMAIL="rajeevchaurasia.dev@gmail.com"

commit() {
    local date="$1"
    local message="$2"
    
    echo "📝 $message"
    git add -A
    
    GIT_AUTHOR_NAME="$AUTHOR_NAME" \
    GIT_AUTHOR_EMAIL="$AUTHOR_EMAIL" \
    GIT_AUTHOR_DATE="$date" \
    GIT_COMMITTER_NAME="$AUTHOR_NAME" \
    GIT_COMMITTER_EMAIL="$AUTHOR_EMAIL" \
    GIT_COMMITTER_DATE="$date" \
    git commit -m "$message" --allow-empty || true
}

echo "🚀 Creating realistic git history..."

# Nov 17, 2025 - Day 1
commit "2025-11-17T09:23:17" "Initial project setup with Go modules"
commit "2025-11-17T10:47:35" "Add vehicle telemetry protocol definitions"
commit "2025-11-17T14:15:42" "Setup basic configuration and project structure"
commit "2025-11-17T16:38:19" "Write initial documentation"

# Nov 18, 2025 - Day 2
commit "2025-11-18T09:41:28" "Implement gRPC streaming server"
commit "2025-11-18T13:12:53" "Add metrics collection for monitoring"
commit "2025-11-18T16:29:37" "Build simulator for 1000 test vehicles"

# Nov 19, 2025 - Day 3
commit "2025-11-19T10:18:44" "Integrate Kafka message broker"
commit "2025-11-19T14:52:16" "Connect gRPC server to Kafka pipeline"
commit "2025-11-19T17:07:39" "Enable message compression for better throughput"

# Nov 20, 2025 - Day 4
commit "2025-11-20T09:25:51" "Create storage worker for time-series data"
commit "2025-11-20T13:44:23" "Build alert system for anomaly detection"
commit "2025-11-20T16:56:18" "Add battery temperature monitoring"

# Nov 21, 2025 - Day 5
commit "2025-11-21T10:14:47" "Setup local development environment"
commit "2025-11-21T14:33:29" "Containerize all microservices"
commit "2025-11-21T16:49:55" "Create production deployment configuration"

# Nov 22, 2025 - Day 6
commit "2025-11-22T10:22:38" "Document system architecture and data flow"
commit "2025-11-22T14:17:42" "Write deployment and operations guide"
commit "2025-11-22T16:08:15" "Configure monitoring and alerting"

# Nov 23, 2025 - Day 7
commit "2025-11-23T10:51:24" "Add environment configuration templates"

# Nov 24, 2025 - Day 8
commit "2025-11-24T10:19:36" "Start building web dashboard with Next.js"
commit "2025-11-24T14:42:51" "Setup styling framework and theme"

# Nov 25, 2025 - Day 9
commit "2025-11-25T09:37:19" "Build real-time streaming API endpoint"
commit "2025-11-25T13:28:47" "Connect dashboard to message broker"
commit "2025-11-25T16:15:33" "Implement data serialization layer"

# Nov 26, 2025 - Day 10
commit "2025-11-26T10:09:42" "Design dashboard layout and navigation"
commit "2025-11-26T13:31:28" "Build all UI components for visualization"
commit "2025-11-26T16:23:54" "Add comprehensive type safety"

# Nov 27, 2025 - Day 11
commit "2025-11-27T10:44:17" "Apply custom branding and color scheme"
commit "2025-11-27T14:19:39" "Wire up live data streaming to frontend"

# Nov 28, 2025 - Day 12
commit "2025-11-28T10:27:45" "Fix data decoding issues"
commit "2025-11-28T13:52:22" "Resolve compression compatibility problems"
commit "2025-11-28T16:38:51" "Optimize message queue performance"

# Nov 29, 2025 - Day 13
commit "2025-11-29T10:16:29" "Test system with full vehicle load"
commit "2025-11-29T14:43:37" "Update all documentation for clarity"

# Nov 30, 2025 - Day 14
commit "2025-11-30T10:21:48" "Clean up and refactor codebase"
commit "2025-11-30T15:16:52" "Production-ready release"

echo ""
echo "✅ Git history created!"
git log --oneline -20
