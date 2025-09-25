/**
 * Translation API Integration Tests
 * Verifies the functionality of the translation endpoints
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

describe('Translation API Endpoint (/api/translation)', () => {
  
  it('should translate a NAMASTE code to an ICD-11 code', async () => {
    const res = await request(app)
      .post('/api/translation')
      .send({
        code: 'AY001',
        system: 'NAMASTE'
      });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.translations).toBeInstanceOf(Array);
    expect(res.body.translations.length).toBe(1);
    expect(res.body.translations[0].code).toBe('TM2-AY134');
    expect(res.body.translations[0].system).toBe('ICD-11-TM2');
  });

  it('should translate an ICD-11 code to a NAMASTE code', async () => {
    const res = await request(app)
      .post('/api/translation')
      .send({
        code: 'TM2-AY134',
        system: 'ICD-11-TM2'
      });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.translations).toBeInstanceOf(Array);
    expect(res.body.translations.length).toBe(1);
    expect(res.body.translations[0].code).toBe('AY001');
    expect(res.body.translations[0].system).toBe('NAMASTE');
  });

  it('should return an empty array for a code with no mapping', async () => {
    const res = await request(app)
      .post('/api/translation')
      .send({
        code: 'AY002', // This code has no mapping in the sample data
        system: 'NAMASTE'
      });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.translations).toBeInstanceOf(Array);
    expect(res.body.translations.length).toBe(0);
  });

  it('should return a 400 error if "code" is missing', async () => {
    const res = await request(app)
      .post('/api/translation')
      .send({
        system: 'NAMASTE'
      });
      
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('Both "code" and "system" are required in the request body');
  });

  it('should return a 400 error if "system" is missing', async () => {
    const res = await request(app)
      .post('/api/translation')
      .send({
        code: 'AY001'
      });
      
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('Both "code" and "system" are required in the request body');
  });

  it('should return a 400 error for an invalid system', async () => {
    const res = await request(app)
      .post('/api/translation')
      .send({
        code: 'AY001',
        system: 'INVALID_SYSTEM'
      });
      
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toBe('Invalid system specified. Must be "NAMASTE" or "ICD-11-TM2"');
  });
});
