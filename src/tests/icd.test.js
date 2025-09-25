/**
 * ICD-11 API Integration Tests
 * Verifies the functionality of the ICD-11 API endpoints
 */

const request = require('supertest');
const AyushFHIRServer = require('../server');
const axios = require('axios');

// Mock axios
jest.mock('axios');

// Mock server instance
let server;
let app;

beforeAll(() => {
  // Set up mock environment variables for ICD-11 API
  process.env.ICD11_CLIENT_ID = 'test_client_id';
  process.env.ICD11_CLIENT_SECRET = 'test_client_secret';

  // Initialize server without starting the listener
  server = new AyushFHIRServer();
  app = server.app;
});

beforeEach(() => {
  // Clear all mocks before each test
  axios.post.mockClear();
  axios.get.mockClear();
  server.icdService.token = null;
  server.icdService.tokenExpiry = null;
  server.dataStore.icd11Cache.flushAll();
});

describe('ICD-11 API Endpoint (/api/icd)', () => {
  
  it('should return search results from the WHO ICD-11 API', async () => {
    // Mock the OAuth token response
    axios.post.mockResolvedValueOnce({
      data: {
        access_token: 'test_access_token',
        expires_in: 3600
      }
    });

    // Mock the search API response
    const mockSearchResults = {
      "@context": "http://id.who.int/icd/contexts/search.json",
      "destinationEntities": [
        {
          "id": "http://id.who.int/icd/entity/1326393474",
          "title": "<span>Fever</span>",
          "stemId": "http://id.who.int/icd/entity/1326393474",
          "isAdopted": true
        }
      ]
    };
    axios.get.mockResolvedValueOnce({ data: mockSearchResults });

    const res = await request(app).get('/api/icd/search?q=fever');
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.destinationEntities).toBeInstanceOf(Array);
    expect(res.body.destinationEntities.length).toBe(1);
    expect(res.body.destinationEntities[0].title).toContain('Fever');

    // Verify that the token endpoint was called
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(URLSearchParams),
      expect.any(Object)
    );

    // Verify that the search endpoint was called
    expect(axios.get).toHaveBeenCalledWith(
      'https://id.who.int/icd/entity/search',
      expect.objectContaining({
        params: { q: 'fever' }
      })
    );
  });

  it('should use a cached access token on subsequent requests', async () => {
    // First request to get and cache the token
    axios.post.mockResolvedValueOnce({
      data: {
        access_token: 'test_access_token',
        expires_in: 3600
      }
    });
    axios.get.mockResolvedValueOnce({ data: { destinationEntities: [] } });
    await request(app).get('/api/icd/search?q=fever');

    // Second request
    axios.get.mockResolvedValueOnce({ data: { destinationEntities: [] } });
    await request(app).get('/api/icd/search?q=cough');

    // The token endpoint should only have been called once
    expect(axios.post).toHaveBeenCalledTimes(1);
  });

  it('should return a 400 error if query is missing', async () => {
    const res = await request(app).get('/api/icd/search');
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('Query parameter "q" is required');
  });

  it('should handle errors from the WHO ICD-11 API', async () => {
    // Mock a failed token response
    axios.post.mockImplementation(() => Promise.reject(new Error('Authentication failed')));

    const res = await request(app).get('/api/icd/search?q=fever');
    
    expect(res.statusCode).toEqual(500);
    expect(res.body.error).toBe('ICD-11 API search failed');
  });
});
