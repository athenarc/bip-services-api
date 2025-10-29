const dbQuery = require('../databaseInteractions');

/**
 * Get product by internal ID for NDR format
 * @param {string|number} id - Internal ID (extracted from NDR identifier)
 * @returns {Promise<Object|null>} Product data with identifiers and cites
 */
/**
 * Format ID as OTF NDR identifier
 * @param {string} value - The original ID value
 * @param {string} type - The type (doi, dblp, etc.)
 * @returns {string} Formatted as otf___ndr:{type}___{value}
 */
function formatOtfNdrId(value, type) {
    return `otf___ndr:${type}___${value}`;
}

async function getProductById(id) {
    // First, check if the id exists in the 'citing' column
    const citingSql = `SELECT 
        cited,
        cited_type 
        FROM ndr_citations 
        WHERE citing = ?
        LIMIT 5`;
    
    const citations = await dbQuery.executeSQLQuery(citingSql, [id]);
    
    if (citations && citations.length > 0) {
        // Found in citing - this is a citing paper
        // Format internal_id as OTF NDR identifier with type "dblp"
        const formattedInternalId = formatOtfNdrId(id, 'dblp');
        
        // Format citations as array of cited IDs in OTF NDR format
        const citesArray = citations.map(c => {
            if (c.cited && c.cited_type) {
                return formatOtfNdrId(c.cited, c.cited_type);
            }
            return null;
        }).filter(c => c !== null);
        
        // Build identifiers: id as pid with type "dblp"
        const pids = `{"value":"${id}","scheme":"dblp"}`;
        
        return {
            internal_id: formattedInternalId,
            pids: pids,
            cites: citesArray.length > 0 ? citesArray : null
        };
    }
    
    // Not found in citing, check if it exists in 'cited' column
    const citedSql = `SELECT 
        cited_type 
        FROM ndr_citations 
        WHERE cited = ?
        LIMIT 1`;
    
    const citedResults = await dbQuery.executeSQLQuery(citedSql, [id]);
    
    if (citedResults && citedResults.length > 0) {
        // Found in cited - this is a cited paper
        const citedType = citedResults[0].cited_type;
        
        // Format internal_id as OTF NDR identifier with the cited_type
        const formattedInternalId = formatOtfNdrId(id, citedType);
        
        // Build identifiers: id as pid with the cited_type from database
        const pids = `{"value":"${id}","scheme":"${citedType}"}`;
        
        return {
            internal_id: formattedInternalId,
            pids: pids,
            cites: []  // No cites relations for cited papers
        };
    }
    
    // Not found in either column
    return null;
}

/**
 * Get products with filtering and pagination for NDR format
 * @param {Object} filters - Filter parameters including pagination
 * @returns {Promise<Array>} Array of product data with identifiers and cites
 */
async function getProductsWithFilters(filters) {
    const params = [];
    let sql = '';
    
    // Query only citing IDs (all citing are dblp)
    let citingSql = `SELECT DISTINCT citing as id, 'dblp' as type, 'citing' as source FROM ndr_citations WHERE 1=1`;
    let citingParams = [];
    
    // Apply identifier.id filter
    if (filters['identifiers.id']) {
        const identifiers = filters['identifiers.id'].split(',').map(id => id.trim()).filter(id => id);
        if (identifiers.length > 0) {
            const condition = identifiers.length === 1 
                ? ` = ?` 
                : ` IN (${identifiers.map(() => '?').join(',')})`;
            
            citingSql += ` AND citing${condition}`;
            citingParams.push(...identifiers);
        }
    }
    
    // Apply identifier.scheme filter (all citing are dblp)
    if (filters['identifiers.scheme']) {
        const scheme = filters['identifiers.scheme'];
        if (scheme !== 'dblp') {
            // No citing entries for non-dblp schemes
            return [];
        }
    }
    
    // Final SQL only from citing
    sql = citingSql;
    params.push(...citingParams);
    
    // Get paginated results
    const offset = (filters.page - 1) * filters.page_size;
    const finalSql = `${sql} LIMIT ? OFFSET ?`;
    params.push(filters.page_size, offset);
    
    const results = await dbQuery.executeSQLQuery(finalSql, params);
    
    // Collect all citing IDs to fetch their citations in one query
    const citingIds = results.map(r => r.id);
    
    // Fetch all citations for citing IDs in one query
    let citationsMap = {};
    if (citingIds.length > 0) {
        const placeholders = citingIds.map(() => '?').join(',');
        const allCitesSql = `SELECT citing, cited, cited_type FROM ndr_citations WHERE citing IN (${placeholders})`;
        const allCitations = await dbQuery.executeSQLQuery(allCitesSql, citingIds);
        
        // Group citations by citing ID
        allCitations.forEach(c => {
            if (!citationsMap[c.citing]) {
                citationsMap[c.citing] = [];
            }
            if (c.cited && c.cited_type) {
                citationsMap[c.citing].push(formatOtfNdrId(c.cited, c.cited_type));
            }
        });
    }
    
    // Format products
    const products = results.map(row => {
        const id = row.id;
        const citesArray = citationsMap[id] || [];
        const formattedInternalId = formatOtfNdrId(id, 'dblp');
        const pids = `{"value":"${id}","scheme":"dblp"}`;
        
        return {
            internal_id: formattedInternalId,
            pids: pids,
            cites: citesArray.length > 0 ? citesArray : null
        };
    });
    
    return products;
}

module.exports = {
    getProductById,
    getProductsWithFilters,
};

