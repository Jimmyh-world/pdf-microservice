# PDF Generation Service

A simple, stateless PDF generation service that converts text content to PDF format, secured with API key authentication.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
# Copy the example .env file
cp .env.example .env

# Edit the .env file to set your own secure API key
nano .env
```

3. Start the service:

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The service will be available at `http://localhost:3000`

## API Endpoints

### Generate PDF (Protected)

```http
POST /generate-pdf
Content-Type: application/json
X-API-Key: your-api-key

{
    "content": "Your text content here"
}
```

Response: Binary PDF file

### Health Check (Public)

```http
GET /health
```

Response: `{ "status": "ok" }`

## Authentication

This service uses API key authentication to protect the PDF generation endpoint.

- The API key must be included in the `X-API-Key` header for all requests to protected endpoints
- Set your API key in the `.env` file by changing the `API_KEY_SECRET` value
- Make sure to use a strong, unique API key in production
- Keep your API key secret and never expose it in client-side code

## Testing

Run tests with:

```bash
npm test
```

## Example Usage

```javascript
// Using fetch
const response = await fetch('http://localhost:3000/generate-pdf', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key-here',
  },
  body: JSON.stringify({
    content: 'Hello, this is a test PDF!',
  }),
});

// Get the PDF blob
const pdfBlob = await response.blob();
```

## Deployment

### Deploying to Render

This project includes a `render.yaml` file for easy deployment to [Render](https://render.com).

To deploy:

1. Fork or push this repository to GitHub
2. Sign up for a Render account
3. Create a new Web Service on Render
4. Connect your GitHub repository
5. Render will automatically detect the configuration
6. Add your API key as an environment variable in Render's dashboard
   - Set the key as `API_KEY_SECRET`
   - Set the value to your secure API key
7. Deploy the service

Once deployed, your PDF service will be available at:
`https://pdf-service-xxxx.onrender.com` (where xxxx is a unique identifier assigned by Render)

#### API Endpoints on Render

The same endpoints will be available on your Render URL:

```http
POST https://pdf-service-xxxx.onrender.com/generate-pdf
Content-Type: application/json
X-API-Key: your-api-key

{
    "content": "Your text content here"
}
```

And the health check:

```http
GET https://pdf-service-xxxx.onrender.com/health
```
