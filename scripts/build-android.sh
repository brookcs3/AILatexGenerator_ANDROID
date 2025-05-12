#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function for displaying section headers
function section() {
  echo -e "\n${BLUE}==== $1 ====${NC}\n"
}

# Show warning if RevenueCat is not configured
if ! grep -q "apiKey" capacitor.config.ts; then
  echo -e "${RED}WARNING: RevenueCat is not configured in capacitor.config.ts${NC}"
  echo -e "${RED}The app will build but in-app purchases won't work${NC}"
  echo -e "${RED}This is fine for initial development and testing${NC}\n"
fi

# Build the web app
section "Building web app"
npm run build
if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed!${NC}"
  exit 1
fi

# Copy the build to Capacitor
section "Syncing with Capacitor"
npx cap sync android
if [ $? -ne 0 ]; then
  echo -e "${RED}Capacitor sync failed!${NC}"
  exit 1
fi

# Success message
echo -e "\n${GREEN}Android build completed successfully!${NC}"
echo -e "${GREEN}Next steps:${NC}"
echo -e "1. To open in Android Studio:   ${BLUE}npx cap open android${NC}"
echo -e "2. To build an APK:             ${BLUE}cd android && ./gradlew assembleDebug${NC}"
echo -e "3. To run on a device:          ${BLUE}npx cap run android${NC}"
echo -e "\n${GREEN}Later, when ready for production:${NC}"
echo -e "1. Configure RevenueCat in capacitor.config.ts"
echo -e "2. Build a signed release:      ${BLUE}cd android && ./gradlew assembleRelease${NC}"