#!/usr/bin/env node
/**
 * Copy uga-components.js from uga-lit-components build into public/.
 * Run after npm install or when the lit components bundle is updated.
 * Never exits with failure so npm install always succeeds.
 *
 * If uga-lit-components is a sibling directory:
 *   ../uga-lit-components/dist/js/uga-components.js -> public/uga-components.js
 *
 * If this app lives inside uga-lit-components:
 *   ../dist/js/uga-components.js -> public/uga-components.js
 */

const fs = require('fs');
const path = require('path');

function run() {
  const projectRoot = path.resolve(__dirname, '..');
  const publicDir = path.join(projectRoot, 'public');
  const possibleSources = [
    path.join(projectRoot, '..', 'uga-lit-components', 'dist', 'js', 'uga-components.js'),
    path.join(projectRoot, '..', 'dist', 'js', 'uga-components.js'),
  ];

  for (const src of possibleSources) {
    if (fs.existsSync(src)) {
      try {
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        const dest = path.join(publicDir, 'uga-components.js');
        fs.copyFileSync(src, dest);
        console.log('✅ Copied uga-components.js to public/');
        return;
      } catch (err) {
        console.warn('⚠️ Could not copy uga-components.js:', err.message);
        break;
      }
    }
  }

  if (!fs.existsSync(publicDir)) {
    try {
      fs.mkdirSync(publicDir, { recursive: true });
    } catch (err) {
      console.warn('⚠️ Could not create public/:', err.message);
      return;
    }
  }
  try {
    const readmePath = path.join(publicDir, 'README-uga-components.txt');
    fs.writeFileSync(
      readmePath,
      'To use the quiz in this app:\n' +
      '1. In the uga-lit-components repo run: npm run build\n' +
      '2. Copy dist/js/uga-components.js to this app\'s public/ folder as uga-components.js\n' +
      '3. Or run: npm run postinstall (from this app directory)\n'
    );
  } catch (_) {}
  console.log('⚠️ uga-components.js not found. Copy dist/js/uga-components.js from uga-lit-components to public/uga-components.js');
}

try {
  run();
} catch (err) {
  console.warn('⚠️ copy-uga-components:', err.message);
}
// Always exit 0 so npm install never fails
process.exitCode = 0;
