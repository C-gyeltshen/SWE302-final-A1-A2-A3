#!/bin/bash

# Integration Test Execution Script
# This script runs all integration tests and generates coverage reports

echo "====================================="
echo "Running Integration Tests"
echo "====================================="
echo ""

# Set working directory
cd "$(dirname "$0")"

# Clean previous coverage files
rm -f *_coverage.out coverage.out integration_coverage.html

echo "1. Running Users Module Integration Tests..."
go test ./users -cover -coverprofile=users_coverage.out -count=1 2>&1 | grep -E "^(ok|FAIL|PASS|---|\?)"
USERS_EXIT=${PIPESTATUS[0]}

echo ""
echo "2. Running Articles Module Integration Tests..."
go test ./articles -cover -coverprofile=articles_coverage.out -count=1 2>&1 | grep -E "^(ok|FAIL|PASS|---|\?)"
ARTICLES_EXIT=${PIPESTATUS[0]}

echo ""
echo "3. Running Common Module Integration Tests..."
go test ./common -cover -coverprofile=common_coverage.out -count=1 2>&1 | grep -E "^(ok|FAIL|PASS|---|\?)"
COMMON_EXIT=${PIPESTATUS[0]}

echo ""
echo "====================================="
echo "Generating Coverage Reports..."
echo "====================================="

# Generate individual module coverage percentages
if [ -f users_coverage.out ]; then
    echo ""
    echo "Users Module Coverage:"
    go tool cover -func=users_coverage.out | grep total | awk '{print "  Total Coverage: " $3}'
fi

if [ -f articles_coverage.out ]; then
    echo ""
    echo "Articles Module Coverage:"
    go tool cover -func=articles_coverage.out | grep total | awk '{print "  Total Coverage: " $3}'
fi

if [ -f common_coverage.out ]; then
    echo ""
    echo "Common Module Coverage:"
    go tool cover -func=common_coverage.out | grep total | awk '{print "  Total Coverage: " $3}'
fi

# Combine coverage files
echo ""
echo "Combining coverage files..."
echo "mode: set" > coverage.out
grep -h -v "^mode:" users_coverage.out articles_coverage.out common_coverage.out 2>/dev/null >> coverage.out

# Generate HTML report
if [ -f coverage.out ]; then
    go tool cover -html=coverage.out -o integration_coverage.html
    echo "HTML coverage report generated: integration_coverage.html"
fi

# Overall statistics
echo ""
echo "====================================="
echo "Overall Test Results:"
echo "====================================="
echo "Users Module: $([ $USERS_EXIT -eq 0 ] && echo '✓ PASSED' || echo '✗ FAILED')"
echo "Articles Module: $([ $ARTICLES_EXIT -eq 0 ] && echo '✓ PASSED' || echo '✗ FAILED')"
echo "Common Module: $([ $COMMON_EXIT -eq 0 ] && echo '✓ PASSED' || echo '✗ FAILED')"
echo ""

if [ -f coverage.out ]; then
    TOTAL_COVERAGE=$(go tool cover -func=coverage.out | grep total | awk '{print $3}')
    echo "Overall Test Coverage: $TOTAL_COVERAGE"
    echo ""
    
    # Check if coverage meets 80% threshold
    COVERAGE_NUM=$(echo $TOTAL_COVERAGE | sed 's/%//')
    if [ $(echo "$COVERAGE_NUM >= 80" | bc -l) -eq 1 ]; then
        echo "✓ Coverage goal of 80% ACHIEVED!"
    else
        echo "✗ Coverage goal of 80% NOT YET ACHIEVED"
        echo "  Current: $TOTAL_COVERAGE"
        echo "  Target:  80%"
    fi
fi

echo ""
echo "====================================="

# Exit with appropriate code
if [ $USERS_EXIT -ne 0 ] || [ $ARTICLES_EXIT -ne 0 ] || [ $COMMON_EXIT -ne 0 ]; then
    exit 1
fi

exit 0
