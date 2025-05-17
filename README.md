# PDF Microservice

A microservice for generating PDFs from Markdown content with precise formatting control and rich features.

## Features

- Convert Markdown to professionally formatted PDFs
- Support for headings, lists, code blocks, blockquotes, and inline formatting
- YAML frontmatter for document metadata
- Cover page generation based on metadata
- Table of Contents generation
- Comprehensive theming system for customization
- PDF preview system for testing and development
- Clean API for easy integration with any platform
- API key authentication for security

## Setup & Usage

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pdf-microservice.git
cd pdf-microservice/pdf-service

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your desired configuration
```

### Running the Service

```bash
# Development mode with automatic restart
npm run dev

# Production mode
npm start
```

### Environment Variables

- `PORT`: Port to run the service on (default: 3000)
- `API_KEY`: Secret key for API authentication
- `NODE_ENV`: Environment (development/production)

## API Endpoints

### Generate PDF

```
POST /generate-pdf
```

Request body:

```json
{
  "content": "# Your Markdown Content\n\nThis is a paragraph with **bold** and *italic* text.",
  "filename": "output.pdf",
  "options": {
    "theme": {
      "fonts": {
        "body": "Helvetica",
        "heading": "Helvetica-Bold"
      },
      "fontSize": {
        "body": 12,
        "heading": 16
      }
    }
  }
}
```

Headers:

```
x-api-key: your-api-key
```

### PDF Preview

```
POST /api/preview-pdf
```

Request body: Same as generate-pdf endpoint
(No API key required for the preview endpoint)

## Testing

The project includes comprehensive test suites:

```bash
# Run all tests
npm test

# Run only list rendering fix tests
npm run test:list

# Run only PDF rendering tests
npm run test:pdf

# Run only utility tests
npm run test:utils
```

## Documentation

- Main API documentation can be found in the `/docs` directory
- Fix documentation for rendering issues is in `/docs/fixes`
- Test files are organized in `/src/tests`

## Recent Fixes

We've recently fixed a critical issue with list rendering where text would stack vertically. See the detailed documentation in `/docs/fixes`.

## License

ISC
