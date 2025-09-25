/**
 * FHIR API Integration Tests
 * Verifies the functionality of the FHIR resource generation endpoints
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

describe('FHIR API Endpoints (/fhir)', () => {
  
  // Test FHIR CodeSystem Endpoint
  describe('GET /CodeSystem/namaste', () => {
    it('should return a valid FHIR CodeSystem resource', async () => {
      const res = await request(app).get('/fhir/CodeSystem/namaste');
      expect(res.statusCode).toEqual(200);
      
      // Validate FHIR resource structure
      expect(res.body.resourceType).toBe('CodeSystem');
      expect(res.body.id).toBe('namaste');
      expect(res.body.concept).toBeInstanceOf(Array);
      expect(res.body.concept.length).toBeGreaterThan(0);
      
      // Validate a sample concept
      const sampleConcept = res.body.concept.find(c => c.code === 'AY001');
      expect(sampleConcept).toBeDefined();
      expect(sampleConcept.display).toBe('Amlapitta');
    });
  });

  // Test FHIR ConceptMap Endpoint
  describe('GET /ConceptMap/namaste-to-icd11', () => {
    it('should return a valid FHIR ConceptMap resource', async () => {
      const res = await request(app).get('/fhir/ConceptMap/namaste-to-icd11');
      expect(res.statusCode).toEqual(200);
      
      // Validate FHIR resource structure
      expect(res.body.resourceType).toBe('ConceptMap');
      expect(res.body.id).toBe('namaste-to-icd11');
      expect(res.body.group).toBeInstanceOf(Array);
      expect(res.body.group[0].element.length).toBeGreaterThan(0);
      
      // Validate a sample mapping
      const sampleMapping = res.body.group[0].element.find(e => e.code === 'AY001');
      expect(sampleMapping).toBeDefined();
      expect(sampleMapping.target[0].code).toBe('TM2-AY134');
      expect(sampleMapping.target[0].equivalence).toBe('equivalent');
    });
  });
});
