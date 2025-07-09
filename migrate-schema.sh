#!/bin/bash

# Schema migration script
# This script runs the migration from old schema to new refactored schema

echo "Starting schema migration..."

# Check if NODE_ENV is set, default to development
if [ -z "$NODE_ENV" ]; then
  export NODE_ENV=development
  echo "NODE_ENV not set, defaulting to development"
fi

# Load environment variables
if [ -f ".env" ]; then
  echo "Loading environment variables from .env file"
  export $(grep -v '^#' .env | xargs)
fi

# Run the migration script
echo "Running migration script..."
node ./scripts/migrate-schema.js

# Check if migration was successful
if [ $? -eq 0 ]; then
  echo "Migration completed successfully!"
  
  # Create a backup of the old schema
  echo "Creating backup of old schema..."
  cp ./shared/schema.ts ./shared/schema.ts.bak
  
  # Replace old schema with new schema
  echo "Replacing old schema with new schema..."
  cp ./shared/schema-refactored.ts ./shared/schema.ts
  
  echo "Schema migration and replacement completed!"
else
  echo "Migration failed! The old schema is still in place."
  exit 1
fi
