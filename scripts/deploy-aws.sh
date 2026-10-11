#!/usr/bin/env bash
set -e

echo "========================================================"
echo "  TERRA — AWS Deployment Helper"
echo "  Choose your preferred AWS deployment pathway:"
echo "========================================================"
echo "1) AWS Amplify Hosting (Web Frontend - Fastest)"
echo "2) AWS App Runner (Full-Stack Container - Automatic URL & SSL)"
echo "3) AWS SAM CLI (Serverless: Lambda, DynamoDB, API Gateway)"
echo "4) LocalStack (Zero-cost local sandbox - No AWS account needed)"
echo "========================================================"

read -p "Select option [1-4]: " choice

case $choice in
  1)
    echo ""
    echo "📦 [AWS Amplify Hosting]"
    echo "1. Connect your repository to AWS Amplify Console: https://console.aws.amazon.com/amplify"
    echo "2. Select branch 'main'."
    echo "3. Amplify automatically detects amplify.yml in the root and runs 'npm ci && npm run build'."
    echo "4. Your live URL will be active in ~3 minutes!"
    ;;
  2)
    echo ""
    echo "🚀 [AWS App Runner]"
    echo "1. Open AWS App Runner Console: https://console.aws.amazon.com/apprunner"
    echo "2. Select 'Source code repository', choose GitHub -> 'khushi-infinity/Terra-Globe', branch 'main'."
    echo "3. Configuration file: Use 'apprunner.yaml' (already included in repository)."
    echo "4. Click Create & Deploy. App Runner provisions containers, SSL, and custom domain automatically."
    ;;
  3)
    echo ""
    echo "⚡ [AWS SAM CLI]"
    echo "Validating SAM template.yaml..."
    sam validate --template template.yaml
    echo "Building SAM application..."
    sam build
    echo "Deploying to AWS (guided)..."
    sam deploy --guided
    ;;
  4)
    echo ""
    echo "💻 [LocalStack Sandbox — No Account, No Card, No Bill]"
    echo "Starting LocalStack with S3, DynamoDB, Lambda, API Gateway..."
    docker compose -f docker-compose.localstack.yml up -d
    echo "LocalStack running on http://localhost:4566"
    echo "App accessible on http://localhost:3000"
    ;;
  *)
    echo "Invalid option. Exiting."
    exit 1
    ;;
esac
