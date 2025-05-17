# PDF Microservice Test Suite

This directory contains the tests for the PDF microservice.

## Test Structure

The tests are organized into the following directories:

- `list-fixes/` - Tests for the list rendering fixes
- `pdf-rendering/` - Tests for the PDF rendering functionality
- `utils/` - Utility tests

## Running Tests

You can run all tests or specific test suites:

```bash
# Run all tests
npm test

# Run only list fix tests
npm run test:list

# Run only PDF rendering tests
npm run test:pdf

# Run only utility tests
npm run test:utils
```

## Important Note About Paths

After organizing the test files, imports need to be updated to account for the new file locations. For example:

- Change `./utils/pdf/debug` to `../../utils/pdf/debug`
- Change `./utils/pdf/renderers/lists` to `../../utils/pdf/renderers/lists`
- Change `./utils/pdf/markdownRenderer` to `../../utils/pdf/markdownRenderer`

Also, output paths for PDFs need to be updated to account for the deeper directory structure:

```javascript
// Old path
const outputPath = path.join(__dirname, '..', 'output.pdf');

// Updated path
const outputPath = path.join(__dirname, '../../../', 'output.pdf');
```

## Test Files

### List Fix Tests

- `test-debug-layout.js` - Tests for the debug layout visualization
- `test-line-gap-fix.js` - Tests for the line gap fix
- `test-isolated-list.js` - Isolated tests for list rendering
- `test-new-list-fix.js` - Tests for the updated list rendering implementation
- `test-list-styles.js` - Tests for various list styles
- `test-vertical-stacking.js` - Tests for fixing vertical stacking issues

### PDF Rendering Tests

- `test-full-rendering.js` - Tests for the full rendering pipeline
- `test-markdown.js` - Tests for Markdown rendering
- `test-toc-rendering.js` - Tests for Table of Contents rendering
- `test-list-rendering.js` - Tests for list rendering

### Utility Tests

- `test-fix.js` - General fix tests
- `test-font-list-fix.js` - Tests for list rendering with different fonts
