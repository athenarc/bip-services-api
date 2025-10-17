/**
 * Shared Indicator Mapping Configuration
 * Maps indicator names to their class URIs and database columns
 */

const INDICATOR_MAPPING = {
    // Measures (ra_measure.class)
    'citation_count': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/citation-count',
        field: 'citation_count',
        dbColumn: 'p.citation_count'
    },
    'popularity': {
        type: 'measure', 
        class: 'https://bip.imsi.athenarc.gr/site/indicators#Popularity',
        field: 'popularity',
        dbColumn: 'p.attrank'
    },
    'influence': {
        type: 'measure',
        class: 'https://bip.imsi.athenarc.gr/site/indicators#Influence', 
        field: 'influence',
        dbColumn: 'p.pagerank'
    },
    'impulse': {
        type: 'measure',
        class: 'https://bip.imsi.athenarc.gr/site/indicators#Impulse',
        field: 'impulse',
        dbColumn: 'p.3y_cc'
    },
    
    // Categories (ra_category.class)
    'citation_count_class': {
        type: 'category',
        class: 'https://bip.athenarc.gr/ontology/citation-count-class',
        field: 'cc_class',
        dbColumn: 'p.citation_count'
    },
    'popularity_class': {
        type: 'category',
        class: 'https://bip.athenarc.gr/ontology/popularity-class',
        field: 'pop_class',
        dbColumn: 'p.attrank'
    },
    'influence_class': {
        type: 'category', 
        class: 'https://bip.athenarc.gr/ontology/influence-class',
        field: 'inf_class',
        dbColumn: 'p.pagerank'
    },
    'impulse_class': {
        type: 'category',
        class: 'https://bip.athenarc.gr/ontology/impulse-class',
        field: 'imp_class',
        dbColumn: 'p.3y_cc'
    }
};

/**
 * Get database column for a measure class URI
 * @param {string} measureClass - The measure class URI
 * @returns {string} Database column name
 */
function getDbColumnForMeasureClass(measureClass) {
    const indicator = Object.values(INDICATOR_MAPPING).find(config => 
        config.type === 'measure' && config.class === measureClass
    );
    
    if (!indicator) {
        throw new Error(`Unsupported measure class: ${measureClass}`);
    }
    
    return indicator.dbColumn;
}

/**
 * Get indicator configuration by name
 * @param {string} indicatorName - The indicator name
 * @returns {Object} Indicator configuration
 */
function getIndicatorConfig(indicatorName) {
    return INDICATOR_MAPPING[indicatorName];
}

/**
 * Get all indicator names
 * @returns {Array} Array of indicator names
 */
function getAllIndicatorNames() {
    return Object.keys(INDICATOR_MAPPING);
}

/**
 * Get indicators by type
 * @param {string} type - 'measure' or 'category'
 * @returns {Array} Array of indicator names of the specified type
 */
function getIndicatorsByType(type) {
    return Object.entries(INDICATOR_MAPPING)
        .filter(([name, config]) => config.type === type)
        .map(([name]) => name);
}

module.exports = {
    INDICATOR_MAPPING,
    getDbColumnForMeasureClass,
    getIndicatorConfig,
    getAllIndicatorNames,
    getIndicatorsByType
};
