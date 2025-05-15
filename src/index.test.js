const request = require('supertest');
const express = require('express');
const app = require('./index');

// Mock environment variable for testing
process.env.API_KEY_SECRET = 'test-api-key';

describe('PDF Service', () => {
  test('health check endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  test('generate PDF with valid content and API key', async () => {
    const response = await request(app)
      .post('/generate-pdf')
      .set('X-API-Key', 'test-api-key')
      .send({ content: 'Test PDF content' });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/pdf');
  });

  test('generate PDF with missing API key should fail', async () => {
    const response = await request(app)
      .post('/generate-pdf')
      .send({ content: 'Test PDF content' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized: Invalid API key' });
  });

  test('generate PDF with invalid API key should fail', async () => {
    const response = await request(app)
      .post('/generate-pdf')
      .set('X-API-Key', 'wrong-api-key')
      .send({ content: 'Test PDF content' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Unauthorized: Invalid API key' });
  });

  test('generate PDF with valid API key but missing content', async () => {
    const response = await request(app)
      .post('/generate-pdf')
      .set('X-API-Key', 'test-api-key')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Content is required' });
  });
});
