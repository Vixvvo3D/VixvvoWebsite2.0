#!/bin/bash

# Vixvvo Website 2.0 - Quick Deploy Script
# This script adds, commits, pushes to Git, and deploys to Firebase

echo "🚀 Starting deployment process..."

# Check if commit message is provided
if [ -z "$1" ]; then
  echo "❌ Error: Please provide a commit message"
  echo "Usage: ./deploy.sh \"Your commit message here\""
  exit 1
fi

COMMIT_MESSAGE="$1"

echo ""
echo "📦 Step 1: Adding files to Git..."
git add .

echo ""
echo "💾 Step 2: Committing changes..."
git commit -m "$COMMIT_MESSAGE"

if [ $? -ne 0 ]; then
  echo "⚠️  No changes to commit or commit failed"
  echo "Continuing with Firebase deployment..."
fi

echo ""
echo "⬆️  Step 3: Pushing to GitHub..."
git push

if [ $? -ne 0 ]; then
  echo "❌ Git push failed!"
  exit 1
fi

echo ""
echo "🔥 Step 4: Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -ne 0 ]; then
  echo "❌ Firebase hosting deployment failed!"
  exit 1
fi

echo ""
echo "🔥 Step 5: Deploying Firebase Functions..."
firebase deploy --only functions

if [ $? -ne 0 ]; then
  echo "❌ Firebase functions deployment failed!"
  exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your site is live at: https://vixvvowebsite.web.app"
echo ""
