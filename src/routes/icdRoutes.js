/**
 * ICD-11 Routes
 * Defines endpoints for interacting with the WHO ICD-11 API
 */

const express = require('express');

module.exports = (icdService) => {
  const router = express.Router();

  // Endpoint to search the ICD-11 API
  router.get('/search', async (req, res) => {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          error: 'Query parameter "q" is required'
        });
      }

      const results = await icdService.search(q);
      res.json(results);

    } catch (error) {
      res.status(500).json({
        error: 'ICD-11 API search failed',
        message: error.message
      });
    }
  });

  return router;
};
