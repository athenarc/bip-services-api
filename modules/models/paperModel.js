const dbQuery = require('../databaseInteractions');
const { getDbColumnForMeasureClass } = require('../config/indicatorMapping');

/**
 * Get ranking scores for papers by DOI or ID
 * @param {string|Array} identifiers - Single identifier or array of identifiers (DOIs or IDs)
 * @param {string} identifierType - Type of identifier: 'doi' or 'id' (default: 'doi')
 * @returns {Promise<Array>} Array of paper ranking data
 */
async function getScores(identifiers, identifierType = 'doi') {
    let sql;
    
    if (identifierType === 'doi') {
        sql = `SELECT
            doi,
            attrank as popularity,
            pagerank as influence,
            3y_cc as impulse,
            citation_count as citation_count
            FROM pmc_paper
        INNER JOIN pmc_paper_pids ON pmc_paper.internal_id = pmc_paper_pids.paper_id
        WHERE doi IN ( ? )`;
    } else if (identifierType === 'openaire_id') {
        sql = `SELECT
            p.openaire_id,
            CASE 
                WHEN p.type = 0 THEN 'literature'
                WHEN p.type = 1 THEN 'research data'
                WHEN p.type = 2 THEN 'research software'
                WHEN p.type = 3 THEN 'other'
                ELSE 'literature'
            END as product_type,
            p.attrank as popularity,
            p.pagerank as influence,
            p.3y_cc as impulse,
            p.citation_count as citation_count,
            GROUP_CONCAT(
                CASE 
                    WHEN pid.doi IS NOT NULL THEN CONCAT('{"value":"', pid.doi, '","scheme":"doi"}')
                    ELSE NULL
                END
                SEPARATOR '|||'
            ) as pids
            FROM pmc_paper p
        LEFT JOIN pmc_paper_pids pid ON p.internal_id = pid.paper_id
        WHERE p.openaire_id IN ( ? )
        GROUP BY p.internal_id, p.openaire_id, p.type, p.attrank, p.pagerank, p.3y_cc, p.citation_count`;
    } else {
        throw new Error(`Unsupported identifier type: ${identifierType}. Use 'doi' or 'openaire_id'.`);
    }
    
    return dbQuery.executeSQLQuery(sql, [identifiers]);
}

/**
 * Get ranking scores for papers with filtering and pagination
 * @param {Object} filters - Filter parameters including pagination
 * @returns {Promise<Array>} Array of paper ranking data with count
 */
async function getScoresWithFilters(filters) {

    console.log(filters);
    
    let sql = `SELECT
        p.openaire_id,
        CASE 
            WHEN p.type = 0 THEN 'literature'
            WHEN p.type = 1 THEN 'research data'
            WHEN p.type = 2 THEN 'research software'
            WHEN p.type = 3 THEN 'other'
            ELSE 'literature'
        END as product_type,
        p.attrank as popularity,
        p.pagerank as influence,
        p.3y_cc as impulse,
        p.citation_count as citation_count,
        GROUP_CONCAT(
            CASE 
                WHEN pid.doi IS NOT NULL THEN CONCAT('{"value":"', pid.doi, '","scheme":"doi"}')
                ELSE NULL
            END
            SEPARATOR '|||'
        ) as pids
        FROM pmc_paper p
    LEFT JOIN pmc_paper_pids pid ON p.internal_id = pid.paper_id
    WHERE 1=1`;
    
    const params = [];
    
    // TODO: create an index?
    // Product type filter
    if (filters.product_type) {
        let typeValue;
        switch (filters.product_type) {
            case 'literature': typeValue = 0; break;
            case 'research data': typeValue = 1; break;
            case 'research software': typeValue = 2; break;
            case 'other': typeValue = 3; break;
        }
        if (typeValue !== undefined) {
            sql += ` AND p.type = ?`;
            params.push(typeValue);
        }
    }
    
    // Identifier filters
    if (filters['identifiers.id']) {
        const identifiers = filters['identifiers.id'].split(',').map(id => id.trim()).filter(id => id);
        if (identifiers.length === 1) {
            sql += ` AND pid.doi = ?`;
            params.push(identifiers[0]);
        } else if (identifiers.length > 1) {
            const placeholders = identifiers.map(() => '?').join(',');
            sql += ` AND pid.doi IN (${placeholders})`;
            params.push(...identifiers);
        }
    }
    
    if (filters['identifiers.scheme']) {
        sql += ` AND pid.pid_type = ?`;
        params.push(filters['identifiers.scheme']);
    }
    
    // Value range filters - filter specific indicator based on measure class
    if (filters['cf.min.ra_metrics.ra_metric.ra_value'] || filters['cf.max.ra_metrics.ra_metric.ra_value']) {
        const measureClass = filters['ra_metrics.ra_metric.ra_measure.class'];
        
        if (!measureClass) {
            throw new Error('ra_metrics.ra_metric.ra_measure.class is required when using value filters');
        }
        
        // Get database column for the measure class
        const metricColumn = getDbColumnForMeasureClass(measureClass);
        
        // Apply min value filter
        if (filters['cf.min.ra_metrics.ra_metric.ra_value']) {
            sql += ` AND ${metricColumn} >= ?`;
            params.push(filters['cf.min.ra_metrics.ra_metric.ra_value']);
        }
        
        // Apply max value filter
        if (filters['cf.max.ra_metrics.ra_metric.ra_value']) {
            sql += ` AND ${metricColumn} <= ?`;
            params.push(filters['cf.max.ra_metrics.ra_metric.ra_value']);
        }
    }
        
    // Group by and pagination
    sql += ` GROUP BY p.internal_id`;
    
    // Add pagination
    const offset = (filters.page - 1) * filters.page_size;
    sql += ` LIMIT ? OFFSET ?`;
    params.push(filters.page_size, offset);

    console.log(sql, params);
    
    return dbQuery.executeSQLQuery(sql, params);
}

/**
 * Calculate impact classes for a paper based on impact scores
 * @param {Object} doc - Paper document with ranking data
 * @returns {Object} Paper document with added impact classes
 */
async function enrichWithImpactClasses(doc) {
    
    // Get impact class scores from the database
    let [impactScores] = await dbQuery.executeSQLQuery("SELECT * FROM low_category_scores_view", []);

    // Calculate popularity class based on popularity (attrank)
    if( doc['popularity'] >= impactScores['popularity_top001'])
        doc['pop_class'] = "C1";
    else if(doc['popularity'] >= impactScores['popularity_top01'])
        doc['pop_class'] = "C2";
    else if(doc['popularity'] >= impactScores['popularity_top1'])
        doc['pop_class'] = "C3";
    else if(doc['popularity'] >= impactScores['popularity_top10'])
        doc['pop_class'] = "C4";
    else
        doc['pop_class'] = "C5";

    // Calculate influence class based on influence (pagerank)
    if(doc['influence'] >= impactScores['influence_top001'])
        doc['inf_class'] = "C1";
    else if(doc['influence'] >= impactScores['influence_top01'])
        doc['inf_class'] = "C2";
    else if(doc['influence'] >= impactScores['influence_top1'])
        doc['inf_class'] = "C3";
    else if(doc['influence'] >= impactScores['influence_top10'])
        doc['inf_class'] = "C4";
    else
        doc['inf_class'] = "C5";

    // Calculate impulse class based on impulse (3_year_cc)
    if(doc['impulse'] >= impactScores['impulse_top001'])
        doc['imp_class'] = "C1";
    else if(doc['impulse'] >= impactScores['impulse_top01'])
        doc['imp_class'] = "C2";
    else if(doc['impulse'] >= impactScores['impulse_top1'])
        doc['imp_class'] = "C3";
    else if(doc['impulse'] >= impactScores['impulse_top10'])
        doc['imp_class'] = "C4";
    else
        doc['imp_class'] = "C5";

    // Calculate citation count class based on citation_count
    if(doc['citation_count'] >= impactScores['cc_top001'])
        doc['cc_class'] = "C1";
    else if(doc['citation_count'] >= impactScores['cc_top01'])
        doc['cc_class'] = "C2";
    else if(doc['citation_count'] >= impactScores['cc_top1'])
        doc['cc_class'] = "C3";
    else if(doc['citation_count'] >= impactScores['cc_top10'])
        doc['cc_class'] = "C4";
    else
        doc['cc_class'] = "C5";

    return doc;
}

/**
 * Transform document to use original property names for API compatibility
 * @param {Object} doc - Document with new property names
 * @returns {Object} Document with original property names
 */
function transformToOriginalFormat(doc) {
    return {
        ...doc,
        attrank: doc.popularity,        // popularity → attrank
        pagerank: doc.influence,        // influence → pagerank  
        '3_year_cc': doc.impulse,       // impulse → 3_year_cc
        cc: doc.citation_count,         // citation_count → cc
        // Remove the new property names to avoid duplication
        popularity: undefined,
        influence: undefined,
        impulse: undefined,
        citation_count: undefined
    };
}

module.exports = {
    getScores,
    getScoresWithFilters,
    enrichWithImpactClasses,
    transformToOriginalFormat
};
