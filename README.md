# PDF Microservice

A lightweight, scalable microservice for generating PDF documents from Markdown and text content.

## Features

- ✨ **Convert Markdown to PDF** with rich formatting support
- 🔒 **API Key Authentication** for secure access
- 📝 **YAML Frontmatter** for document metadata
- 🎨 **Cover Page Generation** based on metadata
- 📋 **Table of Contents** support with navigation
- 📱 **Responsive Design** for optimal viewing on any device
- 🔄 **n8n Integration** with LLM preprocessing workflow

## Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Jimmyh-world/pdf-microservice.git
cd pdf-microservice/pdf-service

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Then edit .env to add your API key
```

### Configuration

Edit `.env` file with your configuration:

```
PORT=3000
API_KEY=your-secure-api-key-here
NODE_ENV=production
```

### Running the service

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Reference

### Generate PDF

Converts Markdown or text content to a PDF document.

```
POST /generate-pdf
```

#### Headers

| Header       | Value            | Description                        |
| ------------ | ---------------- | ---------------------------------- |
| Content-Type | application/json | Indicates JSON format              |
| X-API-Key    | your-api-key     | Authentication key for the service |

#### Request Body

```json
{
  "content": "# Your Markdown Content\n\nThis is a **bold** statement.",
  "filename": "optional-custom-filename.pdf",
  "options": {
    "size": "A4",
    "layout": "portrait"
  }
}
```

| Parameter | Type   | Required | Description                                |
| --------- | ------ | -------- | ------------------------------------------ |
| content   | string | Yes      | Markdown or text content for the PDF       |
| filename  | string | No       | Custom filename for the generated PDF      |
| options   | object | No       | PDF generation options (size, layout, etc) |

#### Response

The response is the generated PDF file with appropriate headers:

```
Content-Type: application/pdf
Content-Disposition: attachment; filename=your-filename.pdf
```

### Health Check

```
GET /health
```

Returns the current service status.

## Markdown Features

The service supports the following Markdown features:

- **Headings** (# to ######)
- **Emphasis** (_italic_, **bold**)
- **Lists** (ordered and unordered)
- **Links** with custom text
- **Blockquotes**
- **Code blocks** with syntax highlighting
- **Horizontal rules**
- **YAML Frontmatter** for metadata

### YAML Frontmatter

You can include metadata at the top of your Markdown:

```markdown
---
title: Document Title
author: Author Name
date: 2024-07-30
keywords: tag1, tag2, tag3
---

# Your content starts here
```

This metadata will be used to generate a cover page and set PDF document properties.

## Integration with n8n

This microservice works well with n8n automation platform. We provide a ready-to-use workflow in the `n8n-workflows` directory that:

1. Uses LLM to preprocess and validate Markdown
2. Formats the content for optimal PDF rendering
3. Calls the PDF service with proper parameters
4. Returns the generated PDF

## Roadmap

- [ ] Table support in Markdown
- [ ] Image embedding
- [ ] Custom CSS themes
- [ ] Header/footer customization
- [ ] PDF compression options

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.
