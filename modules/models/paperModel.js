const dbQuery = require('../databaseInteractions');

/**
 * Get ranking scores for papers by DOI
 * @param {string|Array} doi - Single DOI or array of DOIs
 * @returns {Promise<Array>} Array of paper ranking data
 */
async function getRankingScores(doi) {
    let sql = `SELECT
        doi,
        attrank,
        pagerank,
        3y_cc as 3_year_cc,
        citation_count as cc
        FROM pmc_paper
	INNER JOIN pmc_paper_pids ON pmc_paper.internal_id = pmc_paper_pids.paper_id
	WHERE doi IN ( ? )`;
    return dbQuery.executeSQLQuery(sql, [doi]);
}

/**
 * Calculate impact classes for a paper based on impact scores
 * @param {Object} doc - Paper document with ranking data
 * @returns {Object} Paper document with added impact classes
 */
async function enrichWithImpactClasses(doc) {
    
    // Get impact class scores from the database
    let [impactScores] = await dbQuery.executeSQLQuery("SELECT * FROM low_category_scores_view", []);

    // Calculate popularity class based on attrank
    if( doc['attrank'] >= impactScores['popularity_top001'])
        doc['pop_class'] = "C1";
    else if(doc['attrank'] >= impactScores['popularity_top01'])
        doc['pop_class'] = "C2";
    else if(doc['attrank'] >= impactScores['popularity_top1'])
        doc['pop_class'] = "C3";
    else if(doc['attrank'] >= impactScores['popularity_top10'])
        doc['pop_class'] = "C4";
    else
        doc['pop_class'] = "C5";

    // Calculate influence class based on pagerank
    if(doc['pagerank'] >= impactScores['influence_top001'])
        doc['inf_class'] = "C1";
    else if(doc['pagerank'] >= impactScores['influence_top01'])
        doc['inf_class'] = "C2";
    else if(doc['pagerank'] >= impactScores['influence_top1'])
        doc['inf_class'] = "C3";
    else if(doc['pagerank'] >= impactScores['influence_top10'])
        doc['inf_class'] = "C4";
    else
        doc['inf_class'] = "C5";

    // Calculate impulse class based on 3_year_cc
    if(doc['3_year_cc'] >= impactScores['impulse_top001'])
        doc['imp_class'] = "C1";
    else if(doc['3_year_cc'] >= impactScores['impulse_top01'])
        doc['imp_class'] = "C2";
    else if(doc['3_year_cc'] >= impactScores['impulse_top1'])
        doc['imp_class'] = "C3";
    else if(doc['3_year_cc'] >= impactScores['impulse_top10'])
        doc['imp_class'] = "C4";
    else
        doc['imp_class'] = "C5";

    // Calculate citation count class based on cc
    if(doc['cc'] >= impactScores['cc_top001'])
        doc['cc_class'] = "C1";
    else if(doc['cc'] >= impactScores['cc_top01'])
        doc['cc_class'] = "C2";
    else if(doc['cc'] >= impactScores['cc_top1'])
        doc['cc_class'] = "C3";
    else if(doc['cc'] >= impactScores['cc_top10'])
        doc['cc_class'] = "C4";
    else
        doc['cc_class'] = "C5";

    return doc;
}

module.exports = {
    getRankingScores,
    enrichWithImpactClasses
};
