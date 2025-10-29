#!/bin/bash

# BIP! Services API Deployment Script
# Usage: ./deployment.sh [start|stop|logs|restart|status]

PROJECT_NAME="bip-services"
SERVICE_NAME="bip-api"

# Function to display usage
usage() {
    echo "Usage: $0 [start|stop|logs|restart|status|build]"
    echo ""
    echo "Commands:"
    echo "  start    - Build and start the services"
    echo "  stop     - Stop all services"
    echo "  logs     - View live logs"
    echo "  restart  - Restart the API service"
    echo "  status   - Show service status"
    echo "  build    - Build without starting"
    echo ""
}

# Function to start services
start() {
    echo "🚀 Starting BIP! Services API..."
    docker compose up --build -d
    echo "✅ BIP! Services API is running at http://localhost:4000"
    echo "📊 View logs: $0 logs"
    echo "🛑 Stop: $0 stop"
}

# Function to stop services
stop() {
    echo "🛑 Stopping BIP! Services API..."
    docker compose down
    echo "✅ BIP! Services API stopped"
}

# Function to view logs
logs() {
    echo "📊 Viewing logs for BIP! Services API..."
    docker compose logs -f $SERVICE_NAME
}

# Function to restart services
restart() {
    echo "🔄 Restarting BIP! Services API..."
    docker compose restart $SERVICE_NAME
    echo "✅ BIP! Services API restarted"
}

# Function to show status
status() {
    echo "📊 BIP! Services API Status:"
    docker compose ps
}

# Function to build only
build() {
    echo "🔨 Building BIP! Services API..."
    docker compose build
    echo "✅ Build completed"
}

# Main script logic
case "${1:-}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    logs)
        logs
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    build)
        build
        ;;
    *)
        usage
        exit 1
        ;;
esac
