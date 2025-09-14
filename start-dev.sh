#!/bin/bash

echo "🚀 Starting MovieHub2 Development Environment"
echo ""

# Function to start backend
start_backend() {
    echo "📡 Starting Backend Server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    echo "✅ Backend started with PID: $BACKEND_PID"
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting Frontend Development Server..."
    cd frontend
    # Use react-scripts directly for development
    npx react-scripts start &
    FRONTEND_PID=$!
    echo "✅ Frontend started with PID: $FRONTEND_PID"
    cd ..
}

# Start both servers
start_backend
sleep 3
start_frontend

echo ""
echo "🎉 Development environment is starting!"
echo "📡 Backend API: http://localhost:5000"
echo "🎨 Frontend App: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait