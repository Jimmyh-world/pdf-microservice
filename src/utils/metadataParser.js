/**
 * Metadata Parser Utilities
 *
 * Extracts metadata from markdown content with YAML front matter
 */

/**
 * Extracts YAML front matter from markdown content
 * @param {string} content - The markdown content with potential YAML front matter
 * @returns {Object} An object with metadata and cleanContent properties
 */
function extractMetadata(content) {
  if (!content) {
    return { metadata: {}, cleanContent: '' };
  }

  // Default return value
  let result = {
    metadata: {},
    cleanContent: content,
  };

  // Check for YAML front matter (between --- or ```)
  const yamlRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const codeBlockRegex = /^```yaml\s*\n([\s\S]*?)\n```\s*\n/;

  let match = content.match(yamlRegex) || content.match(codeBlockRegex);

  if (!match) {
    return result;
  }

  // Extract the YAML content and parse it
  const yamlContent = match[1];

  // Remove the YAML block from the content
  result.cleanContent = content.replace(match[0], '');

  // Parse the YAML content into an object
  try {
    const metadata = {};
    const lines = yamlContent.split('\n');

    for (const line of lines) {
      // Skip empty lines
      if (!line.trim()) continue;

      // Check if the line contains a key-value pair
      if (line.includes(':')) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':').trim();

        // Handle arrays (comma-separated values)
        if (value.includes(',')) {
          metadata[key.trim()] = value.split(',').map((item) => item.trim());
        } else {
          metadata[key.trim()] = value;
        }
      }
    }

    result.metadata = metadata;
  } catch (error) {
    console.error('Error parsing YAML metadata:', error);
    // Return original content if parsing fails
  }

  return result;
}

module.exports = {
  extractMetadata,
};
