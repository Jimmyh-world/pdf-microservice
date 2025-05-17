/**
 * Utility Tests Runner
 *
 * This script runs all tests related to utility functions.
 * Run with: node tests/utils/index.js
 */

const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

// List of all test files in this directory
const testFiles = ['test-fix.js', 'test-font-list-fix.js'];

console.log('🧪 Running Utility Tests:');
console.log('======================\n');

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

  console.log('\n✅ All utility tests completed');
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
