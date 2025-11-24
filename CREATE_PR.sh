#!/bin/bash

# Create Pull Request for Bloomberg Terminal Redesign

echo "Creating Pull Request for Bloomberg-Style Terminal Redesign..."

gh pr create \
  --title "feat: Bloomberg-style terminal redesign - Phase 1 foundation" \
  --body-file PR_DESCRIPTION.md \
  --base main \
  --head claude/bloomberg-style-terminal-019EGKviC3Ye3Fe1bMELDiEh

echo ""
echo "✅ Pull request created successfully!"
echo ""
echo "Alternatively, create the PR manually at:"
echo "https://github.com/abtinasg/deepfin/pull/new/claude/bloomberg-style-terminal-019EGKviC3Ye3Fe1bMELDiEh"
