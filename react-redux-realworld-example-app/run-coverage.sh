#!/bin/bash

# Script to run Playwright tests with coverage collection

echo "🧹 Cleaning previous coverage data..."
rm -rf .nyc_output coverage

echo "📦 Instrumenting code with babel..."
export BABEL_ENV=test

echo "🧪 Running Playwright tests..."
npx playwright test

echo "📊 Generating coverage reports..."
npx nyc report --reporter=html --reporter=text --reporter=lcov --reporter=json

echo ""
echo "✅ Coverage reports generated!"
echo "📁 HTML Report: coverage/index.html"
echo "📄 Text Report printed above"
echo ""
echo "To view the HTML report, run: npm run coverage:view"
