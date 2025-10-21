/**
 * Sample: Streaming Large Datasets
 *
 * This example demonstrates how to efficiently export large datasets using
 * async generators and streaming. The builder API automatically batches
 * records for optimal memory usage.
 *
 * Use Case: Exporting millions of records from a database or API without
 * loading everything into memory at once.
 */

import { outport } from '../src/index.js';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface LogEntry extends Record<string, unknown> {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  requestId: string;
  userId: number;
}

// Simulate a database cursor or paginated API
async function* fetchLogsPaginated(
  totalRecords: number,
  pageSize: number
): AsyncGenerator<LogEntry[], void, unknown> {
  console.log(`📡 Starting to fetch ${totalRecords} log entries (page size: ${pageSize})...\n`);

  for (let page = 0; page < Math.ceil(totalRecords / pageSize); page++) {
    // Simulate network delay
    await new Promise((resolve) => globalThis.setTimeout(resolve, 100));

    const startIdx = page * pageSize;
    const endIdx = Math.min(startIdx + pageSize, totalRecords);
    const pageData: LogEntry[] = [];

    for (let i = startIdx; i < endIdx; i++) {
      const level = ['INFO', 'WARN', 'ERROR'][i % 3] as LogEntry['level'];
      pageData.push({
        timestamp: new Date(Date.now() - (totalRecords - i) * 1000).toISOString(),
        level,
        message: `Log message ${i + 1}`,
        requestId: `req-${Math.random().toString(36).substring(7)}`,
        userId: Math.floor(Math.random() * 1000),
      });
    }

    console.log(`  📦 Fetched page ${page + 1}: ${pageData.length} records`);
    yield pageData;
  }
}

// Flatten async generator of batches into single records
async function* flattenBatches<T>(
  source: AsyncGenerator<T[], void, unknown>
): AsyncGenerator<T, void, unknown> {
  for await (const batch of source) {
    for (const item of batch) {
      yield item;
    }
  }
}

async function main() {
  const outputDir = path.join(__dirname, 'temp', 'streaming');
  const outputPath = path.join(outputDir, 'server-logs.csv');

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('🌊 Streaming Large Dataset Example');
  console.log('='.repeat(50));
  console.log(`Output: ${outputPath}\n`);

  const TOTAL_RECORDS = 10000; // Simulate 10K log entries
  const PAGE_SIZE = 500; // Fetch 500 at a time

  let lastUpdate = 0;

  const result = await outport<LogEntry>()
    .to(outputPath)
    .withHeaders(['timestamp', 'level', 'message', 'requestId', 'userId'])
    .onProgress((count: number) => {
      // Update every 1000 records to avoid console spam
      if (count - lastUpdate >= 1000 || count === TOTAL_RECORDS) {
        const percent = ((count / TOTAL_RECORDS) * 100).toFixed(1);
        console.log(
          `  ⚡ Processed: ${count.toLocaleString()}/${TOTAL_RECORDS.toLocaleString()} (${percent}%)`
        );
        lastUpdate = count;
      }
    })
    .onComplete((_result, totalRecords) => {
      console.log(`\n✅ Streaming complete: ${totalRecords.toLocaleString()} records written`);
      console.log(`📁 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    })
    .stream(() => flattenBatches(fetchLogsPaginated(TOTAL_RECORDS, PAGE_SIZE)));

  if (result.success) {
    console.log(`\n🎉 Export successful!`);
    console.log(`   Records processed: ${result.value.toLocaleString()}`);
  } else {
    console.error(`\n❌ Export failed: ${result.error.message}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
