/**
 * Test script specifically for Table of Contents rendering issues
 * This generates a simple PDF with various TOC formats to verify fixes
 */
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { renderMarkdownToPdf } = require('./utils/pdf/markdownRenderer');

// Create a test markdown focusing on TOC formats
const testMarkdown = `---
title: 'TOC Rendering Test'
author: 'Debug Tester'
---

# Table of Contents

1. [Introduction](#introduction)
2. [Section One with a much longer title that should wrap properly to the next line](#section-one)
3. [Section Two](#section-two)
4. [Conclusion](#conclusion)

- [Appendix A](#appendix-a)
- [Appendix B with longer title](#appendix-b)

---

# Introduction

This is a test document to debug TOC rendering issues.

# Section One

This is section one content.

# Section Two

This is section two content.

# Conclusion

This concludes the test document.

# Appendix A

This is appendix A.

# Appendix B

This is appendix B.
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
    Title: 'TOC Rendering Test',
    Author: 'Debug Tester',
  },
});

// Create an output stream
const outputPath = path.join(__dirname, '..', 'toc-rendering-test.pdf');
const outputStream = fs.createWriteStream(outputPath);

// Pipe the PDF to the output stream
doc.pipe(outputStream);

console.log('Generating TOC rendering test PDF...');

// Render markdown
console.log('Rendering markdown content...');
renderMarkdownToPdf(testMarkdown, doc);

// Finalize the PDF
console.log('Finalizing PDF...');
doc.end();

outputStream.on('finish', () => {
  console.log(`Test PDF saved to ${outputPath}`);
});

outputStream.on('error', (err) => {
  console.error('Error generating test PDF:', err);
});
