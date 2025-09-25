/**
 * Auth API Integration Tests
 * Verifies the functionality of the mock ABHA-like OAuth simulation
 */

const request = require('supertest');
const AyushFHIRServer = require('../server');
const jwt = require('jsonwebtoken');

// Mock server instance
let server;
let app;

beforeAll(() => {
  // Set up mock environment variables for JWT secret
  process.env.JWT_SECRET = 'test-secret';

  // Initialize server without starting the listener
  server = new AyushFHIRServer();
  app = server.app;
});

describe('Auth API Endpoint (/auth)', () => {
  
  it('should return a JWT for a valid mock ABHA ID', async () => {
    const res = await request(app)
      .post('/auth/token')
      .send({ abhaId: '1234567890' });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('access_token');
    expect(res.body.token_type).toBe('Bearer');

    // Verify the JWT payload
    const decoded = jwt.verify(res.body.access_token, process.env.JWT_SECRET);
    expect(decoded.sub).toBe('1234567890');
  });

  it('should return a 400 error if abhaId is missing', async () => {
    const res = await request(app)
      .post('/auth/token')
      .send({});
      
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('Mock ABHA ID ("abhaId") is required');
  });
});
