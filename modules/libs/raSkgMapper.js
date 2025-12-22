/**
 * RA-SKG Response Mapper
 * Maps database responses to RA-SKG JSON-LD format
 */

const { INDICATOR_MAPPING, getIndicatorConfig, getAllIndicatorNames, getIndicatorsByEntityType } = require('../config/indicatorMapping');

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
 * Helper to convert scientific notation object to number
 * @param {Object|number} value - Value that may be in scientific notation format
 * @returns {number} Converted number
 */
function convertScientificNotation(value) {
    if (typeof value === 'object' && value !== null && value.number && value.exponent) {
        return parseFloat(value.number + value.exponent);
    }
    return value;
}

/**
 * Get field value from document, handling nested paths and scientific notation
 * @param {Object} doc - Document
 * @param {string} field - Field name (supports dot notation for nested fields like 'work_types_num.papers')
 * @returns {*} Field value (converted if scientific notation)
 */
function getFieldValue(doc, field) {
    let value;
    
    // Handle dot notation for nested fields
    if (field.includes('.')) {
        const parts = field.split('.');
        value = doc;
        for (const part of parts) {
            if (value && typeof value === 'object') {
                value = value[part];
            } else {
                return undefined;
            }
        }
    } else {
        value = doc[field];
    }
    
    // Convert scientific notation for popularity and influence fields (when they are objects)
    if (field === 'popularity' || field === 'influence') {
        return convertScientificNotation(value);
    }
    return value;
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
        
        const fieldValue = getFieldValue(doc, config.field);
        
        // Skip if value is undefined
        if (fieldValue === undefined) return;
        
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
                "ra_value": fieldValue
            };
            metric.description = getMeasureDescription(indicatorName);
        } else if (config.type === 'category') {
            metric.ra_metric = {
                "ra_category": {
                    "class": config.class,
                    "labels": {
                        "en": getCategoryLabel(indicatorName, fieldValue)
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
        // Product indicators
        'citation_count': { "en": "citation count" },
        'popularity': { "en": "Popularity of the research product." },
        'influence': { "en": "Influence of the research product." },
        'impulse': { "en": "Impulse of the research product." },
        // Person indicators - Productivity
        'publications_count': { "en": "Number of publications" },
        'datasets_count': { "en": "Number of datasets" },
        'software_count': { "en": "Number of software" },
        'other_works_count': { "en": "Number of other works" },
        // Person indicators - Impact
        'citations_num': { "en": "Citation count" },
        'h_index': { "en": "h-index" },
        'i10_index': { "en": "i10-index" },
        'popular_works_count': { "en": "Popular works" },
        'influential_works_count': { "en": "Influential works" },
        'aggregated_popularity': { "en": "Aggregated popularity" },
        'aggregated_influence': { "en": "Aggregated influence" },
        'aggregated_impulse': { "en": "Aggregated impulse" },
        // Person indicators - Open Science
        'open_access_share': { "en": "Open Access Share" },
        'open_access_works': { "en": "Open Access Works" },
        'open_access_influential_works': { "en": "Open Access Influential Works" },
        'open_access_popular_works': { "en": "Open Access Popular Works" },
        // Person indicators - Career Stage
        'academic_age': { "en": "Academic Age" },
        'fair_academic_age': { "en": "Fair Academic Age" }
    };
    return labels[indicatorName] || { "en": indicatorName };
}

/**
 * Get defined_in for measure indicators
 */
function getDefinedIn(indicatorName) {
    const definedIn = {
        // Product indicators
        'citation_count': "http://www.wikidata.org/",
        'popularity': "https://bip.imsi.athenarc.gr",
        'influence': "https://bip.imsi.athenarc.gr", 
        'impulse': "https://bip.imsi.athenarc.gr",
        // Person indicators - Productivity
        'publications_count': "https://bip.athenarc.gr",
        'datasets_count': "https://bip.athenarc.gr",
        'software_count': "https://bip.athenarc.gr",
        'other_works_count': "https://bip.athenarc.gr",
        // Person indicators - Impact
        'citations_num': "https://bip.athenarc.gr",
        'h_index': "https://bip.athenarc.gr",
        'i10_index': "https://bip.athenarc.gr",
        'popular_works_count': "https://bip.athenarc.gr",
        'influential_works_count': "https://bip.athenarc.gr",
        'aggregated_popularity': "https://bip.imsi.athenarc.gr",
        'aggregated_influence': "https://bip.imsi.athenarc.gr",
        'aggregated_impulse': "https://bip.imsi.athenarc.gr",
        // Person indicators - Open Science
        'open_access_share': "https://bip.athenarc.gr",
        'open_access_works': "https://bip.athenarc.gr",
        'open_access_influential_works': "https://bip.athenarc.gr",
        'open_access_popular_works': "https://bip.athenarc.gr",
        // Person indicators - Career Stage
        'academic_age': "https://bip.athenarc.gr",
        'fair_academic_age': "https://bip.athenarc.gr"
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
        // Product indicators
        'citation_count': "The total number of citations received by the article in consideration.",
        'popularity': "This indicator reflects the \"current\" impact/attention (the \"hype\") of an article in the research community at large, based on the underlying citation network.",
        'influence': "This indicator reflects the overall/total impact of an article in the research community at large, based on the underlying citation network (diachronically).",
        'impulse': "This indicator reflects the initial momentum of an article directly after its publication, based on the underlying citation network.",
        // Person indicators - Productivity
        'publications_count': "The total number of a researcher's articles, reflecting their productivity.",
        'datasets_count': "The total number of a researcher's datasets, reflecting their productivity.",
        'software_count': "The total number of a researcher's software, reflecting their productivity.",
        'other_works_count': "The total number of a researcher's other works, reflecting their productivity.",
        // Person indicators - Impact
        'citations_num': "The total number of citations received by all articles of the researcher of interest.",
        'h_index': "It is an estimation of the importance, significance, and broad impact of a researcher's cumulative research contributions.",
        'i10_index': "This is a simple measure introduced by Google Scholar that helps gauge the productivity of a researcher.",
        'popular_works_count': "The number of popular works of the researcher of interest.",
        'influential_works_count': "The number of influential works of the researcher of interest.",
        'aggregated_popularity': "The sum of the popularity (current impact) scores of all articles of a researcher of interest.",
        'aggregated_influence': "The sum of the influence (total/overall impact) scores of all articles of a researcher of interest.",
        'aggregated_impulse': "The sum of the impulse scores of all articles of a researcher of interest.",
        // Person indicators - Open Science
        'open_access_share': "The share (proportion) of articles of the researchers of interest that are open access.",
        'open_access_works': "The total count of articles of the researchers of interest that are open access.",
        'open_access_influential_works': "The total count of influential articles of the researchers of interest that are open access.",
        'open_access_popular_works': "The total count of popular articles of the researchers of interest that are open access.",
        // Person indicators - Career Stage
        'academic_age': "It reflects the time that a scientist has been in the research field and performed active research.",
        'fair_academic_age': "A variant of the academic age indicator that takes into consideration a researcher's inactive periods."
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
 * @param {string} entityType - Type of entity: 'product' or 'person'
 * @param {Object} filters - Optional filters for indicators
 * @returns {Object} RA-SKG formatted document
 */
function mapDocumentToRaSkg(doc, entityType, filters = {}) {
    if (entityType === 'product') {
        // Parse identifiers - handle null/empty pids
        let identifiers = [];
        if (doc.pids && typeof doc.pids === 'string') {
            identifiers = doc.pids.split('|||').filter(id => id.trim()).map(id => {
                try {
                    return JSON.parse(id);
                } catch (e) {
                    return null;
                }
            }).filter(id => id !== null);
        }
        
        // Format cites - ensure it's an array if it exists
        let relatedProducts = undefined;
        if (doc.cites) {
            const citesArray = Array.isArray(doc.cites) ? doc.cites : 
                              (typeof doc.cites === 'string' ? doc.cites.split(',').map(c => c.trim()).filter(c => c) : [doc.cites]);
            if (citesArray.length > 0) {
                relatedProducts = {
                    "cites": citesArray
                };
            }
        }
        
        // Build ra_metrics only if doc has metric-related fields
        let raMetrics = undefined;
        const hasMetrics = doc.citation_count !== undefined || 
                          doc.popularity !== undefined || 
                          doc.influence !== undefined || 
                          doc.impulse !== undefined;
        
        if (hasMetrics) {
            // Get filtered indicators based on query parameters
            const measureClass = filters['ra_metrics.ra_metric.ra_measure.class'];
            const categoryClass = filters['ra_metrics.ra_metric.ra_category.class'];
            const measureLabels = filters['ra_metrics.ra_metric.ra_measure.labels'];
            const categoryLabels = filters['ra_metrics.ra_metric.ra_category.labels'];
            
            let indicators;
            if (measureClass || categoryClass || measureLabels || categoryLabels) {
                indicators = getFilteredIndicators(measureClass, categoryClass, measureLabels, categoryLabels);
                // Filter to only product indicators (exclude person-specific aggregated metrics)
                const productIndicators = getIndicatorsByEntityType('product');
                indicators = indicators.filter(ind => productIndicators.includes(ind));
            } else {
                // No filters, use all product indicators directly
                indicators = getIndicatorsByEntityType('product');
            }
            
            // Build ra_metrics array dynamically
            const metrics = buildRaMetrics(doc, indicators);
            // Only include ra_metrics if it's not empty
            if (metrics && metrics.length > 0) {
                raMetrics = metrics;
            }
        }
        
        // Construct local_identifier - use as-is for OTF identifiers, or format as URL for numeric IDs
        let localIdentifier;
        if (doc.internal_id && typeof doc.internal_id === 'string' && doc.internal_id.includes('___')) {
            // OTF identifier format (e.g., otf___1730027051396___person-1 or otf___ndr:dblp___conf/...)
            localIdentifier = doc.internal_id;
        } else {
            // Regular numeric ID - format as URL
            localIdentifier = `https://bip.imsi.athenarc.gr/details/${doc.internal_id}`;
        }
        
        const result = {
            "local_identifier": localIdentifier,
            "entity_type": "product",
            "identifiers": identifiers,
        };
        
        // Only add optional fields if they exist
        if (doc.product_type) {
            result.product_type = doc.product_type;
        }
        
        if (relatedProducts) {
            result.related_products = relatedProducts;
        }
        
        if (raMetrics) {
            result.ra_metrics = raMetrics;
        }
        
        return result;
    } else if (entityType === 'person') {
        // Get filtered indicators based on query parameters
        const measureClass = filters['ra_metrics.ra_metric.ra_measure.class'];
        const categoryClass = filters['ra_metrics.ra_metric.ra_category.class'];
        const measureLabels = filters['ra_metrics.ra_metric.ra_measure.labels'];
        const categoryLabels = filters['ra_metrics.ra_metric.ra_category.labels'];
        
        let indicators;
        if (measureClass || categoryClass || measureLabels || categoryLabels) {
            indicators = getFilteredIndicators(measureClass, categoryClass, measureLabels, categoryLabels);
            // Filter to only person indicators
            const personIndicators = getIndicatorsByEntityType('person');
            indicators = indicators.filter(ind => personIndicators.includes(ind));
        } else {
            indicators = getIndicatorsByEntityType('person');
        }

        return {
            "local_identifier": `https://bip.imsi.athenarc.gr/scholar/${doc.internal_id}`,
            "entity_type": "person",
            "name": doc.name || "Unknown Name",
            "identifiers": [
                {
                    "value": doc.orcid,
                    "scheme": "orcid"
                }
            ],
            "ra_metrics": buildRaMetrics(doc, indicators)
        };
    }
    
    throw new Error(`Unsupported entity type: ${entityType}. Use 'product' or 'person'.`);
}

/**
 * Map documents to RA-SKG format
 * @param {Object|Array} docs - Single document or array of documents from database
 * @param {string} entityType - Type of entity: 'product' or 'person'
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
