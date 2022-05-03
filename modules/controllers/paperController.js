const Boom = require('boom');
const Lib = require('../libs/commFunctions');
const dbQuery = require('../databaseInteractions');
const api_reference = "Paper_Controller";

async function getRankingScores(doi) {
    let sql = `SELECT
        doi,
        pagerank,
        tar_ram,
        attrank,
        citation_count
    FROM impact_scores WHERE doi = ?`;

    return dbQuery.executeSQLQuery(sql, [doi]);
}

async function getImpactClassScores() {

    let res = await dbQuery.executeSQLQuery("SELECT influence_top001 FROM low_category_scores_view", []);
    let last_inf_top001 = res[0]['influence_top001'];

    res = await dbQuery.executeSQLQuery("SELECT influence_top1 FROM low_category_scores_view", []);
    let last_inf_top1 = res[0]['influence_top1'];

    res = await dbQuery.executeSQLQuery("SELECT popularity_top001 FROM low_category_scores_view", []);
    let last_pop_top001 = res[0]['popularity_top001'];

    res = await dbQuery.executeSQLQuery("SELECT popularity_top1 FROM low_category_scores_view", []);
    let last_pop_top1 = res[0]['popularity_top1'];

    return {
        last_inf_top001,
        last_inf_top1,
        last_pop_top001,
        last_pop_top1
    };
}

async function getImpactClass(impactScores, doc) {

    if( doc['tar_ram'] >= impactScores['last_pop_top001'])
        doc['pop_class'] = "A";
    else if(doc['tar_ram'] >= impactScores['last_pop_top1'])
        doc['pop_class'] = "B";
    else
        doc['pop_class'] = "C"; 

    if(doc['pagerank'] >= impactScores['last_inf_top001'])
        doc['inf_class'] = "A";
    else if(doc['pagerank'] >= impactScores['last_inf_top1'])
        doc['inf_class'] = "B";
    else
        doc['inf_class'] = "C"; 

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
        res = [];

        let impactScores = await getImpactClassScores();

        for (let i in dois.slice(0, 50)) {
            let doi = dois[i];
            let doc;
            let docs = await getRankingScores(doi);
            
            if(!docs.length){
                doc = {
                    doi: doi, 
                    msg: "Not Found"
                };
            } else {
                doc = await getImpactClass(impactScores, docs[0]);
            }

            res.push(doc);
        }

        return res;

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