/**
 * WHO ICD-11 API Service
 * Handles integration with the WHO ICD-11 API, including OAuth 2.0 and search
 */

const axios = require('axios');

class ICDService {
  constructor(dataStore) {
    this.dataStore = dataStore;
    this.token = null;
    this.tokenExpiry = null;

    // WHO ICD-11 API Configuration
    this.tokenUrl = process.env.ICD11_TOKEN_URL || 'https://icd.who.int/auth/connect/token';
    this.apiUrl = process.env.ICD11_API_URL || 'https://id.who.int/icd/entity';
    this.clientId = process.env.ICD11_CLIENT_ID;
    this.clientSecret = process.env.ICD11_CLIENT_SECRET;
  }

  /**
   * Get OAuth 2.0 Access Token
   * @returns {string} Access token
   */
  async getAccessToken() {
    // If token is still valid, return it
    if (this.token && this.tokenExpiry > new Date()) {
      return this.token;
    }

    try {
      const response = await axios.post(
        this.tokenUrl,
        new URLSearchParams({
          'grant_type': 'client_credentials',
          'client_id': this.clientId,
          'client_secret': this.clientSecret,
          'scope': 'icdapi_access'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.token = response.data.access_token;
      // Set expiry to 5 minutes before the actual expiry time
      this.tokenExpiry = new Date(new Date().getTime() + (response.data.expires_in - 300) * 1000);
      
      return this.token;
    } catch (error) {
      console.error('Failed to get ICD-11 API access token:', error.response ? error.response.data : error.message);
      throw new Error('Could not authenticate with WHO ICD-11 API');
    }
  }

  /**
   * Search ICD-11 API
   * @param {string} query - Search query
   * @returns {Object} Search results from the API
   */
  async search(query) {
    // Check cache first
    const cachedResult = this.dataStore.getCachedICD11Data(`search:${query}`);
    if (cachedResult) {
      return cachedResult;
    }

    try {
      const accessToken = await this.getAccessToken();
      
      const response = await axios.get(`${this.apiUrl}/search`, {
        params: {
          q: query
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
          'Accept-Language': 'en',
          'API-Version': 'v2'
        }
      });

      // Cache the result for 1 hour
      this.dataStore.cacheICD11Data(`search:${query}`, response.data, 3600);

      return response.data;
    } catch (error) {
      console.error('Failed to search ICD-11 API:', error.response ? error.response.data : error.message);
      throw new Error('Failed to search WHO ICD-11 API');
    }
  }
}

module.exports = ICDService;
