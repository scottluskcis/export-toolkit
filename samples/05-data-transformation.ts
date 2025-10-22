/**
 * Data Transformation with Hooks Example
 *
 * This sample shows how to use the onBeforeWrite hook to
 * transform and filter data before exporting.
 *
 * Run: npx tsx samples/05-data-transformation.ts
 */

import { outport } from '../src/index.js';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RawUser extends Record<string, unknown> {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  active: boolean;
  salary: number;
}

interface TransformedUser extends Record<string, unknown> {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  active: boolean;
  salary: number;
  fullName: string;
  salaryBand: 'High' | 'Medium';
}

async function main() {
  const rawUsers: RawUser[] = [
    {
      id: 1,
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice@example.com',
      age: 28,
      active: true,
      salary: 75000,
    },
    {
      id: 2,
      firstName: 'Bob',
      lastName: 'Smith',
      email: 'bob@example.com',
      age: 35,
      active: false,
      salary: 85000,
    },
    {
      id: 3,
      firstName: 'Charlie',
      lastName: 'Brown',
      email: 'charlie@example.com',
      age: 42,
      active: true,
      salary: 95000,
    },
    {
      id: 4,
      firstName: 'Diana',
      lastName: 'Prince',
      email: 'diana@example.com',
      age: 31,
      active: true,
      salary: 88000,
    },
  ];

  const outputDir = path.join(__dirname, 'temp', 'transform');
  const outputPath = path.join(outputDir, 'transformed-users.csv');

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('🔄 Data Transformation Example');
  console.log('='.repeat(50));
  console.log(`Output: ${outputPath}\n`);

  console.log('📝 Exporting with data transformation...\n');

  const result = await outport<RawUser>()
    .to(outputPath)
    .onBeforeWrite((data) => {
      console.log(`📊 Original data: ${data.length} users`);

      // Filter: Only active users
      const activeUsers = data.filter((user) => user.active);
      console.log(`🔍 After filtering (active only): ${activeUsers.length} users`);

      // Transform: Add full name, add salary band
      const transformed: TransformedUser[] = activeUsers.map((user) => ({
        ...user,
        fullName: `${user.firstName} ${user.lastName}`,
        salaryBand: user.salary > 80000 ? 'High' : 'Medium',
      }));

      console.log(`✨ Transformation complete\n`);

      return transformed;
    })
    .onAfterWrite((_data, count) => {
      console.log(`✅ Successfully wrote ${count} transformed records`);
    })
    .write(rawUsers);

  if (result.success) {
    console.log(`📄 File created: ${outputPath}`);
  } else {
    console.error('❌ Export failed:', result.error.message);
    process.exit(1);
  }
}

main().catch(console.error);
