/**
 * FHIR Routes
 * Defines endpoints for FHIR resource generation
 */

const express = require('express');

module.exports = (fhirService) => {
  const router = express.Router();

  // Endpoint to get the NAMASTE CodeSystem
  router.get('/CodeSystem/namaste', (req, res) => {
    try {
      const codeSystem = fhirService.generateCodeSystem();
      res.json(codeSystem);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to generate CodeSystem',
        message: error.message
      });
    }
  });

  // Endpoint to get the NAMASTE to ICD-11 ConceptMap
  router.get('/ConceptMap/namaste-to-icd11', (req, res) => {
    try {
      const conceptMap = fhirService.generateConceptMap();
      res.json(conceptMap);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to generate ConceptMap',
        message: error.message
      });
    }
  });

  return router;
};
