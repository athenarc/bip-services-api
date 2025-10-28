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

module.exports = {
    getScholarScores,
    getResearcher,
};

