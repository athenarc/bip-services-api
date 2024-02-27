const Boom = require('boom');
const Lib = require('../libs/commFunctions');
const dbQuery = require('../databaseInteractions');
const api_reference = "Paper_Controller";
const rp = require('request-promise');
const _ = require('lodash');

async function getRankingScores(doi) {
    let sql = `SELECT
        doi,
        attrank,
        tar_ram,
        pagerank,
        3y_cc as 3_year_cc,
        citation_count as cc
        FROM pmc_paper WHERE doi IN ( ? )`;
    return dbQuery.executeSQLQuery(sql, [doi]);
}

async function getImpactClassScores() {

    let res = await dbQuery.executeSQLQuery("SELECT * FROM low_category_scores_view", []);
    let last_inf_top001 = res[0]['influence_top001'];
    let last_inf_top1 = res[0]['influence_top1'];
    let last_pop_top001 = res[0]['popularity_top001'];
    let last_pop_top1 = res[0]['popularity_top1'];
    let last_imp_top001 = res[0]['impulse_top001'];
    let last_imp_top1 = res[0]['impulse_top1'];

    return {
        last_inf_top001,
        last_inf_top1,
        last_pop_top001,
        last_pop_top1,
        last_imp_top001,
        last_imp_top1,
    };
}

async function getImpactClass(impactScores, doc) {

    if( doc['attrank'] >= impactScores['last_pop_top001'])
        doc['pop_class'] = "A";
    else if(doc['attrank'] >= impactScores['last_pop_top1'])
        doc['pop_class'] = "B";
    else
        doc['pop_class'] = "C";

    if(doc['pagerank'] >= impactScores['last_inf_top001'])
        doc['inf_class'] = "A";
    else if(doc['pagerank'] >= impactScores['last_inf_top1'])
        doc['inf_class'] = "B";
    else
        doc['inf_class'] = "C";

    if(doc['3_year_cc'] >= impactScores['last_imp_top001'])
        doc['imp_class'] = "A";
    else if(doc['3_year_cc'] >= impactScores['last_imp_top1'])
        doc['imp_class'] = "B";
    else
        doc['imp_class'] = "C";

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
            const err = error.output.payload;
            return err
        } else {
            winstonLogger.error("Unknown Error for the api ", api_reference, error)
            const err = Boom.expectationFailed("Expected this to work :(");
            throw err
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
            const err = error.output.payload;
            return err
        } else {
            winstonLogger.error("Unknown Error for the api ", api_reference, error)
            const err = Boom.expectationFailed("Expected this to work :(");
            throw err
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
    
    let options  = {
        url: `${bipApiBaseUrl}/api/search`,
        qs: params, 
        rejectUnauthorized: false,
        json: true,
    };

    try {
        let res = await rp(options);
        return res;
    } catch (err) {
        return err.error;
    }
}
