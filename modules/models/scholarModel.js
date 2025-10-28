const axios = require('axios');
const config = require('../../config/default');
const dbQuery = require('../databaseInteractions');

/**
 * Get scholar scores/profile data by ORCID
 * @param {string} orcid - The ORCID identifier
 * @returns {Promise<Object>} Scholar profile data
 */
async function getScholarScores(orcid) {
    let res = await axios.get(`${config.constants.bipApiBaseUrl}/api/profile`, {
        params: { orcid },
        httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
    });
    return res.data;
}

async function getResearcher(id) {
    const sql = `SELECT id AS internal_id, orcid, name FROM researchers WHERE id = ? AND is_public = 1`;
    return dbQuery.executeSQLQuery(sql, [id]);
}

/**
 * Build WHERE clause and parameters based on filters for researchers
 * @param {Object} filters - Filter parameters
 * @returns {Object} Object with whereClause string and params array
 */
function buildResearcherWhereClause(filters) {
    const params = [];
    let whereClause = '';
    
    // Identifier filters (ORCID)
    if (filters['identifiers.id']) {
        const identifiers = filters['identifiers.id'].split(',').map(id => id.trim()).filter(id => id);
        if (identifiers.length === 1) {
            whereClause += ` AND r.orcid = ?`;
            params.push(identifiers[0]);
        } else if (identifiers.length > 1) {
            const placeholders = identifiers.map(() => '?').join(',');
            whereClause += ` AND r.orcid IN (${placeholders})`;
            params.push(...identifiers);
        }
    }
    
    // Always filter by is_public = 1
    whereClause += ` AND r.is_public = 1`;
    
    return { whereClause, params };
}

/**
 * Get researchers with filtering and pagination
 * @param {Object} filters - Filter parameters including pagination
 * @returns {Promise<Array>} Array of researcher data with scores
 */
async function getResearchersWithFilters(filters) {
    // Build WHERE clause
    const { whereClause, params } = buildResearcherWhereClause(filters);
    
    // Build SQL query
    let sql = `SELECT 
        r.id AS internal_id,
        r.orcid,
        r.name
        FROM researchers r
    WHERE 1=1 ${whereClause}`;
    
    // Add pagination
    const offset = (filters.page - 1) * filters.page_size;
    sql += ` ORDER BY r.id LIMIT ? OFFSET ?`;
    params.push(filters.page_size, offset);
    
    const researchers = await dbQuery.executeSQLQuery(sql, params);
    
    // Fetch scores from API for each researcher
    const results = await Promise.all(
        researchers.map(async (researcher) => {
            try {
                const scores = await getScholarScores(researcher.orcid);

                return { ...researcher, ...scores };
            } catch (error) {
                // If API call fails, return researcher with empty scores
                console.error(`Failed to fetch scores for ORCID ${researcher.orcid}:`, error.message);
                return researcher;
            }
        })
    );
    
    return results;
}

module.exports = {
    getScholarScores,
    getResearcher,
    getResearchersWithFilters,
};

