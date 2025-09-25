/**
 * Ayush FHIR Microservice Server
 * Main server file for the Ayush Interoperability & FHIR Micro-service
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

// Import services
const CSVParser = require('./services/csvParser');
const DataStore = require('./services/dataStore');
const FHIRService = require('./services/fhirService');
const ICDService = require('./services/icdService');

// Import routes
const fhirRoutes = require('./routes/fhirRoutes');
const translationRoutes = require('./routes/translationRoutes');
const icdRoutes = require('./routes/icdRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

class AyushFHIRServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    
    // Initialize services
    this.csvParser = new CSVParser();
    this.dataStore = new DataStore();
    this.fhirService = new FHIRService(this.dataStore);
    this.icdService = new ICDService(this.dataStore);
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    // Static files
    this.app.use('/static', express.static(path.join(__dirname, '../public')));

    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://your-domain.com'] 
        : ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup API routes
   */
  setupRoutes() {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
          dataStore: this.dataStore.getStatistics(),
          environment: process.env.NODE_ENV || 'development'
        }
      });
    });

    // Serve static HTML files for the root and specific paths
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });
    this.app.get('/search', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/search.html'));
    });
    this.app.get('/ingest', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/ingest.html'));
    });
    this.app.get('/fhir', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/fhir.html'));
    });

    // Basic terminology endpoints (Day 1 MVP)
    this.setupBasicTerminologyRoutes();

    // Translation endpoints
    this.app.use('/api/terminology', translationRoutes(this.dataStore)); // Changed to /api/terminology

    // ICD-11 endpoints
    this.app.use('/api/icd', icdRoutes(this.icdService));

    // Auth endpoints
    this.app.use('/auth', authRoutes());

    // FHIR endpoints
    this.app.use('/api/fhir', fhirRoutes(this.fhirService)); // Changed to /api/fhir

    // Admin endpoints
    this.app.use('/admin', adminRoutes(this.dataStore, this.csvParser));

    // API documentation
    this.app.get('/docs', (req, res) => {
      res.json({
        title: 'Ayush FHIR Microservice API Documentation',
        version: '1.0.0',
        endpoints: [
          {
            path: '/health',
            method: 'GET',
            description: 'Health check endpoint'
          },
          {
            path: '/api/terminology/search',
            method: 'GET',
            description: 'Search NAMASTE terminology',
            parameters: ['q (query)', 'limit', 'category']
          },
          {
            path: '/api/terminology/term/:id',
            method: 'GET',
            description: 'Get term by ID'
          },
          {
            path: '/admin/ingest-csv',
            method: 'POST',
            description: 'Ingest NAMASTE CSV data'
          },
          {
            path: '/admin/statistics',
            method: 'GET',
            description: 'Get data store statistics'
          }
        ]
      });
    });
  }

  /**
   * Setup basic terminology routes for Day 1
   */
  setupBasicTerminologyRoutes() {
    const router = express.Router();

    // Search terminology
    router.get('/search', (req, res) => {
      try {
        const { q, limit = 10, category, minScore = 0.1 } = req.query;
        
        if (!q) {
          return res.status(400).json({
            error: 'Query parameter "q" is required'
          });
        }

        const results = this.dataStore.search(q, {
          limit: parseInt(limit),
          category,
          minScore: parseFloat(minScore)
        });

        res.json({
          query: q,
          results: results,
          total: results.length,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          error: 'Search failed',
          message: error.message
        });
      }
    });

    // Get term by ID
    router.get('/term/:id', (req, res) => {
      try {
        const { id } = req.params;
        const term = this.dataStore.getTermById(id);
        
        if (!term) {
          return res.status(404).json({
            error: 'Term not found',
            id: id
          });
        }

        res.json({
          term: term.toJSON(),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to retrieve term',
          message: error.message
        });
      }
    });

    // Get terms by category
    router.get('/category/:category', (req, res) => {
      try {
        const { category } = req.params;
        const terms = this.dataStore.getTermsByCategory(category);
        
        res.json({
          category: category,
          terms: terms,
          total: terms.length,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to retrieve terms by category',
          message: error.message
        });
      }
    });

    // Get terms with ICD-11 mappings
    router.get('/mapped', (req, res) => {
      try {
        const terms = this.dataStore.getTermsWithICD11Mappings();
        
        res.json({
          terms: terms,
          total: terms.length,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(500).json({
          error: 'Failed to retrieve mapped terms',
          message: error.message
        });
      }
    });

    this.app.use('/api/terminology', router);
  }

  /**
   * Setup error handling middleware
   */
  setupErrorHandling() {


    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
      });
    });

    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error('Global error handler:', error);
      
      res.status(error.status || 500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Start the server
   */
  async start() {
    try {
      // Load sample data on startup
      console.log('Loading sample NAMASTE data...');
      const sampleCSVPath = path.join(__dirname, '../data/sample-namaste.csv');
      const parseResult = await this.csvParser.parseCSV(sampleCSVPath);
      const storeResult = this.dataStore.storeTerms(parseResult.terms);
      
      console.log(`Loaded ${storeResult.stored} terms from sample data`);
      
      // Start server
      this.app.listen(this.port, () => {
        console.log(`🚀 Ayush FHIR Microservice running on port ${this.port}`);
        console.log(`📊 Health check: http://localhost:${this.port}/health`);
        console.log(`📚 API docs: http://localhost:${this.port}/docs`);
        console.log(`🔍 Search example: http://localhost:${this.port}/api/terminology/search?q=fever`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

// Start server if this file is run directly
if (require.main === module) {
  const server = new AyushFHIRServer();
  server.start();
}

module.exports = AyushFHIRServer;
