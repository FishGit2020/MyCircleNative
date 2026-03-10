#!/bin/bash
# EAS Build pre-install hook
# Copies Firebase config files from EAS secrets into the project root

if [ -n "$GOOGLE_SERVICES_JSON" ]; then
  echo "Copying google-services.json from EAS secret..."
  cp "$GOOGLE_SERVICES_JSON" ./google-services.json
fi

if [ -n "$GOOGLE_SERVICE_INFO_PLIST" ]; then
  echo "Copying GoogleService-Info.plist from EAS secret..."
  cp "$GOOGLE_SERVICE_INFO_PLIST" ./GoogleService-Info.plist
fi
