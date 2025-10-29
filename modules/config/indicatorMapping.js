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
        class: 'https://bip.athenarc.gr/ontology/popularity',
        field: 'popularity',
        dbColumn: 'p.attrank'
    },
    'influence': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/influence', 
        field: 'influence',
        dbColumn: 'p.pagerank'
    },
    'impulse': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/impulse',
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
    },
    
    // Person/Researcher specific measures - Productivity indicators
    'publications_count': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/publications-count',
        field: 'work_types_num.papers',
        entityType: 'person'
    },
    'datasets_count': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/datasets-count',
        field: 'work_types_num.datasets',
        entityType: 'person'
    },
    'software_count': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/software-count',
        field: 'work_types_num.software',
        entityType: 'person'
    },
    'other_works_count': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/other-works-count',
        field: 'work_types_num.other',
        entityType: 'person'
    },
    // Impact indicators
    'citations_num': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/citation-count',
        field: 'citations_num',
        entityType: 'person'
    },
    'h_index': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/h-index',
        field: 'h_index',
        entityType: 'person'
    },
    'i10_index': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/i10-index',
        field: 'i10_index',
        entityType: 'person'
    },
    'popular_works_count': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/popular-works-count',
        field: 'popular_works_count',
        entityType: 'person'
    },
    'influential_works_count': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/influential-works-count',
        field: 'influential_works_count',
        entityType: 'person'
    },
    'aggregated_popularity': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/aggregated-popularity',
        field: 'popularity',
        entityType: 'person'
    },
    'aggregated_influence': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/aggregated-influence',
        field: 'influence',
        entityType: 'person'
    },
    'aggregated_impulse': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/aggregated-impulse',
        field: 'impulse',
        entityType: 'person'
    },
    // Open Science indicators
    'open_access_share': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/open-access-share',
        field: 'openness.open_percentage',
        entityType: 'person'
    },
    'open_access_works': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/open-access-works',
        field: 'openness.open_papers',
        entityType: 'person'
    },
    'open_access_influential_works': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/open-access-influential-works',
        field: 'openness.influential_open_papers',
        entityType: 'person'
    },
    'open_access_popular_works': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/open-access-popular-works',
        field: 'openness.popular_open_papers',
        entityType: 'person'
    },
    // Career Stage indicators
    'academic_age': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/academic-age',
        field: 'academic_age',
        entityType: 'person'
    },
    'fair_academic_age': {
        type: 'measure',
        class: 'https://bip.athenarc.gr/ontology/fair-academic-age',
        field: 'responsible_academic_age',
        entityType: 'person'
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

/**
 * Get all indicator names for a specific entity type
 * @param {string} entityType - 'product' or 'person'
 * @returns {Array} Array of indicator names for the entity type
 */
function getIndicatorsByEntityType(entityType) {
    return Object.entries(INDICATOR_MAPPING)
        .filter(([name, config]) => {
            // Include if entityType matches, or if no entityType specified (product metrics)
            return config.entityType === entityType || (!config.entityType && entityType === 'product');
        })
        .map(([name]) => name);
}

module.exports = {
    INDICATOR_MAPPING,
    getDbColumnForMeasureClass,
    getIndicatorConfig,
    getAllIndicatorNames,
    getIndicatorsByType,
    getIndicatorsByEntityType
};
