/**
 * Admin Routes
 * Defines endpoints for data management and administrative tasks
 */

const express = require('express');
const path = require('path');
const auditService = require('../services/auditService');

module.exports = (dataStore, csvParser) => {
  const router = express.Router();

  // Ingest CSV data
  router.post('/ingest-csv', async (req, res) => {
    try {
      const { csvData, filePath } = req.body;
      
      let parseResult;
      
      if (csvData) {
        // Parse from string data
        parseResult = await csvParser.parseCSVFromString(csvData);
      } else if (filePath) {
        // Parse from file path
        parseResult = await csvParser.parseCSV(filePath);
      } else {
        return res.status(400).json({
          error: 'Either csvData or filePath is required'
        });
      }

      // Store parsed terms
      const storeResult = dataStore.storeTerms(parseResult.terms);

      // Create AuditEvent
      const auditEvent = auditService.createAuditEvent(
        'C', // Create
        '0', // Success
        `Ingested ${storeResult.stored} new terms and updated ${storeResult.updated} terms from CSV`
      );
      console.log('AuditEvent:', JSON.stringify(auditEvent, null, 2));

      // Create Provenance for each new term
      parseResult.terms.forEach(term => {
        const provenance = auditService.createProvenance(
          term.id,
          'Initial ingestion from CSV'
        );
        console.log('Provenance:', JSON.stringify(provenance, null, 2));
      });
      
      res.json({
        success: parseResult.success,
        parsing: parseResult.summary,
        storage: storeResult,
        errors: parseResult.errors,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'CSV ingestion failed',
        message: error.message
      });
    }
  });

  // Load sample data
  router.post('/load-sample', async (req, res) => {
    try {
      const sampleCSVPath = path.join(__dirname, '../../data/sample-namaste.csv');
      const parseResult = await csvParser.parseCSV(sampleCSVPath);
      const storeResult = dataStore.storeTerms(parseResult.terms);
      
      res.json({
        message: 'Sample data loaded successfully',
        parsing: parseResult.summary,
        storage: storeResult,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to load sample data',
        message: error.message
      });
    }
  });

  // Get statistics
  router.get('/statistics', (req, res) => {
    try {
      const stats = dataStore.getStatistics();
      res.json({
        statistics: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve statistics',
        message: error.message
      });
    }
  });

  // Clear all data
  router.delete('/clear', (req, res) => {
    try {
      dataStore.clear();
      res.json({
        message: 'All data cleared successfully',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to clear data',
        message: error.message
      });
    }
  });

  return router;
};
