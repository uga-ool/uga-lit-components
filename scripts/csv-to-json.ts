/**
 * Convert eLC CSV quiz files to uga-quiz JSON format.
 *
 * Usage:
 *   npm run quiz:csv-to-json -- <input.csv> [output.json]
 *
 * Uses the same parseD2LCSV() as uga-quiz type="csv". See docs/QUIZ_JSON_FORMAT.md.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { parseD2LCSV } from '../src/lib/data/csv-parser.js';

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath) {
  console.error('Usage: npm run quiz:csv-to-json -- <input.csv> [output.json]');
  process.exit(1);
}

const csvContent = readFileSync(resolve(inputPath), 'utf-8');
const { questions } = parseD2LCSV(csvContent);

const json = JSON.stringify({ questions }, null, 2);
const outPath = outputPath || inputPath.replace(/\.csv$/i, '.json');
writeFileSync(resolve(outPath), json, 'utf-8');
console.log(`Converted ${questions.length} questions to ${outPath}`);
