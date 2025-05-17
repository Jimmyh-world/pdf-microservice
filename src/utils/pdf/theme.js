/**
 * Default theme configuration for PDF rendering
 * Defines fonts, colors, sizes, and spacing for consistent document styling
 *
 * @module utils/pdf/theme
 */

const DEFAULT_THEME = {
  fonts: {
    heading: 'Helvetica-Bold',
    body: 'Helvetica',
    italic: 'Helvetica-Oblique',
    bold: 'Helvetica-Bold',
    code: 'Courier',
  },
  fontSize: {
    h1: 24,
    h2: 20,
    h3: 16,
    body: 12,
    code: 10,
    footer: 8,
  },
  colors: {
    text: '#000000',
    heading: '#000000',
    blockquote: '#666666',
    codeBackground: '#f4f4f4',
    footer: '#666666',
    link: '#0000EE',
  },
  margins: {
    top: 72,
    bottom: 72,
    left: 72,
    right: 72,
  },
  spacing: {
    paragraph: 0.8,
    heading1: 1,
    heading2: 0.8,
    heading3: 0.7,
    list: 0.8,
    blockquote: 0.8,
    codeBlock: 1,
    lineGap: 4,
  },
};

/**
 * Creates a merged theme by combining user theme with default theme
 *
 * @param {Object} theme - User provided theme settings
 * @returns {Object} - Merged theme with defaults for missing properties
 */
function createMergedTheme(theme = {}) {
  return {
    ...DEFAULT_THEME,
    fonts: { ...DEFAULT_THEME.fonts, ...theme.fonts },
    fontSize: { ...DEFAULT_THEME.fontSize, ...theme.fontSize },
    colors: { ...DEFAULT_THEME.colors, ...theme.colors },
    margins: { ...DEFAULT_THEME.margins, ...theme.margins },
    spacing: { ...DEFAULT_THEME.spacing, ...theme.spacing },
  };
}

module.exports = {
  DEFAULT_THEME,
  createMergedTheme,
};
