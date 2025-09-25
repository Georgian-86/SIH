/**
 * Translation Routes
 * Defines endpoints for terminology translation
 */

const express = require('express');

module.exports = (dataStore) => {
  const router = express.Router();

  // Endpoint to translate a code
  router.post('/', (req, res) => {
    try {
      const { code, system } = req.body;

      if (!code || !system) {
        return res.status(400).json({
          error: 'Both "code" and "system" are required in the request body'
        });
      }

      let results = [];

      if (system === 'NAMASTE') {
        const term = dataStore.getTermById(code);
        if (term && term.icd11_tm2_code) {
          results.push({
            code: term.icd11_tm2_code,
            system: 'ICD-11-TM2',
            display: `ICD-11 TM2 Code for ${term.term}`
          });
        }
      } else if (system === 'ICD-11-TM2') {
        const terms = dataStore.findTermsByICD11Code(code);
        results = terms.map(term => ({
          code: term.id,
          system: 'NAMASTE',
          display: term.term
        }));
      } else {
        return res.status(400).json({
          error: 'Invalid system specified. Must be "NAMASTE" or "ICD-11-TM2"'
        });
      }

      res.json({
        source: { code, system },
        translations: results,
        total: results.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      res.status(500).json({
        error: 'Translation failed',
        message: error.message
      });
    }
  });

  return router;
};
