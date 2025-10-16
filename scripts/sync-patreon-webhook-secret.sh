#!/bin/bash

# Script to sync Patreon webhook secret between Firebase and Patreon
# Run this when setting up or troubleshooting webhook verification

echo "🔐 Patreon Webhook Secret Sync Helper"
echo "======================================"
echo ""

# Get the current Firebase secret
echo "📥 Fetching secret from Firebase..."
SECRET=$(firebase functions:secrets:access PATREON_WEBHOOK_SECRET 2>/dev/null)

if [ -z "$SECRET" ]; then
    echo "❌ Error: Could not retrieve secret from Firebase"
    echo "Run: firebase functions:secrets:set PATREON_WEBHOOK_SECRET"
    exit 1
fi

echo "✅ Secret retrieved from Firebase"
echo ""
echo "Your webhook secret is:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "$SECRET"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 This secret has been copied to your clipboard!"
echo "$SECRET" | pbcopy

echo ""
echo "Next steps:"
echo "1. Go to: https://www.patreon.com/portal/registration/register-clients"
echo "2. Select your OAuth Client"
echo "3. Scroll to 'Webhooks' section"
echo "4. Paste the secret (Cmd+V) into the 'Webhook Secret' field"
echo "5. Subscribe to these events:"
echo "   • members:pledge:create"
echo "   • members:pledge:update"
echo "   • members:pledge:delete"
echo "6. Save your changes"
echo "7. Click 'Send Test' to verify"
echo ""
echo "🔗 Your webhook URL:"
echo "https://patreonwebhook-k5tf6cilcq-uc.a.run.app"
