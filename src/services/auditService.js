/**
 * Audit Service
 * Handles the creation of FHIR AuditEvent and Provenance resources
 */

class AuditService {
  /**
   * Create a FHIR AuditEvent resource
   * @param {string} action - The action that was performed (e.g., 'C' for Create)
   * @param {string} outcome - The outcome of the event (e.g., '0' for success)
   * @param {string} description - A description of the event
   * @returns {Object} FHIR AuditEvent resource
   */
  createAuditEvent(action, outcome, description) {
    return {
      resourceType: 'AuditEvent',
      type: {
        system: 'http://dicom.nema.org/resources/ontology/DCM',
        code: '110100',
        display: 'Application Activity'
      },
      action: action,
      recorded: new Date().toISOString(),
      outcome: outcome,
      outcomeDesc: description,
      agent: [
        {
          who: {
            identifier: {
              value: 'AyushFHIRMicroservice'
            }
          },
          requestor: false
        }
      ],
      source: {
        observer: {
          identifier: {
            value: 'AyushFHIRMicroservice'
          }
        }
      }
    };
  }

  /**
   * Create a FHIR Provenance resource
   * @param {string} targetId - The ID of the resource that was created/updated
   * @param {string} reason - The reason for the event
   * @returns {Object} FHIR Provenance resource
   */
  createProvenance(targetId, reason) {
    return {
      resourceType: 'Provenance',
      target: [
        {
          reference: `CodeSystem/namaste/${targetId}`
        }
      ],
      recorded: new Date().toISOString(),
      reason: [
        {
          text: reason
        }
      ],
      agent: [
        {
          who: {
            identifier: {
              value: 'AyushFHIRMicroservice'
            }
          }
        }
      ]
    };
  }
}

module.exports = new AuditService();
