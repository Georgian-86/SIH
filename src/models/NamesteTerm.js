/**
 * NAMASTE Term Model
 * Represents a traditional Indian medicine term from the NAMASTE terminology
 */

class NamesteTerm {
  constructor(data) {
    this.id = data.id || data.term_id;
    this.term = data.term || data.term_label;
    this.category = data.category;
    this.synonyms = this.parseSynonyms(data.synonyms);
    this.icd11_tm2_code = data.icd11_tm2_code;
    this.references = data.references || '';
    this.description = data.description || '';
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  /**
   * Parse synonyms from CSV string format
   * @param {string} synonymsStr - Comma-separated synonyms
   * @returns {Array} Array of synonym strings
   */
  parseSynonyms(synonymsStr) {
    if (!synonymsStr) return [];
    return synonymsStr.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  /**
   * Get all searchable terms (main term + synonyms)
   * @returns {Array} Array of all searchable terms
   */
  getSearchableTerms() {
    return [this.term, ...this.synonyms];
  }

  /**
   * Check if term matches search query
   * @param {string} query - Search query
   * @returns {boolean} True if matches
   */
  matches(query) {
    const lowerQuery = query.toLowerCase();
    return this.getSearchableTerms().some(term => 
      term.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get fuzzy match score for ranking
   * @param {string} query - Search query
   * @returns {number} Match score (higher is better)
   */
  getFuzzyScore(query) {
    const lowerQuery = query.toLowerCase();
    let score = 0;

    // Exact match gets highest score
    if (this.term.toLowerCase() === lowerQuery) {
      score += 100;
    }

    // Starts with query gets high score
    if (this.term.toLowerCase().startsWith(lowerQuery)) {
      score += 50;
    }

    // Contains query gets medium score
    if (this.term.toLowerCase().includes(lowerQuery)) {
      score += 25;
    }

    // Check synonyms
    this.synonyms.forEach(synonym => {
      const lowerSynonym = synonym.toLowerCase();
      if (lowerSynonym === lowerQuery) {
        score += 80;
      } else if (lowerSynonym.startsWith(lowerQuery)) {
        score += 40;
      } else if (lowerSynonym.includes(lowerQuery)) {
        score += 20;
      }
    });

    return score;
  }

  /**
   * Validate term data
   * @returns {Object} Validation result
   */
  validate() {
    const errors = [];

    if (!this.id) {
      errors.push('Term ID is required');
    }

    if (!this.term) {
      errors.push('Term name is required');
    }

    if (!this.category) {
      errors.push('Category is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to JSON representation
   * @returns {Object} JSON object
   */
  toJSON() {
    return {
      id: this.id,
      term: this.term,
      category: this.category,
      synonyms: this.synonyms,
      icd11_tm2_code: this.icd11_tm2_code,
      references: this.references,
      description: this.description,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = NamesteTerm;
