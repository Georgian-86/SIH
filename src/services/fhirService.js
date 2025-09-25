/**
 * FHIR Service
 * Handles the generation of FHIR resources (CodeSystem, ConceptMap)
 */

class FHIRService {
  constructor(dataStore) {
    this.dataStore = dataStore;
  }

  /**
   * Generate FHIR CodeSystem resource for NAMASTE
   * @returns {Object} FHIR CodeSystem resource
   */
  generateCodeSystem() {
    const codeSystem = {
      resourceType: 'CodeSystem',
      id: 'namaste',
      url: 'http://example.com/CodeSystem/namaste',
      version: '1.0.0',
      name: 'NAMASTE',
      status: 'active',
      date: new Date().toISOString(),
      publisher: 'Ayush FHIR Microservice',
      contact: [
        {
          name: 'Project Team',
          telecom: [
            {
              system: 'url',
              value: 'https://github.com/your-repo/ayush-fhir-microservice'
            }
          ]
        }
      ],
      description: 'National Ayurveda, Siddha, and Unani Standardised Terminology for India (NAMASTE)',
      caseSensitive: false,
      content: 'complete',
      concept: []
    };

    this.dataStore.terms.forEach(term => {
      const concept = {
        code: term.id,
        display: term.term,
        definition: term.description,
        designation: term.synonyms.map(synonym => ({
          language: 'en',
          use: {
            system: 'http://snomed.info/sct',
            code: '900000000000013009',
            display: 'Synonym'
          },
          value: synonym
        }))
      };
      codeSystem.concept.push(concept);
    });

    return codeSystem;
  }

  /**
   * Generate FHIR ConceptMap resource for NAMASTE to ICD-11 TM2 mapping
   * @returns {Object} FHIR ConceptMap resource
   */
  generateConceptMap() {
    const conceptMap = {
      resourceType: 'ConceptMap',
      id: 'namaste-to-icd11',
      url: 'http://example.com/ConceptMap/namaste-to-icd11',
      version: '1.0.0',
      name: 'NAMASTE to ICD-11 TM2 Mapping',
      status: 'active',
      date: new Date().toISOString(),
      publisher: 'Ayush FHIR Microservice',
      sourceUri: 'http://example.com/CodeSystem/namaste',
      targetUri: 'http://id.who.int/icd11/mms',
      group: [
        {
          source: 'http://example.com/CodeSystem/namaste',
          target: 'http://id.who.int/icd11/mms',
          element: []
        }
      ]
    };

    this.dataStore.terms.forEach(term => {
      if (term.icd11_tm2_code) {
        const element = {
          code: term.id,
          display: term.term,
          target: [
            {
              code: term.icd11_tm2_code,
              display: `ICD-11 TM2 Code for ${term.term}`,
              equivalence: 'equivalent'
            }
          ]
        };
        conceptMap.group[0].element.push(element);
      }
    });

    return conceptMap;
  }
}

module.exports = FHIRService;
