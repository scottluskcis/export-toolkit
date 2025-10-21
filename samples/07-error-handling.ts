/**
 * Sample: Error Handling and Recovery
 *
 * This example demonstrates comprehensive error handling using the onError hook,
 * including validation failures, file system errors, and data issues.
 *
 * Use Case: Production systems that need robust error handling and logging.
 */

import { outport } from '../src/index.js';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Transaction extends Record<string, unknown> {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
}

async function main() {
  const outputDir = path.join(__dirname, 'temp', 'error-handling');
  const outputPath = path.join(outputDir, 'transactions.json');
  const errorLogPath = path.join(outputDir, 'errors.log');

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('🛡️  Error Handling Example');
  console.log('='.repeat(50));
  console.log(`Output: ${outputPath}`);
  console.log(`Error Log: ${errorLogPath}\n`);

  const transactions: Transaction[] = [
    {
      id: 'txn-001',
      amount: 100.5,
      currency: 'USD',
      status: 'completed',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'txn-002',
      amount: 250.0,
      currency: 'EUR',
      status: 'completed',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'txn-003',
      amount: 75.25,
      currency: 'GBP',
      status: 'pending',
      timestamp: new Date().toISOString(),
    },
  ];

  let errorCount = 0;

  try {
    const result = await outport<Transaction>()
      .to(outputPath)
      .prettyPrint()
      .onBeforeWrite((data: Transaction[]) => {
        console.log(`📊 Validating ${data.length} transactions...`);

        // Validate data before writing
        const validated = data.filter((txn: Transaction) => {
          if (!txn.id || typeof txn.id !== 'string') {
            console.warn(`⚠️  Invalid transaction ID: ${JSON.stringify(txn)}`);
            errorCount++;
            return false;
          }
          if (typeof txn.amount !== 'number' || txn.amount <= 0) {
            console.warn(`⚠️  Invalid amount for transaction ${txn.id}: ${txn.amount}`);
            errorCount++;
            return false;
          }
          if (!['USD', 'EUR', 'GBP'].includes(txn.currency)) {
            console.warn(`⚠️  Unsupported currency for transaction ${txn.id}: ${txn.currency}`);
            errorCount++;
            return false;
          }
          return true;
        });

        console.log(`✓ ${validated.length} transactions validated`);
        if (errorCount > 0) {
          console.log(`⚠️  ${errorCount} transactions failed validation\n`);
        }

        return validated;
      })
      .onError((error: Error) => {
        console.error(`\n❌ Error occurred during export:`);
        console.error(`   ${error.message}`);

        // Log error to file
        const errorLog = `[${new Date().toISOString()}] ${error.name}: ${error.message}\n${error.stack}\n\n`;
        fs.appendFileSync(errorLogPath, errorLog);

        console.log(`📝 Error logged to: ${errorLogPath}`);

        // In a real application, you might:
        // - Send error to monitoring service (Sentry, DataDog, etc.)
        // - Trigger alerts
        // - Attempt recovery or rollback
        // - Update database status

        throw error; // Re-throw to stop execution
      })
      .onComplete((_result, totalRecords) => {
        console.log(`\n✅ Export completed successfully`);
        console.log(`   ${totalRecords} valid transactions written`);
        if (errorCount > 0) {
          console.log(`   ${errorCount} transactions rejected`);
        }
      })
      .write(transactions);

    console.log(`\n🎉 Success!`);
    console.log(`   Total records: ${result.success ? transactions.length - errorCount : 0}`);
  } catch {
    console.error(`\n💥 Fatal error - export failed`);
    console.error(`   Check error log: ${errorLogPath}`);
    process.exit(1);
  }

  // Example 2: Demonstrate file system error
  console.log('\n' + '='.repeat(50));
  console.log('📂 Testing File System Error Handling\n');

  const invalidPath = '/root/this-will-fail/data.csv'; // Permission denied on most systems

  try {
    await outport<Transaction>()
      .to(invalidPath)
      .onError((error: Error) => {
        console.error(`❌ Caught expected error: ${error.message}`);
        console.log(`✓ Error hook executed successfully\n`);
        throw error;
      })
      .write(transactions);
  } catch {
    console.log('✓ Error was properly caught and handled');
    console.log('  (This is expected behavior for permission-denied paths)\n');
  }

  console.log('🎓 Key Takeaways:');
  console.log('  • Use onBeforeWrite for data validation');
  console.log('  • Use onError for centralized error handling');
  console.log('  • Log errors to files for debugging');
  console.log('  • Filter invalid data before writing');
  console.log('  • Re-throw errors to stop execution when needed');
}

main().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
