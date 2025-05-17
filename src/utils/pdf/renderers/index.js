/**
 * PDF Renderers Index
 *
 * This module exports all renderer components for easy access.
 *
 * @module utils/pdf/renderers
 */

const headings = require('./headings');
const lists = require('./lists');
const blocks = require('./blocks');

module.exports = {
  ...headings,
  ...lists,
  ...blocks,
};
