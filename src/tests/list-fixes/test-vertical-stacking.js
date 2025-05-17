/**
 * Test script specifically for vertical stacking issues in list rendering
 * This generates examples of various list formats to verify the fixes
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { renderMarkdownToPdf } = require('./utils/pdf/markdownRenderer');
const { createCoverPage } = require('./utils/pdf/pageElements');
const { visualizeMargins, logPosition } = require('./utils/pdf/debug');

// Create a test markdown focusing specifically on list rendering edge cases
const testMarkdown = `---
title: 'Vertical Stacking Test'
author: 'Debug Tester'
---

# Vertical Stacking Test Document

This document tests the fix for vertical stacking issues in lists and TOC items.

## Simple Lists

- Short bullet item
- Medium length bullet item with more words
- Very long bullet item that should wrap properly to multiple lines without any vertical stacking of characters which was the issue we were seeing before with PDFKit rendering

1. Short numbered item
2. Medium length numbered item with more words
3. Very long numbered item that should wrap properly to multiple lines without any vertical stacking of characters which was the issue we were seeing before with PDFKit rendering
4. Numbered item with a [link](https://example.com) that also wraps to multiple lines without creating any vertical stacking issues

## Table of Contents Examples

1. [Short TOC item](#short)
2. [Medium length TOC item with more words](#medium)
3. [Very long TOC item that should wrap properly to multiple lines without any vertical stacking of characters which was the issue we were seeing before](#long)

- [Bullet TOC item](#bullet)
- [Bullet TOC item with longer text that spans multiple lines and should wrap properly without vertical stacking](#long-bullet)

## Edge Cases

- Item with **bold** and *italic* text that spans multiple lines and should still render properly without any unusual vertical stacking or character placement issues

1. Item with inline \`code\` that wraps to multiple lines
2. Item with 10+ words: one two three four five six seven eight nine ten eleven twelve

## Nested Lists

- First level item
  - Second level item
    - Third level item with longer text that should wrap properly and not stack vertically

1. First level numbered
   1. Second level numbered
      1. Third level numbered with longer text that should wrap properly and not stack vertically

## Long Wrapped Text With Lists

This is a paragraph before a list with multiple items. The text should flow normally and the following list should render correctly:

- First bullet point with particularly long text that must wrap to multiple lines without any vertical stacking issues which would make the PDF unreadable
- Second bullet point also with long text content that spans multiple lines

## Table of Contents With Page Numbers

1. [First Chapter](#first) .......... 1
2. [Second Chapter with a much longer title that needs to wrap](#second) .......... 2
3. [Third Chapter](#third) .......... 3
`;

// Create the PDF document
const doc = new PDFDocument({
  margins: {
    top: 72,
    bottom: 72,
    left: 72,
    right: 72,
  },
  info: {
    Title: 'Vertical Stacking Test',
    Author: 'Debug Tester',
  },
});

// Create an output stream
const outputPath = path.join(__dirname, '..', 'vertical-stacking-test.pdf');
const outputStream = fs.createWriteStream(outputPath);

// Pipe the PDF to the output stream
doc.pipe(outputStream);

console.log('Generating vertical stacking test PDF...');

// Visualize margins to help debug text flow issues
visualizeMargins(doc, { fillBackground: true });

// Create cover page
const metadata = {
  title: 'Vertical Stacking Test',
  author: 'Debug Tester',
};

createCoverPage(metadata, doc);

// Log position before rendering content
logPosition(doc, 'Before rendering markdown');

// Render the test content
console.log('Rendering test markdown...');
renderMarkdownToPdf(testMarkdown, doc);

// Log position after rendering
logPosition(doc, 'After rendering markdown');

// Finalize the PDF
console.log('Finalizing PDF...');
doc.end();

outputStream.on('finish', () => {
  console.log(`Test PDF saved to ${outputPath}`);
  console.log(
    'Please check this PDF to verify no vertical stacking issues remain.'
  );
});

outputStream.on('error', (err) => {
  console.error('Error generating vertical stacking test PDF:', err);
});
