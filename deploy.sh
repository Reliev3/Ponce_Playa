#!/bin/bash

# Add all changes
git add .

# Commit with a timestamp
git commit -m "Update $(date '+%Y-%m-%d %H:%M:%S')"

# Push to the main branch
git push origin main

echo "✅ Changes pushed to GitHub! You should be able to see updates on your live link shortly."
