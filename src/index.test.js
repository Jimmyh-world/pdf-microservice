const request = require('supertest');
const express = require('express');
const app = require('./index');

describe('PDF Service', () => {
  test('health check endpoint', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  test('generate PDF with valid content', async () => {
    const response = await request(app)
      .post('/generate-pdf')
      .send({ content: 'Test PDF content' });

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/pdf');
  });

  test('generate PDF with missing content', async () => {
    const response = await request(app).post('/generate-pdf').send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Content is required' });
  });
});
