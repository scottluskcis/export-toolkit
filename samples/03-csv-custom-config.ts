/**
 * CSV with Custom Configuration Example
 *
 * This sample shows how to customize CSV output with:
 * - Custom delimiter (tab-separated)
 * - Custom headers
 * - Column mapping
 * - UTF-8 BOM for Excel compatibility
 *
 * Run: npx tsx samples/03-csv-custom-config.ts
 */

import { outport } from '../src/index.js';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Employee extends Record<string, unknown> {
  employeeId: number;
  firstName: string;
  lastName: string;
  department: string;
  salary: number;
  hireDate: string;
}

async function main() {
  const employees: Employee[] = [
    {
      employeeId: 1001,
      firstName: 'John',
      lastName: 'Doe',
      department: 'Engineering',
      salary: 95000,
      hireDate: '2020-01-15',
    },
    {
      employeeId: 1002,
      firstName: 'Jane',
      lastName: 'Smith',
      department: 'Marketing',
      salary: 85000,
      hireDate: '2019-03-22',
    },
    {
      employeeId: 1003,
      firstName: 'Bob',
      lastName: 'Johnson',
      department: 'Sales',
      salary: 78000,
      hireDate: '2021-06-10',
    },
  ];

  const outputDir = path.join(__dirname, 'temp', 'custom-csv');
  const outputPath = path.join(outputDir, 'employees.tsv');

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('📝 Exporting employees to TSV with custom configuration...');

  const result = await outport<Employee>()
    .to(outputPath)
    .withDelimiter('\t') // Tab-separated values
    .withHeaders(['Employee ID', 'First Name', 'Last Name', 'Department', 'Salary', 'Hire Date'])
    .withUtf8Bom(true) // Add BOM for Excel compatibility
    .write(employees);

  if (result.success) {
    console.log(`✅ Successfully exported ${employees.length} employees`);
    console.log(`📄 File created: ${outputPath}`);
    console.log(`📋 Format: Tab-separated with UTF-8 BOM`);
  } else {
    console.error('❌ Export failed:', result.error.message);
    process.exit(1);
  }
}

main().catch(console.error);
