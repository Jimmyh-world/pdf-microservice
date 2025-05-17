/**
 * PDF Rendering Utilities
 *
 * This module provides functionality to convert Markdown content to PDF using PDFKit.
 * It supports various Markdown features including headings, lists, code blocks, blockquotes,
 * and inline formatting (bold, italic, code). The module also handles document metadata and
 * cover page generation.
 *
 * @module utils/pdf
 */

console.log('LOADING REFACTORED PDF MODULE');

const { DEFAULT_THEME, createMergedTheme } = require('./theme');
const { processInlineFormatting } = require('./inlineFormatting');
const { createCoverPage, addPageFooter } = require('./pageElements');
const { renderMarkdownToPdf } = require('./markdownRenderer');

// Re-export all components for backward compatibility
module.exports = {
  DEFAULT_THEME,
  createMergedTheme,
  processInlineFormatting,
  renderMarkdownToPdf,
  createCoverPage,
  addPageFooter,
};
