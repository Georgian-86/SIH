/**
 * CSV Parser Service for NAMASTE terminology data
 * Handles parsing, validation, and ingestion of NAMASTE CSV files
 */

const fs = require('fs');
const csv = require('csv-parser');
const NamesteTerm = require('../models/NamesteTerm');

class CSVParser {
  constructor() {
    this.requiredColumns = ['id', 'term', 'category'];
    this.optionalColumns = ['synonyms', 'icd11_tm2_code', 'references', 'description'];
    this.allColumns = [...this.requiredColumns, ...this.optionalColumns];
  }

  /**
   * Parse NAMASTE CSV file
   * @param {string} filePath - Path to CSV file
   * @returns {Promise<Object>} Parse result with terms and errors
   */
  async parseCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];
      let lineNumber = 1; // Start from 1 (header is line 1)

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return reject(new Error(`CSV file not found: ${filePath}`));
      }

      const stream = fs.createReadStream(filePath)
        .pipe(csv({
          skipEmptyLines: true,
          skipLinesWithError: false
        }));

      stream.on('headers', (headers) => {
        // Validate headers
        const headerValidation = this.validateHeaders(headers);
        if (!headerValidation.isValid) {
          errors.push({
            line: 1,
            type: 'HEADER_ERROR',
            message: headerValidation.message,
            data: headers
          });
        }
      });

      stream.on('data', (data) => {
        lineNumber++;
        
        try {
          // Create NAMASTE term from CSV row
          const term = new NamesteTerm(data);
          
          // Validate term
          const validation = term.validate();
          if (!validation.isValid) {
            errors.push({
              line: lineNumber,
              type: 'VALIDATION_ERROR',
              message: validation.errors.join(', '),
              data: data
            });
          } else {
            results.push(term);
          }
        } catch (error) {
          errors.push({
            line: lineNumber,
            type: 'PARSE_ERROR',
            message: error.message,
            data: data
          });
        }
      });

      stream.on('end', () => {
        // Check for duplicate IDs
        const duplicateErrors = this.checkDuplicateIds(results);
        errors.push(...duplicateErrors);

        resolve({
          success: errors.length === 0,
          totalRows: lineNumber - 1, // Exclude header
          validTerms: results.length,
          terms: results,
          errors: errors,
          summary: {
            parsed: results.length,
            failed: errors.filter(e => e.type !== 'HEADER_ERROR').length,
            duplicates: duplicateErrors.length
          }
        });
      });

      stream.on('error', (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      });
    });
  }

  /**
   * Validate CSV headers
   * @param {Array} headers - CSV headers
   * @returns {Object} Validation result
   */
  validateHeaders(headers) {
    const missingRequired = this.requiredColumns.filter(col => 
      !headers.some(header => header.toLowerCase() === col.toLowerCase())
    );

    if (missingRequired.length > 0) {
      return {
        isValid: false,
        message: `Missing required columns: ${missingRequired.join(', ')}`
      };
    }

    return { isValid: true };
  }

  /**
   * Check for duplicate term IDs
   * @param {Array} terms - Array of NamesteTerm objects
   * @returns {Array} Array of duplicate errors
   */
  checkDuplicateIds(terms) {
    const idCounts = {};
    const duplicateErrors = [];

    terms.forEach((term, index) => {
      if (idCounts[term.id]) {
        duplicateErrors.push({
          line: index + 2, // +2 because index starts at 0 and we skip header
          type: 'DUPLICATE_ID',
          message: `Duplicate term ID: ${term.id}`,
          data: { id: term.id }
        });
      } else {
        idCounts[term.id] = 1;
      }
    });

    return duplicateErrors;
  }

  /**
   * Parse CSV from string content
   * @param {string} csvContent - CSV content as string
   * @returns {Promise<Object>} Parse result
   */
  async parseCSVFromString(csvContent) {
    return new Promise((resolve, reject) => {
      const results = [];
      const errors = [];
      let lineNumber = 1;

      const lines = csvContent.split('\n');
      if (lines.length === 0) {
        return reject(new Error('Empty CSV content'));
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const headerValidation = this.validateHeaders(headers);
      
      if (!headerValidation.isValid) {
        errors.push({
          line: 1,
          type: 'HEADER_ERROR',
          message: headerValidation.message,
          data: headers
        });
      }

      // Parse data rows
      for (let i = 1; i < lines.length; i++) {
        lineNumber++;
        const line = lines[i].trim();
        
        if (!line) continue; // Skip empty lines

        try {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const data = {};
          
          headers.forEach((header, index) => {
            data[header] = values[index] || '';
          });

          const term = new NamesteTerm(data);
          const validation = term.validate();
          
          if (!validation.isValid) {
            errors.push({
              line: lineNumber,
              type: 'VALIDATION_ERROR',
              message: validation.errors.join(', '),
              data: data
            });
          } else {
            results.push(term);
          }
        } catch (error) {
          errors.push({
            line: lineNumber,
            type: 'PARSE_ERROR',
            message: error.message,
            data: line
          });
        }
      }

      // Check for duplicates
      const duplicateErrors = this.checkDuplicateIds(results);
      errors.push(...duplicateErrors);

      resolve({
        success: errors.length === 0,
        totalRows: lineNumber - 1,
        validTerms: results.length,
        terms: results,
        errors: errors,
        summary: {
          parsed: results.length,
          failed: errors.filter(e => e.type !== 'HEADER_ERROR').length,
          duplicates: duplicateErrors.length
        }
      });
    });
  }

  /**
   * Generate sample CSV content for testing
   * @returns {string} Sample CSV content
   */
  generateSampleCSV() {
    const sampleData = [
      {
        id: 'AY001',
        term: 'Amlapitta',
        category: 'Ayurvedic Disease',
        synonyms: 'Dyspepsia,Sour indigestion',
        icd11_tm2_code: 'TM2-AY134',
        references: 'Charaka Samhita',
        description: 'Acid dyspepsia characterized by sour belching and heartburn'
      },
      {
        id: 'AY002',
        term: 'Vata Dosha Imbalance',
        category: 'Ayurvedic Constitutional Disorder',
        synonyms: 'Wind disorder,Nervous system imbalance',
        icd11_tm2_code: 'TM2-AY201',
        references: 'Sushruta Samhita',
        description: 'Imbalance of Vata dosha affecting movement and nervous functions'
      },
      {
        id: 'UN001',
        term: 'Mizaj-e-Har',
        category: 'Unani Temperament',
        synonyms: 'Hot temperament,Warm constitution',
        icd11_tm2_code: 'TM2-UN045',
        references: 'Canon of Medicine',
        description: 'Hot temperament in Unani medicine system'
      }
    ];

    const headers = ['id', 'term', 'category', 'synonyms', 'icd11_tm2_code', 'references', 'description'];
    let csv = headers.join(',') + '\n';
    
    sampleData.forEach(row => {
      const values = headers.map(header => `"${row[header] || ''}"`);
      csv += values.join(',') + '\n';
    });

    return csv;
  }
}

module.exports = CSVParser;
