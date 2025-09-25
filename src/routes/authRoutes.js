/**
 * Auth Routes
 * Defines endpoints for mock ABHA-like OAuth simulation
 */

const express = require('express');
const jwt = require('jsonwebtoken');

module.exports = () => {
  const router = express.Router();

  // Mock ABHA OAuth endpoint
  router.post('/token', (req, res) => {
    try {
      const { abhaId } = req.body;

      if (!abhaId) {
        return res.status(400).json({
          error: 'Mock ABHA ID ("abhaId") is required'
        });
      }

      // In a real scenario, you would validate the ABHA ID
      // and get consent from the user.
      // Here, we'll just generate a mock JWT.

      const userPayload = {
        sub: abhaId,
        name: `Patient ${abhaId}`,
        iss: 'AyushFHIRMicroservice',
        aud: 'AyushFHIRClient'
      };

      const token = jwt.sign(
        userPayload,
        process.env.JWT_SECRET || 'your-super-secret-key',
        { expiresIn: '1h' }
      );

      res.json({
        access_token: token,
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'patient/*.read patient/*.write'
      });

    } catch (error) {
      res.status(500).json({
        error: 'Mock token generation failed',
        message: error.message
      });
    }
  });

  return router;
};
