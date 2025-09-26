#!/bin/bash

# Navigate to backend and start server
echo "Starting Backend..."
cd ../backend || exit
npm install
npm run dev &
BACKEND_PID=$!

# Navigate to frontend and start server
echo "Starting Frontend..."
cd ../frontend || exit
npm install
npm run dev &
FRONTEND_PID=$!

echo "Frontend and Backend servers started!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo "Visit http://localhost:5173/ to access the frontend."

# Wait for user to press CTRL+C to stop
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
