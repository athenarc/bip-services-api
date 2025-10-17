/**
 * RA-SKG Response Mapper
 * Maps database responses to RA-SKG JSON-LD format
 */

const { INDICATOR_MAPPING, getIndicatorConfig, getAllIndicatorNames } = require('../config/indicatorMapping');

/**
 * Get indicator names that match the requested class URIs or labels
 * @param {string} measureClass - The ra_measure class URI to filter by
 * @param {string} categoryClass - The ra_category class URI to filter by
 * @param {string} measureLabels - The ra_measure labels to filter by (partial match)
 * @param {string} categoryLabels - The ra_category labels to filter by (partial match)
 * @returns {Array} Array of indicator names to include
 */
function getFilteredIndicators(measureClass, categoryClass, measureLabels, categoryLabels) {
    const indicators = [];
    
    // If no filters specified, return all indicators
    if (!measureClass && !categoryClass && !measureLabels && !categoryLabels) {
        return getAllIndicatorNames();
    }
    
    // Find indicators matching the requested classes or labels
    Object.entries(INDICATOR_MAPPING).forEach(([name, config]) => {
        let matches = false;
        
        // Check class filters
        if ((measureClass && config.type === 'measure' && config.class === measureClass) ||
            (categoryClass && config.type === 'category' && config.class === categoryClass)) {
            matches = true;
        }
        
        // Check label filters
        if (!matches) {
            if (measureLabels && config.type === 'measure') {
                const labels = getMeasureLabels(name);
                const labelText = Object.values(labels).join(' ').toLowerCase();
                if (labelText.includes(measureLabels.toLowerCase())) {
                    matches = true;
                }
            }
            
            if (categoryLabels && config.type === 'category') {
                const labelText = getCategoryLabel(name, 'C1').toLowerCase(); // Use sample value for label matching
                if (labelText.includes(categoryLabels.toLowerCase())) {
                    matches = true;
                }
            }
        }
        
        if (matches) {
            indicators.push(name);
        }
    });
    
    return indicators;
}

/**
 * Build ra_metrics array based on filtered indicators
 * @param {Object} doc - Document from database
 * @param {Array} indicators - Array of indicator names to include
 * @returns {Array} Array of ra_metric objects
 */
function buildRaMetrics(doc, indicators) {
    const metrics = [];
    
    indicators.forEach(indicatorName => {
        const config = getIndicatorConfig(indicatorName);
        if (!config) return;
        
        const metric = {
            "ra_provider": "bip_db"
        };
        
        if (config.type === 'measure') {
            metric.ra_metric = {
                "ra_measure": {
                    "class": config.class,
                    "labels": getMeasureLabels(indicatorName),
                    "defined_in": getDefinedIn(indicatorName)
                },
                "ra_value": doc[config.field]
            };
            metric.description = getMeasureDescription(indicatorName);
        } else if (config.type === 'category') {
            metric.ra_metric = {
                "ra_category": {
                    "class": config.class,
                    "labels": {
                        "en": getCategoryLabel(indicatorName, doc[config.field])
                    },
                    "defined_in": "https://bip.athenarc.gr"
                }
            };
            metric.description = getCategoryDescription(indicatorName);
        }
        
        metrics.push(metric);
    });
    
    return metrics;
}

/**
 * Get labels for measure indicators
 */
function getMeasureLabels(indicatorName) {
    const labels = {
        'citation_count': { "en": "citation count" },
        'popularity': { "en": "Popularity of the research product." },
        'influence': { "en": "Influence of the research product." },
        'impulse': { "en": "Impulse of the research product." }
    };
    return labels[indicatorName] || { "en": indicatorName };
}

/**
 * Get defined_in for measure indicators
 */
function getDefinedIn(indicatorName) {
    const definedIn = {
        'citation_count': "http://www.wikidata.org/",
        'popularity': "https://bip.imsi.athenarc.gr",
        'influence': "https://bip.imsi.athenarc.gr", 
        'impulse': "https://bip.imsi.athenarc.gr"
    };
    return definedIn[indicatorName] || "https://bip.athenarc.gr";
}

/**
 * Get category label
 */
function getCategoryLabel(indicatorName, value) {
    const labels = {
        'citation_count_class': `citation count class ${value}`,
        'popularity_class': `popularity class ${value}`,
        'influence_class': `influence class ${value}`,
        'impulse_class': `impulse class ${value}`
    };
    return labels[indicatorName] || `${indicatorName} ${value}`;
}

/**
 * Get descriptions for indicators
 */
function getMeasureDescription(indicatorName) {
    const descriptions = {
        'citation_count': "The total number of citations received by the article in consideration.",
        'popularity': "This indicator reflects the \"current\" impact/attention (the \"hype\") of an article in the research community at large, based on the underlying citation network.",
        'influence': "This indicator reflects the overall/total impact of an article in the research community at large, based on the underlying citation network (diachronically).",
        'impulse': "This indicator reflects the initial momentum of an article directly after its publication, based on the underlying citation network."
    };
    return descriptions[indicatorName] || "Research metric indicator.";
}

function getCategoryDescription(indicatorName) {
    const descriptions = {
        'citation_count_class': "The impact class for citation count based on percentile ranking (C1=top 0.01%, C2=top 0.1%, C3=top 1%, C4=top 10%, C5=remaining).",
        'popularity_class': "The impact class for popularity score based on percentile ranking (C1=top 0.01%, C2=top 0.1%, C3=top 1%, C4=top 10%, C5=remaining).",
        'influence_class': "The impact class for influence score based on percentile ranking (C1=top 0.01%, C2=top 0.1%, C3=top 1%, C4=top 10%, C5=remaining).",
        'impulse_class': "The impact class for 3-year citation impulse based on percentile ranking (C1=top 0.01%, C2=top 0.1%, C3=top 1%, C4=top 10%, C5=remaining)."
    };
    return descriptions[indicatorName] || "Research metric category indicator.";
}


/**
 * Map single document to RA-SKG format based on entity type
 * @param {Object} doc - Document from database
 * @param {string} entityType - Type of entity: 'product' or 'agent'
 * @param {Object} filters - Optional filters for indicators
 * @returns {Object} RA-SKG formatted document
 */
function mapDocumentToRaSkg(doc, entityType, filters = {}) {
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
            "ra_metrics": (() => {
                // Get filtered indicators based on query parameters
                const measureClass = filters['ra_metrics.ra_metric.ra_measure.class'];
                const categoryClass = filters['ra_metrics.ra_metric.ra_category.class'];
                const measureLabels = filters['ra_metrics.ra_metric.ra_measure.labels'];
                const categoryLabels = filters['ra_metrics.ra_metric.ra_category.labels'];
                const indicators = getFilteredIndicators(measureClass, categoryClass, measureLabels, categoryLabels);
                
                // Build ra_metrics array dynamically
                return buildRaMetrics(doc, indicators);
            })()
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
 * @param {Object} filters - Optional filters for indicators
 * @returns {Object} RA-SKG formatted response
 */
function mapToRaSkgFormat(docs, entityType, filters = {}) {
    // Ensure docs is always an array
    const docsArray = Array.isArray(docs) ? docs : [docs];
    
    // Map each document to RA-SKG format
    const raSkgDocs = docsArray.map(doc => mapDocumentToRaSkg(doc, entityType, filters));
    
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
