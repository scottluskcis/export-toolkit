/**
 * Progress Tracking Example
 *
 * This sample demonstrates how to track progress during export
 * operations using the onProgress hook.
 *
 * Run: npx tsx samples/04-progress-tracking.ts
 */

import { outport } from '../src/index.js';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Order extends Record<string, unknown> {
  orderId: number;
  customerId: number;
  amount: number;
  status: string;
  date: string;
}

async function main() {
  // Generate a larger dataset
  const orders: Order[] = [];
  for (let i = 1; i <= 100; i++) {
    orders.push({
      orderId: i,
      customerId: Math.floor(Math.random() * 50) + 1,
      amount: Math.round(Math.random() * 1000 * 100) / 100,
      status: ['pending', 'shipped', 'delivered'][Math.floor(Math.random() * 3)] as string,
      date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        .toISOString()
        .split('T')[0] as string,
    });
  }

  const outputDir = path.join(__dirname, 'temp', 'progress');
  const outputPath = path.join(outputDir, 'orders.csv');

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('📝 Exporting orders with progress tracking...\n');

  let lastProgress = 0;

  const result = await outport<Order>()
    .to(outputPath)
    .onProgress((current, total) => {
      const percent = total ? Math.round((current / total) * 100) : 0;

      // Show progress bar
      const barLength = 30;
      const filled = Math.round((barLength * current) / (total || 1));
      const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);

      // Update same line
      process.stdout.write(`\r[${bar}] ${percent}% (${current}/${total}) `);

      lastProgress = current;
    })
    .write(orders);

  // Move to next line after progress
  console.log('\n');

  if (result.success) {
    console.log(`✅ Successfully exported ${lastProgress} orders`);
    console.log(`📄 File created: ${outputPath}`);
  } else {
    console.error('❌ Export failed:', result.error.message);
    process.exit(1);
  }
}

main().catch(console.error);
