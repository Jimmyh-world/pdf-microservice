# PDF Microservice n8n Integration

This directory contains workflow templates for integrating with the PDF microservice using n8n automation platform.

## Markdown to PDF with LLM Formatting

This workflow demonstrates how to use an LLM (like OpenAI's GPT) to properly format Markdown content before sending it to the PDF microservice. This helps prevent JSON parsing errors and ensures your Markdown is well-formed.

### Workflow Overview

1. **Webhook Trigger**: Receives Markdown content via a POST request
2. **LLM Formatting**: Sends content to OpenAI to ensure proper Markdown formatting
3. **Request Preparation**: Structures the data for the PDF microservice
4. **PDF Generation**: Sends the formatted content to your PDF microservice
5. **Email Delivery**: Emails the generated PDF as an attachment

### How to Import

1. Open your n8n instance
2. Go to Workflows → Import From File
3. Select the `markdown-to-pdf-workflow.json` file
4. Configure the API keys and endpoints in the "Set API Keys" node

### Configuration

In the "Set API Keys" Function node, update the following values:

```javascript
return {
  openaiApiKey: 'your-openai-api-key',
  pdfApiKey: 'your-pdf-service-api-key',
  pdfServiceUrl: 'https://your-pdf-service-url',
  defaultEmail: 'recipient@example.com',
};
```

### Using the Webhook

Once configured, you can trigger the workflow by sending a POST request to the webhook URL:

```bash
curl -X POST https://your-n8n-instance/webhook/markdown-to-pdf-converter \
  -H "Content-Type: application/json" \
  -d '{
    "content": "# Sample Document\n\nThis is a test document with **markdown** formatting.",
    "email": "recipient@example.com"
  }'
```

The workflow will:

1. Format the Markdown properly
2. Generate a PDF using your microservice
3. Email the PDF to the specified address

### Common JSON Formatting Issues

The LLM helps prevent these common problems:

- Unescaped quotes in JSON
- Improperly formatted Markdown
- Missing or malformed YAML frontmatter
- Inconsistent line breaks

### Security Considerations

- Store API keys as n8n credentials instead of hardcoding them
- Enable authentication on your webhook to prevent unauthorized access
- Consider rate limiting to prevent abuse

## Additional Workflows

More workflow templates will be added to this directory as they are developed.
