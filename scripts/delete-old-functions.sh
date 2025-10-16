#!/bin/bash

# Delete 1st Gen Functions Script
# This deletes the old 1st Gen functions to allow 2nd Gen deployment

echo "🗑️  Deleting 1st Gen functions..."

firebase functions:delete sendVerificationCode --force
firebase functions:delete verifyCode --force
firebase functions:delete patreonOAuthCallback --force
firebase functions:delete patreonWebhook --force
firebase functions:delete syncPatreonMembership --force
firebase functions:delete unlinkPatreonAccount --force

echo "✅ Old 1st Gen functions deleted. You can now deploy 2nd Gen functions."
