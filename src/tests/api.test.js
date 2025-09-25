/**
 * API Integration Tests for Ayush FHIR Microservice
 * Verifies the functionality of the main API endpoints
 */

const request = require('supertest');
const AyushFHIRServer = require('../server');

// Mock server instance
let server;
let app;

beforeAll(() => {
  // Initialize server without starting the listener
  server = new AyushFHIRServer();
  app = server.app;
});

beforeEach(async () => {
  // Load sample data before each test
  await server.dataStore.clear();
  const sampleCSVPath = require('path').join(__dirname, '../../data/sample-namaste.csv');
  const parseResult = await server.csvParser.parseCSV(sampleCSVPath);
  server.dataStore.storeTerms(parseResult.terms);
});

describe('API Endpoints', () => {
  
  // Test Health Check Endpoint
  describe('GET /health', () => {
    it('should return a healthy status', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.services.dataStore.totalTerms).toBeGreaterThan(0);
    });
  });

  // Test Root Endpoint
  describe('GET /', () => {
    it('should return API information', async () => {
      const res = await request(app).get('/');
      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toBe('Ayush FHIR Microservice');
    });
  });

  // Test Terminology API
  describe('Terminology API (/api/terminology)', () => {
    
    // Test Search Endpoint
    describe('GET /search', () => {
      it('should return search results for a valid query', async () => {
        const res = await request(app).get('/api/terminology/search?q=fever');
        expect(res.statusCode).toEqual(200);
        expect(res.body.results).toBeInstanceOf(Array);
        expect(res.body.results.length).toBeGreaterThan(0);
        expect(res.body.results[0]).toHaveProperty('term');
        expect(res.body.results[0]).toHaveProperty('score');
      });

      it('should return an empty array for no matches', async () => {
        const res = await request(app).get('/api/terminology/search?q=nonexistentterm');
        expect(res.statusCode).toEqual(200);
        expect(res.body.results).toEqual([]);
      });

      it('should return a 400 error if query is missing', async () => {
        const res = await request(app).get('/api/terminology/search');
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toBe('Query parameter "q" is required');
      });
    });

    // Test Get Term by ID Endpoint
    describe('GET /term/:id', () => {
      it('should return a term for a valid ID', async () => {
        const res = await request(app).get('/api/terminology/term/AY001');
        expect(res.statusCode).toEqual(200);
        expect(res.body.term.id).toBe('AY001');
        expect(res.body.term.term).toBe('Amlapitta');
      });

      it('should return a 404 error for an invalid ID', async () => {
        const res = await request(app).get('/api/terminology/term/INVALID_ID');
        expect(res.statusCode).toEqual(404);
        expect(res.body.error).toBe('Term not found');
      });
    });

    // Test Get Terms by Category Endpoint
    describe('GET /category/:category', () => {
      it('should return terms for a valid category', async () => {
        const res = await request(app).get('/api/terminology/category/Ayurvedic Disease');
        expect(res.statusCode).toEqual(200);
        expect(res.body.terms).toBeInstanceOf(Array);
        expect(res.body.terms.length).toBeGreaterThan(0);
        expect(res.body.terms[0].category).toBe('Ayurvedic Disease');
      });
    });

    // Test Get Mapped Terms Endpoint
    describe('GET /mapped', () => {
      it('should return terms with ICD-11 mappings', async () => {
        const res = await request(app).get('/api/terminology/mapped');
        expect(res.statusCode).toEqual(200);
        expect(res.body.terms).toBeInstanceOf(Array);
        expect(res.body.terms.length).toBeGreaterThan(0);
        expect(res.body.terms.every(t => t.icd11_tm2_code)).toBe(true);
      });
    });
  });

  // Test Admin API
  describe('Admin API (/admin)', () => {
    
    // Test Get Statistics Endpoint
    describe('GET /statistics', () => {
      it('should return data store statistics', async () => {
        const res = await request(app).get('/admin/statistics');
        expect(res.statusCode).toEqual(200);
        expect(res.body.statistics).toHaveProperty('totalTerms');
        expect(res.body.statistics.totalTerms).toBeGreaterThan(0);
      });
    });

    // Test Clear Data Endpoint
    describe('DELETE /clear', () => {
      it('should clear all data from the store', async () => {
        // First, check that there is data
        let statsRes = await request(app).get('/admin/statistics');
        expect(statsRes.body.statistics.totalTerms).toBeGreaterThan(0);

        // Clear data
        const clearRes = await request(app).delete('/admin/clear');
        expect(clearRes.statusCode).toEqual(200);
        expect(clearRes.body.message).toBe('All data cleared successfully');

        // Check that data is cleared
        statsRes = await request(app).get('/admin/statistics');
        expect(statsRes.body.statistics.totalTerms).toBe(0);
      });
    });

    // Test Ingest CSV Endpoint
    describe('POST /ingest-csv', () => {
      it('should ingest CSV data from string', async () => {
        // Sample CSV data
        const csvData = `id,term,category,synonyms,icd11_tm2_code
TEST001,"Test Term","Test Category","Synonym 1,Synonym 2","TEST-CODE"`;

        const res = await request(app)
          .post('/admin/ingest-csv')
          .send({ csvData });
        
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
        expect(res.body.parsing.parsed).toBe(1);
        expect(res.body.storage.stored).toBe(1);

        // Verify term was stored
        const termRes = await request(app).get('/api/terminology/term/TEST001');
        expect(termRes.statusCode).toEqual(200);
        expect(termRes.body.term.term).toBe('Test Term');
      });
    });
  });
});
