/**
 * In-Memory Data Store for NAMASTE terminology
 * Provides fast lookup, search, and storage capabilities
 */

const NodeCache = require('node-cache');

class DataStore {
  constructor() {
    // Main storage for NAMASTE terms
    this.terms = new Map();
    
    // Search index for fast lookups
    this.searchIndex = new Map();
    
    // ICD-11 mapping cache
    this.icd11Cache = new NodeCache({ 
      stdTTL: 3600, // 1 hour TTL
      checkperiod: 600 // Check for expired keys every 10 minutes
    });
    
    // Statistics
    this.stats = {
      totalTerms: 0,
      lastUpdated: null,
      categories: new Set(),
      indexSize: 0
    };
  }

  /**
   * Store NAMASTE terms from parsed CSV
   * @param {Array} terms - Array of NamesteTerm objects
   * @returns {Object} Storage result
   */
  storeTerms(terms) {
    const results = {
      stored: 0,
      updated: 0,
      errors: []
    };

    terms.forEach(term => {
      try {
        const existingTerm = this.terms.get(term.id);
        
        if (existingTerm) {
          // Update existing term
          term.created_at = existingTerm.created_at;
          term.updated_at = new Date();
          results.updated++;
        } else {
          results.stored++;
        }

        // Store term
        this.terms.set(term.id, term);
        
        // Update search index
        this.updateSearchIndex(term);
        
        // Update statistics
        this.stats.categories.add(term.category);
        
      } catch (error) {
        results.errors.push({
          termId: term.id,
          error: error.message
        });
      }
    });

    // Update global statistics
    this.stats.totalTerms = this.terms.size;
    this.stats.lastUpdated = new Date();
    this.stats.indexSize = this.searchIndex.size;

    return results;
  }

  /**
   * Update search index for a term
   * @param {NamesteTerm} term - Term to index
   */
  updateSearchIndex(term) {
    // Index all searchable terms
    const searchableTerms = term.getSearchableTerms();
    
    searchableTerms.forEach(searchTerm => {
      const normalizedTerm = searchTerm.toLowerCase();
      
      // Create trigrams for fuzzy search
      const trigrams = this.generateTrigrams(normalizedTerm);
      
      trigrams.forEach(trigram => {
        if (!this.searchIndex.has(trigram)) {
          this.searchIndex.set(trigram, new Set());
        }
        this.searchIndex.get(trigram).add(term.id);
      });
      
      // Also index the full term
      if (!this.searchIndex.has(normalizedTerm)) {
        this.searchIndex.set(normalizedTerm, new Set());
      }
      this.searchIndex.get(normalizedTerm).add(term.id);
    });
  }

  /**
   * Generate trigrams for fuzzy search
   * @param {string} text - Text to generate trigrams from
   * @returns {Array} Array of trigrams
   */
  generateTrigrams(text) {
    const trigrams = [];
    const paddedText = `  ${text}  `; // Add padding for edge trigrams
    
    for (let i = 0; i < paddedText.length - 2; i++) {
      trigrams.push(paddedText.substring(i, i + 3));
    }
    
    return trigrams;
  }

  /**
   * Search for terms
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Array of matching terms with scores
   */
  search(query, options = {}) {
    const {
      limit = 10,
      category = null,
      includeScore = true,
      minScore = 0.1
    } = options;

    if (!query || query.trim().length === 0) {
      return [];
    }

    const normalizedQuery = query.toLowerCase().trim();
    const candidateIds = new Set();

    // Find candidate terms using trigrams
    const queryTrigrams = this.generateTrigrams(normalizedQuery);
    
    queryTrigrams.forEach(trigram => {
      if (this.searchIndex.has(trigram)) {
        this.searchIndex.get(trigram).forEach(id => candidateIds.add(id));
      }
    });

    // Also check for exact matches
    if (this.searchIndex.has(normalizedQuery)) {
      this.searchIndex.get(normalizedQuery).forEach(id => candidateIds.add(id));
    }

    if (candidateIds.size === 0) {
      return [];
    }

    // Score and filter candidates
    const results = [];
    
    candidateIds.forEach(id => {
      const term = this.terms.get(id);
      if (!term) return;

      // Apply category filter
      if (category && term.category !== category) return;

      // Calculate fuzzy score
      const score = term.getFuzzyScore(normalizedQuery);
      
      if (score >= minScore) {
        const result = includeScore ? 
          { term: term.toJSON(), score } : 
          term.toJSON();
        
        results.push(result);
      }
    });

    // Sort by score (descending) and limit results
    if (includeScore) {
      results.sort((a, b) => b.score - a.score);
    }

    return results.slice(0, limit);
  }

  /**
   * Get term by ID
   * @param {string} id - Term ID
   * @returns {NamesteTerm|null} Term object or null
   */
  getTermById(id) {
    return this.terms.get(id) || null;
  }

  /**
   * Get all terms in a category
   * @param {string} category - Category name
   * @returns {Array} Array of terms
   */
  getTermsByCategory(category) {
    const results = [];
    
    this.terms.forEach(term => {
      if (term.category === category) {
        results.push(term.toJSON());
      }
    });

    return results;
  }

  /**
   * Get terms with ICD-11 mappings
   * @returns {Array} Array of terms with ICD-11 codes
   */
  getTermsWithICD11Mappings() {
    const results = [];
    
    this.terms.forEach(term => {
      if (term.icd11_tm2_code) {
        results.push(term.toJSON());
      }
    });

    return results;
  }

  /**
   * Find terms by ICD-11 code
   * @param {string} icd11Code - ICD-11 code
   * @returns {Array} Array of matching terms
   */
  findTermsByICD11Code(icd11Code) {
    const results = [];
    
    this.terms.forEach(term => {
      if (term.icd11_tm2_code === icd11Code) {
        results.push(term.toJSON());
      }
    });

    return results;
  }

  /**
   * Get data store statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    return {
      totalTerms: this.stats.totalTerms,
      categories: Array.from(this.stats.categories),
      categoryCount: this.stats.categories.size,
      lastUpdated: this.stats.lastUpdated,
      indexSize: this.stats.indexSize,
      cacheStats: {
        keys: this.icd11Cache.keys().length,
        hits: this.icd11Cache.getStats().hits,
        misses: this.icd11Cache.getStats().misses
      }
    };
  }

  /**
   * Clear all data
   */
  clear() {
    this.terms.clear();
    this.searchIndex.clear();
    this.icd11Cache.flushAll();
    this.stats = {
      totalTerms: 0,
      lastUpdated: null,
      categories: new Set(),
      indexSize: 0
    };
  }

  /**
   * Export data for backup
   * @returns {Object} Exported data
   */
  exportData() {
    const termsArray = Array.from(this.terms.values()).map(term => term.toJSON());
    
    return {
      terms: termsArray,
      statistics: this.getStatistics(),
      exportedAt: new Date()
    };
  }

  /**
   * Import data from backup
   * @param {Object} data - Imported data
   * @returns {Object} Import result
   */
  importData(data) {
    try {
      this.clear();
      
      if (data.terms && Array.isArray(data.terms)) {
        const NamesteTerm = require('../models/NamesteTerm');
        const terms = data.terms.map(termData => new NamesteTerm(termData));
        const result = this.storeTerms(terms);
        
        return {
          success: true,
          imported: result.stored + result.updated,
          errors: result.errors
        };
      }
      
      throw new Error('Invalid data format');
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cache ICD-11 data
   * @param {string} key - Cache key
   * @param {Object} data - Data to cache
   * @param {number} ttl - Time to live in seconds
   */
  cacheICD11Data(key, data, ttl = 3600) {
    this.icd11Cache.set(key, data, ttl);
  }

  /**
   * Get cached ICD-11 data
   * @param {string} key - Cache key
   * @returns {Object|null} Cached data or null
   */
  getCachedICD11Data(key) {
    return this.icd11Cache.get(key) || null;
  }
}

module.exports = DataStore;
