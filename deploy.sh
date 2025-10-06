#!/bin/bash

# BakiFitness Deployment Script
# This script handles the deployment of the BakiFitness application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
BACKUP_DIR="./backups"
LOG_FILE="./deploy.log"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a $LOG_FILE
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a $LOG_FILE
}

# Check if required tools are installed
check_dependencies() {
    log "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed. Please install Node.js first."
    fi
    
    if ! command -v npm &> /dev/null; then
        error "npm is not installed. Please install npm first."
    fi
    
    log "All dependencies are installed ✓"
}

# Create backup of current deployment
create_backup() {
    if [ -d "$BACKUP_DIR" ]; then
        log "Creating backup of current deployment..."
        BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR/$BACKUP_NAME"
        
        # Backup database if it exists
        if docker ps | grep -q bakifitness_postgres; then
            log "Backing up database..."
            docker exec bakifitness_postgres pg_dump -U postgres bakifitness_dev > "$BACKUP_DIR/$BACKUP_NAME/database.sql"
        fi
        
        # Backup environment files
        if [ -f "server/.env" ]; then
            cp server/.env "$BACKUP_DIR/$BACKUP_NAME/"
        fi
        
        log "Backup created: $BACKUP_DIR/$BACKUP_NAME"
    fi
}

# Build and start services
deploy_services() {
    log "Building and starting services..."
    
    # Stop existing services
    docker-compose down
    
    # Build and start services
    docker-compose up --build -d
    
    # Wait for services to be ready
    log "Waiting for services to be ready..."
    sleep 30
    
    # Check if services are running
    if ! docker ps | grep -q bakifitness_postgres; then
        error "PostgreSQL container is not running"
    fi
    
    if ! docker ps | grep -q bakifitness_redis; then
        error "Redis container is not running"
    fi
    
    if ! docker ps | grep -q bakifitness_backend; then
        error "Backend container is not running"
    fi
    
    log "All services are running ✓"
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    
    # Wait for database to be ready
    sleep 10
    
    # Run migrations
    docker exec bakifitness_backend npm run migrate
    
    # Run seeds
    docker exec bakifitness_backend npm run seed
    
    log "Database migrations completed ✓"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    # Check backend health
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        log "Backend health check passed ✓"
    else
        error "Backend health check failed"
    fi
    
    # Check database connection
    if docker exec bakifitness_backend node -e "
        const { db } = require('./src/config/database');
        db.raw('SELECT 1').then(() => {
            console.log('Database connection successful');
            process.exit(0);
        }).catch((err) => {
            console.error('Database connection failed:', err);
            process.exit(1);
        });
    " > /dev/null 2>&1; then
        log "Database connection check passed ✓"
    else
        error "Database connection check failed"
    fi
    
    log "All health checks passed ✓"
}

# Cleanup old containers and images
cleanup() {
    log "Cleaning up old containers and images..."
    
    # Remove unused containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    log "Cleanup completed ✓"
}

# Main deployment function
main() {
    log "Starting BakiFitness deployment for environment: $ENVIRONMENT"
    
    check_dependencies
    create_backup
    deploy_services
    run_migrations
    health_check
    cleanup
    
    log "Deployment completed successfully! 🎉"
    log "Backend API: http://localhost:5000"
    log "Frontend Metro: http://localhost:8081"
    log "Health Check: http://localhost:5000/health"
    
    info "To view logs: docker-compose logs -f"
    info "To stop services: docker-compose down"
    info "To restart services: docker-compose restart"
}

# Handle script arguments
case "${1:-}" in
    "development"|"staging"|"production")
        main
        ;;
    "stop")
        log "Stopping all services..."
        docker-compose down
        log "All services stopped ✓"
        ;;
    "restart")
        log "Restarting all services..."
        docker-compose restart
        log "All services restarted ✓"
        ;;
    "logs")
        docker-compose logs -f
        ;;
    "clean")
        log "Cleaning up everything..."
        docker-compose down -v
        docker system prune -f
        log "Cleanup completed ✓"
        ;;
    *)
        echo "Usage: $0 {development|staging|production|stop|restart|logs|clean}"
        echo ""
        echo "Commands:"
        echo "  development  Deploy for development environment"
        echo "  staging      Deploy for staging environment"
        echo "  production   Deploy for production environment"
        echo "  stop         Stop all services"
        echo "  restart      Restart all services"
        echo "  logs         View service logs"
        echo "  clean        Clean up everything"
        exit 1
        ;;
esac