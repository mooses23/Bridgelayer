#!/usr/bin/env tsx

import { seedAuthData } from "../server/seed-auth-data";

async function main() {
  try {
    await seedAuthData();
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed authentication data:", error);
    process.exit(1);
  }
}

main();