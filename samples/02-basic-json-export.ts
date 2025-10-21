/**
 * Basic JSON Export Example
 *
 * This sample demonstrates exporting data to JSON format
 * with pretty printing.
 *
 * Run: npx tsx samples/02-basic-json-export.ts
 */

import { outport } from '../src/index';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Product extends Record<string, unknown> {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

async function main() {
  const products: Product[] = [
    { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics', inStock: true },
    { id: 2, name: 'Mouse', price: 29.99, category: 'Electronics', inStock: true },
    { id: 3, name: 'Keyboard', price: 79.99, category: 'Electronics', inStock: false },
    { id: 4, name: 'Monitor', price: 299.99, category: 'Electronics', inStock: true },
    { id: 5, name: 'Desk Chair', price: 199.99, category: 'Furniture', inStock: true },
  ];

  const outputDir = path.join(__dirname, 'temp', 'basic-json');
  const outputPath = path.join(outputDir, 'products.json');

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  console.log('📝 Exporting products to JSON...');

  const result = await outport<Product>()
    .to(outputPath)
    .prettyPrint(true)
    .withIndent(2)
    .write(products);

  if (result.success) {
    console.log(`✅ Successfully exported ${products.length} products to ${outputPath}`);
    console.log(`📄 File created with pretty formatting`);
  } else {
    console.error('❌ Export failed:', result.error.message);
    process.exit(1);
  }
}

main().catch(console.error);
