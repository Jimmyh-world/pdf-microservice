/**
 * List Fix Tests Runner
 *
 * This script runs all tests related to the list rendering fixes.
 * Run with: node tests/list-fixes/index.js
 */

const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// List of all test files in this directory
const testFiles = [
  'test-debug-layout.js',
  'test-line-gap-fix.js',
  'test-isolated-list.js',
  'test-new-list-fix.js',
  'test-list-styles.js',
  'test-vertical-stacking.js',
];

console.log('🧪 Running List Fix Tests:');
console.log('=======================\n');

// Run each test sequentially
async function runTests() {
  for (const testFile of testFiles) {
    console.log(`\n🏃 Running: ${testFile}`);
    console.log('-----------------------');

    const testPath = path.join(__dirname, testFile);

    // Only run the test if it exists
    if (fs.existsSync(testPath)) {
      try {
        // Execute the test
        const { stdout, stderr } = await execPromise(`node "${testPath}"`);
        console.log(stdout);
        if (stderr) console.error(`Error: ${stderr}`);
      } catch (error) {
        console.error(`Failed to run ${testFile}: ${error.message}`);
      }
    } else {
      console.error(`Test file not found: ${testPath}`);
    }
  }

  console.log('\n✅ All list fix tests completed');
}

// Promise wrapper for exec
function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve({ stdout, stderr });
    });
  });
}

// Run the tests
runTests().catch((err) => {
  console.error('❌ Error running tests:', err);
});
