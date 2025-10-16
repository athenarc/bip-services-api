/**
 * RA-SKG Response Mapper
 * Maps database responses to RA-SKG JSON-LD format
 */


/**
 * Map single document to RA-SKG format based on entity type
 * @param {Object} doc - Document from database
 * @param {string} entityType - Type of entity: 'product' or 'agent'
 * @returns {Object} RA-SKG formatted document
 */
function mapDocumentToRaSkg(doc, entityType) {
    if (entityType === 'product') {
        return {
            "local_identifier": `https://explore.openaire.eu/search/result?id=${doc.openaire_id.substring(doc.openaire_id.indexOf('|') + 1)}`,
            "entity_type": "product",
            "product_type": doc.product_type,
            "identifiers": 
                doc.pids.split('|||').filter(id => id.trim()).map(id => {
                    return JSON.parse(id);                  
                }),
            "related_products": (doc.cites) ? {
                "cites": doc.cites
            } : undefined,
            "ra_metrics": [
                {
                    "ra_metric": {
                        "ra_measure": {
                            "class": "http://www.wikidata.org/entity/Q5122404",
                            "labels": {
                                "en": "publication citation count",
                            },
                            "defined_in": "http://www.wikidata.org/"
                        },
                        "ra_value": doc.citation_count
                    },
                    "ra_provider": "bip_database",
                    "description": "The total number of citations received by the article in consideration. Citations and article metadata required to calculate the particular indicator are gathered by OpenCitations Index and OpenCitations Meta."
                },
                {
                    "ra_metric": {
                        "ra_category": {
                            "labels": {
                                "en": `citation count class ${doc.cc_class || 'C5'}`,
                            }
                        }
                    },
                    "ra_provider": "bip_database",
                    "description": "The impact class for citation count based on percentile ranking (C1=top 0.01%, C2=top 0.1%, C3=top 1%, C4=top 10%, C5=remaining)."
                },
                {
                    "ra_metric": {
                        "ra_measure": {
                            "class": "http://www.wikidata.org/entity/Q174989",
                            "labels": {
                                "en": "article popularity score",
                            },
                            "defined_in": "http://www.wikidata.org/"
                        },
                        "ra_value": doc.popularity
                    },
                    "ra_provider": "bip_database",
                    "description": "The popularity score of the article based on attention ranking metrics."
                },
                {
                    "ra_metric": {
                        "ra_category": {
                            "labels": {
                                "en": `popularity class ${doc.pop_class || 'C5'}`,
                            }
                        }
                    },
                    "ra_provider": "bip_database",
                    "description": "The impact class for popularity score based on percentile ranking (C1=top 0.01%, C2=top 0.1%, C3=top 1%, C4=top 10%, C5=remaining)."
                },
                {
                    "ra_metric": {
                        "ra_measure": {
                            "class": "http://www.wikidata.org/entity/Q174989",
                            "labels": {
                                "en": "article influence score",
                            },
                            "defined_in": "http://www.wikidata.org/"
                        },
                        "ra_value": doc.influence
                    },
                    "ra_provider": "bip_database",
                    "description": "The influence score of the article based on PageRank algorithms."
                },
                {
                    "ra_metric": {
                        "ra_category": {
                            "labels": {
                                "en": `influence class ${doc.inf_class || 'C5'}`,
                            }
                        }
                    },
                    "ra_provider": "bip_database",
                    "description": "The impact class for influence score based on percentile ranking (C1=top 0.01%, C2=top 0.1%, C3=top 1%, C4=top 10%, C5=remaining)."
                },
                {
                    "ra_metric": {
                        "ra_measure": {
                            "class": "http://www.wikidata.org/entity/Q174989",
                            "labels": {
                                "en": "3-year citation impulse",
                            },
                            "defined_in": "http://www.wikidata.org/"
                        },
                        "ra_value": doc.impulse
                    },
                    "ra_provider": "bip_database",
                    "description": "The 3-year citation count representing the recent impact impulse of the article."
                },
                {
                    "ra_metric": {
                        "ra_category": {
                            "labels": {
                                "en": `impulse class ${doc.imp_class || 'C5'}`,
                            }
                        }
                    },
                    "ra_provider": "bip_database",
                    "description": "The impact class for 3-year citation impulse based on percentile ranking (C1=top 0.01%, C2=top 0.1%, C3=top 1%, C4=top 10%, C5=remaining)."
                }
            ]
        };
    } else if (entityType === 'agent') {
        return {
            "local_identifier": doc.orcid || doc.id || "unknown",
            "entity_type": "person",
            "name": doc.name || "Unknown Name",
            "given_name": doc.given_name || doc.first_name || "",
            "family_name": doc.family_name || doc.last_name || "",
            "identifiers": [
                {
                    "value": doc.orcid || "unknown",
                    "scheme": "orcid"
                }
            ],
            "affiliations": doc.affiliations || [],
            "research_metrics": {
                "h_index": doc.h_index || 0,
                "total_citations": doc.total_citations || 0,
                "total_publications": doc.total_publications || 0
            }
        };
    }
    
    throw new Error(`Unsupported entity type: ${entityType}. Use 'product' or 'agent'.`);
}

/**
 * Map documents to RA-SKG format
 * @param {Object|Array} docs - Single document or array of documents from database
 * @param {string} entityType - Type of entity: 'product' or 'agent'
 * @returns {Object} RA-SKG formatted response
 */
function mapToRaSkgFormat(docs, entityType) {
    // Ensure docs is always an array
    const docsArray = Array.isArray(docs) ? docs : [docs];
    
    // Map each document to RA-SKG format
    const raSkgDocs = docsArray.map(doc => mapDocumentToRaSkg(doc, entityType));
    
    return {
        "@context": [
            "https://w3id.org/skg-if/context/1.0.1/skg-if.json",
            {
                "@base": "https://w3id.org/skg-if/sandbox/bip-db/"
            }
        ],
        "@graph": raSkgDocs
    };
}

module.exports = {
    mapToRaSkgFormat,
};
