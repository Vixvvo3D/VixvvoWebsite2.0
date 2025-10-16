#!/bin/bash

# Patreon Integration Setup Script
# This script helps you configure Firebase Functions for Patreon integration

echo "🎨 Patreon Integration Setup"
echo "=============================="
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found!"
    echo "Please install it first: npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI found"
echo ""

# Prompt for Patreon credentials
echo "📝 Enter your Patreon credentials:"
echo "(Get these from https://www.patreon.com/portal/registration/register-clients)"
echo ""

read -p "Patreon Client ID: " PATREON_CLIENT_ID
read -p "Patreon Client Secret: " PATREON_CLIENT_SECRET
read -p "Redirect URI (e.g., https://your-domain.com/pages/patreon-link.html): " REDIRECT_URI

# Generate webhook secret
echo ""
echo "🔐 Generating secure webhook secret..."
WEBHOOK_SECRET=$(openssl rand -hex 32)
echo "Generated: $WEBHOOK_SECRET"
echo ""

# Confirm before setting
echo "Ready to configure Firebase with:"
echo "  - Client ID: ${PATREON_CLIENT_ID:0:10}..."
echo "  - Redirect URI: $REDIRECT_URI"
echo "  - Webhook Secret: ${WEBHOOK_SECRET:0:10}..."
echo ""
read -p "Continue? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "❌ Setup cancelled"
    exit 0
fi

# Set Firebase config
echo ""
echo "⚙️  Configuring Firebase Functions..."

firebase functions:config:set \
  patreon.client_id="$PATREON_CLIENT_ID" \
  patreon.client_secret="$PATREON_CLIENT_SECRET" \
  patreon.redirect_uri="$REDIRECT_URI" \
  patreon.webhook_secret="$WEBHOOK_SECRET"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Configuration saved!"
    echo ""
    echo "📋 Next steps:"
    echo ""
    echo "1. Update /pages/patreon-link.html with your Client ID:"
    echo "   const clientId = '$PATREON_CLIENT_ID';"
    echo ""
    echo "2. Install dependencies and deploy:"
    echo "   cd functions"
    echo "   npm install"
    echo "   cd .."
    echo "   firebase deploy --only functions"
    echo ""
    echo "3. Set up webhook in Patreon Developer Portal:"
    echo "   URL: https://YOUR-REGION-YOUR-PROJECT.cloudfunctions.net/patreonWebhook"
    echo "   Secret: $WEBHOOK_SECRET"
    echo "   Events: members:pledge:create, members:pledge:update, members:pledge:delete"
    echo ""
    echo "4. Update PATREON_TIER_MAPPING in functions/index.js with your actual tier IDs"
    echo ""
    echo "⚠️  IMPORTANT: Save your webhook secret somewhere safe!"
    echo "   Webhook Secret: $WEBHOOK_SECRET"
    echo ""
else
    echo "❌ Configuration failed!"
    exit 1
fi
