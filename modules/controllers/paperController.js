const Boom = require('@hapi/boom');
const Lib = require('../libs/commFunctions');
const { wrapController } = require('../libs/controllerWrapper');
const api_reference = "PaperController";
const axios = require('axios');
const _ = require('lodash');
const paperModel = require('../models/paperModel');
const config = require('../../config/default');

// Define the controller functions without logging
const controller = {
    getPaperScores: async function(doi) {
        let docs = await paperModel.getRankingScores(doi);
        if(!docs.length){
            throw Boom.notFound();
        }

        let doc = await paperModel.enrichWithImpactClasses(docs[0]);

        return doc;
    },

    getPaperScoresBatch: async function(dois) {
        
        // get docs from the DB
        let docs = await paperModel.getRankingScores(dois);
        
        // enrich each document with the impact classes
        docs = await Promise.all(docs.map(doc => paperModel.enrichWithImpactClasses(doc)));

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
    },

    searchPapers: async function(params) {
        let res = await axios.get(`${config.constants.bipApiBaseUrl}/api/search`, {
            params: params,
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });
        return res.data;
    }
};

// Export the controller with automatic logging and stats tracking
module.exports = wrapController(api_reference, controller);
