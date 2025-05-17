/**
 * Main Test Runner
 *
 * This script runs all test suites or a specific test suite based on arguments.
 *
 * Usage:
 *   node tests/index.js          - Runs all test suites
 *   node tests/index.js list     - Runs only list-fix tests
 *   node tests/index.js pdf      - Runs only pdf-rendering tests
 *   node tests/index.js utils    - Runs only utility tests
 */

const path = require('path');
const { exec } = require('child_process');

// Get the test suite to run from command line args
const args = process.argv.slice(2);
const testSuite = args[0];

// Define test suites
const TEST_SUITES = {
  list: {
    name: 'List Fix Tests',
    path: './list-fixes/index.js',
  },
  pdf: {
    name: 'PDF Rendering Tests',
    path: './pdf-rendering/index.js',
  },
  utils: {
    name: 'Utility Tests',
    path: './utils/index.js',
  },
};

console.log('🧪 PDF Microservice Test Runner');
console.log('==============================\n');

async function runTests() {
  // If a specific test suite is specified, run only that one
  if (testSuite && TEST_SUITES[testSuite]) {
    const suite = TEST_SUITES[testSuite];
    console.log(`Running only ${suite.name}`);
    await runTestSuite(suite.path);
    return;
  }

  // Otherwise run all test suites
  console.log('Running all test suites\n');

  for (const [key, suite] of Object.entries(TEST_SUITES)) {
    console.log(`\n🔍 SUITE: ${suite.name}`);
    console.log('==============================');
    await runTestSuite(suite.path);
  }

  console.log('\n✅ All test suites completed');
}

async function runTestSuite(suitePath) {
  const fullPath = path.join(__dirname, suitePath);

  try {
    const { stdout, stderr } = await execPromise(`node "${fullPath}"`);
    console.log(stdout);
    if (stderr) console.error(`Error: ${stderr}`);
  } catch (error) {
    console.error(`Failed to run test suite: ${error.message}`);
  }
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
