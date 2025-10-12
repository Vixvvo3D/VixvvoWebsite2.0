#!/bin/bash

# Deploy Firebase Database Rules
# This script deploys the updated security rules that allow users to create personal presets

echo "📝 Deploying Firebase Database Rules..."
echo ""
echo "This will update the security rules to allow:"
echo "  - Users to create and manage their own printer presets"
echo "  - Users to create and manage their own filament presets"
echo "  - Keep global presets admin-only"
echo ""

firebase deploy --only database

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database rules deployed successfully!"
    echo ""
    echo "Users can now:"
    echo "  - Add personal printers in 'Your Presets' tab"
    echo "  - Add personal filaments in 'Your Presets' tab"
    echo "  - Personal presets are private and isolated per user"
else
    echo ""
    echo "❌ Failed to deploy database rules"
    echo "Please check your Firebase configuration and try again"
fi
