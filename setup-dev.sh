#!/bin/bash

echo "🏀 Setting up Basketball Stat Tracker development environment..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed. Please install npm and try again."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create virtual environment if it doesn't exist
if [ ! -d "backend/venv" ]; then
    echo "📦 Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment and install Python dependencies
echo "📦 Installing Python dependencies..."
cd backend
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm run install:all

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local template..."
    cat > .env.local << EOF
# Database Configuration
DATABASE_PWD=your_database_password_here

# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_key_here
EOF
    echo "⚠️  Please update .env.local with your actual credentials"
fi

echo "✅ Setup complete!"
echo ""
echo "🚀 To start development:"
echo "   npm run dev"
echo ""
echo "📚 Available commands:"
echo "   npm run dev:backend    - Start Django backend only"
echo "   npm run dev:frontend   - Start Next.js frontend only"
echo "   npm run test          - Run backend tests"
echo "   npm run migrate       - Run database migrations"
echo ""
echo "🌐 Access your application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000" 