#!/bin/bash

# Build the client app
echo "Building client app..."
npm run build

# Sync the build with Android
echo "Syncing with Android..."
npx cap sync android

echo "Android build completed successfully!"
echo "To open in Android Studio, run: npx cap open android"