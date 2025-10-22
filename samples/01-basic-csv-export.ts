/**
 * Basic CSV Export Example
 *
 * This sample demonstrates the simplest way to export data to CSV
 * using the builder API.
 *
 * Run: npx tsx samples/01-basic-csv-export.ts
 */

import { outport } from '../src/index.js';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface User extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

async function main() {
  const users: User[] = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', active: true },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', active: true },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', active: false },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', active: true },
    { id: 5, name: 'Eve Davis', email: 'eve@example.com', active: true },
  ];

  const outputDir = path.join(__dirname, 'temp', 'basic-csv');
  const outputPath = path.join(outputDir, 'users.csv');

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('📝 Exporting users to CSV...');

  const result = await outport<User>().to(outputPath).write(users);

  if (result.success) {
    console.log(`✅ Successfully exported ${users.length} users to ${outputPath}`);
    console.log(`📄 File created: ${outputPath}`);
  } else {
    console.error('❌ Export failed:', result.error.message);
    process.exit(1);
  }
}

main().catch(console.error);
