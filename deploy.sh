#!/bin/bash

# Time AI Deployment Script
# This script helps deploy the Time AI application

set -e

echo "🚀 Time AI Deployment Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node -v)"
        exit 1
    fi
    
    print_status "Node.js version: $(node -v)"
}

# Check if npm is installed
check_npm() {
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm 8+ first."
        exit 1
    fi
    
    print_status "npm version: $(npm -v)"
}

# Check environment variables
check_env() {
    print_status "Checking environment variables..."
    
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local not found. Please create it with your environment variables."
        print_status "You can copy .env.example to .env.local and fill in your values."
        return 1
    fi
    
    if [ ! -f "backend/.env" ]; then
        print_warning "backend/.env not found. Please create it with your backend environment variables."
        print_status "You can copy backend/.env.example to backend/.env and fill in your values."
        return 1
    fi
    
    print_status "Environment files found."
    return 0
}

# Install dependencies
install_deps() {
    print_status "Installing frontend dependencies..."
    npm install
    
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
}

# Build the application
build_app() {
    print_status "Building the application..."
    npm run build
}

# Test the build
test_build() {
    print_status "Testing the build..."
    npm run lint
    print_status "Build test completed successfully."
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    vercel --prod
}

# Deploy with Docker
deploy_docker() {
    print_status "Building Docker images..."
    docker-compose build
    
    print_status "Starting services with Docker Compose..."
    docker-compose up -d
    
    print_status "Docker deployment completed!"
    print_status "Frontend: http://localhost:3000"
    print_status "Backend: http://localhost:5000"
}

# Main deployment function
main() {
    echo "Choose deployment option:"
    echo "1) Deploy to Vercel (Frontend only)"
    echo "2) Deploy with Docker (Full stack)"
    echo "3) Manual deployment"
    echo "4) Exit"
    
    read -p "Enter your choice (1-4): " choice
    
    case $choice in
        1)
            check_node
            check_npm
            check_env
            install_deps
            build_app
            test_build
            deploy_vercel
            ;;
        2)
            check_node
            check_npm
            check_env
            install_deps
            build_app
            deploy_docker
            ;;
        3)
            check_node
            check_npm
            check_env
            install_deps
            build_app
            test_build
            print_status "Manual deployment steps:"
            echo "1. Start backend: cd backend && npm start"
            echo "2. Start frontend: npm start"
            ;;
        4)
            print_status "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid choice. Please select 1-4."
            exit 1
            ;;
    esac
}

# Run main function
main 