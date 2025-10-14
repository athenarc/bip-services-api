const Boom = require('@hapi/boom');
const Lib = require('../libs/commFunctions');
const dbQuery = require('../databaseInteractions');
const api_reference = "Paper_Controller";
const axios = require('axios');
const _ = require('lodash');

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

async function getImpactClassScores() {

    let [res] = await dbQuery.executeSQLQuery("SELECT * FROM low_category_scores_view", []);

    return res;
}

async function getImpactClass(impactScores, doc) {

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

module.exports.getPaperScores = async function(doi) {
    winstonLogger.info({
        api_reference: api_reference,
        event: "/paper/scores/{doi}",
        doi: doi
    });

    try {
        let docs = await getRankingScores(doi);
        if(!docs.length){
            throw Boom.notFound();
        }

        let impactScores = await getImpactClassScores();
        let doc = await getImpactClass(impactScores, docs[0]);

        return doc;

    } catch (error) {
        if (error.isBoom) {
            throw error;
        } else {
            winstonLogger.error(`Unknown Error for the api ${api_reference}: ${error.message || error}`)
            const err = Boom.expectationFailed("Expected this to work :(");
            throw err;
        }
    }
}

module.exports.getPaperScoresBatch = async function(dois) {
    winstonLogger.info({
        api_reference: api_reference,
        event: "/paper/scores/batch/{dois}",
        dois: dois
    });

    try {

        let impactScores = await getImpactClassScores();

        // get docs from the DB
        let docs = await getRankingScores(dois);

        // get the impact class of each found document
        for (let doc of docs) {
            doc = await getImpactClass(impactScores, doc);  
        }
        
        // extract DOIs found
        let doisFound = _.map(docs, 'doi');
    
        // for DOIs not found in the DB, prepare the appropriate document to append in the response
        let missingDocs = _.difference(dois, doisFound).map( (missingDoi) => {
            return {
                doi: missingDoi, 
                msg: "Not Found"
            };
        });

        return docs.concat(missingDocs);

    } catch (error) {
        if (error.isBoom) {
            throw error;
        } else {
            winstonLogger.error(`Unknown Error for the api ${api_reference}: ${error.message || error}`)
            const err = Boom.expectationFailed("Expected this to work :(");
            throw err;
        }
    }
}

module.exports.searchPapers = async function(params) {
    winstonLogger.info({
        api_reference: api_reference,
        event: "/paper/search",
        params
    });

    const bipApiBaseUrl = 'https://bip.imis.athena-innovation.gr';
    
    try {
        let res = await axios.get(`${bipApiBaseUrl}/api/search`, {
            params: params,
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });
        return res.data;
    } catch (err) {
        return err.response?.data || err.message;
    }
}
