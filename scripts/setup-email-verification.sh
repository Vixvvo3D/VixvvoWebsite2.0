#!/bin/bash

# Email Verification Setup Script
# This script helps you configure email verification for your Vixvvo website

echo "═══════════════════════════════════════════════"
echo "   📧 Vixvvo Email Verification Setup"
echo "═══════════════════════════════════════════════"
echo ""

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "   npm install -g firebase-tools"
    exit 1
fi

echo "✅ Firebase CLI found"
echo ""

# Prompt for email configuration
echo "Step 1: Configure Email Settings"
echo "─────────────────────────────────────────────"
echo ""
echo "You need a Gmail account to send verification emails."
echo "Make sure you've enabled 2FA and created an App Password."
echo "Instructions: https://support.google.com/accounts/answer/185833"
echo ""

read -p "Enter your Gmail address: " EMAIL_USER
read -sp "Enter your Gmail App Password (16 characters): " EMAIL_PASS
echo ""
echo ""

# Validate inputs
if [[ -z "$EMAIL_USER" ]] || [[ -z "$EMAIL_PASS" ]]; then
    echo "❌ Email or password cannot be empty"
    exit 1
fi

# Set Firebase config
echo "Setting Firebase configuration..."
firebase functions:config:set email.user="$EMAIL_USER" email.pass="$EMAIL_PASS"

if [ $? -eq 0 ]; then
    echo "✅ Email configuration saved successfully"
    echo ""
else
    echo "❌ Failed to save configuration"
    exit 1
fi

# Verify configuration
echo "Verifying configuration..."
firebase functions:config:get
echo ""

# Deploy functions
echo "─────────────────────────────────────────────"
echo "Step 2: Deploy Cloud Functions"
echo "─────────────────────────────────────────────"
echo ""
read -p "Deploy functions now? (y/n): " DEPLOY_CHOICE

if [[ "$DEPLOY_CHOICE" == "y" || "$DEPLOY_CHOICE" == "Y" ]]; then
    echo "Deploying Cloud Functions..."
    firebase deploy --only functions
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Functions deployed successfully!"
        echo ""
    else
        echo "❌ Function deployment failed"
        exit 1
    fi
fi

# Deploy hosting
echo "─────────────────────────────────────────────"
echo "Step 3: Deploy Website Updates"
echo "─────────────────────────────────────────────"
echo ""
read -p "Deploy website updates now? (y/n): " DEPLOY_WEB

if [[ "$DEPLOY_WEB" == "y" || "$DEPLOY_WEB" == "Y" ]]; then
    echo "Deploying website..."
    firebase deploy --only hosting
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Website deployed successfully!"
        echo ""
    else
        echo "❌ Website deployment failed"
        exit 1
    fi
fi

# Final instructions
echo "═══════════════════════════════════════════════"
echo "   🎉 Setup Complete!"
echo "═══════════════════════════════════════════════"
echo ""
echo "Next Steps:"
echo "1. Update your Firebase Database rules (see EMAIL_VERIFICATION_SETUP.md)"
echo "2. Test the signup flow on your website"
echo "3. Check your email for verification codes"
echo ""
echo "For detailed instructions, see:"
echo "   EMAIL_VERIFICATION_SETUP.md"
echo ""
echo "To test your functions:"
echo "   firebase functions:log --only sendVerificationCode"
echo ""
echo "Happy coding! 🚀"
echo ""
