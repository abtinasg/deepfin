#!/bin/bash

# OpenRouter AI System Test Script

echo "🧪 Testing OpenRouter AI System..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base URL
BASE_URL="http://localhost:3000"

echo "📝 Test 1: Auto-routing (General Query)"
echo "Query: 'Analyze Tesla stock'"
echo ""

curl -s -X POST "$BASE_URL/api/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Analyze Tesla stock",
    "ticker": "TSLA",
    "mode": "auto"
  }' | jq '.'

echo ""
echo "---"
echo ""

echo "🐦 Test 2: Grok - Twitter Sentiment"
echo "Query: 'What is Twitter saying about Apple?'"
echo ""

curl -s -X POST "$BASE_URL/api/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is Twitter saying about Apple?",
    "ticker": "AAPL",
    "mode": "grok"
  }' | jq '.'

echo ""
echo "---"
echo ""

echo "📊 Test 3: Gemini - Chart Analysis"
echo "Query: 'Identify chart patterns for NVDA'"
echo ""

curl -s -X POST "$BASE_URL/api/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Identify chart patterns and support/resistance levels",
    "ticker": "NVDA",
    "mode": "gemini"
  }' | jq '.'

echo ""
echo "---"
echo ""

echo "🧮 Test 4: GPT-5 - Calculations"
echo "Query: 'Calculate P/E ratio analysis for Microsoft'"
echo ""

curl -s -X POST "$BASE_URL/api/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Calculate P/E ratio and compare to industry average",
    "ticker": "MSFT",
    "mode": "gpt5"
  }' | jq '.'

echo ""
echo "---"
echo ""

echo "🧠 Test 5: Claude - Deep Analysis"
echo "Query: 'Bull and bear thesis for Amazon'"
echo ""

curl -s -X POST "$BASE_URL/api/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Give me a detailed bull and bear investment thesis",
    "ticker": "AMZN",
    "mode": "claude"
  }' | jq '.'

echo ""
echo "---"
echo ""

echo "🎯 Test 6: Ensemble Mode (All Models)"
echo "Query: 'Should I invest in META?'"
echo ""

curl -s -X POST "$BASE_URL/api/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Should I invest in this stock? Consider all factors.",
    "ticker": "META",
    "mode": "ensemble"
  }' | jq '.'

echo ""
echo "---"
echo ""

echo "📊 Test 7: Twitter Sentiment Endpoint"
echo "GET /api/ai/chat?ticker=TSLA"
echo ""

curl -s "$BASE_URL/api/ai/chat?ticker=TSLA" | jq '.'

echo ""
echo "---"
echo ""

echo "✅ All tests completed!"
echo ""
echo "💡 Tips:"
echo "  - Check the 'model' field to see which AI was used"
echo "  - Monitor 'cost' field for spending"
echo "  - 'usage.total_tokens' shows token consumption"
echo "  - Ensemble mode combines multiple perspectives"
echo ""
echo "📈 View dashboard: http://localhost:3000/dashboard/ai"
echo "📊 OpenRouter dashboard: https://openrouter.ai/dashboard"
