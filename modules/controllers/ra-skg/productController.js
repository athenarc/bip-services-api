const Boom = require('@hapi/boom');
const axios = require('axios');
const { wrapController } = require('../../libs/controllerWrapper');
const { mapToRaSkgFormat } = require('../../libs/raSkgMapper');
const api_reference = "ProductController";
const paperModel = require('../../models/paperModel');

// Define the controller functions without logging
const controller = {
    getProduct: async function(id) {
        
        let docs = await paperModel.getScores(id, 'openaire_id');
        if(!docs.length){
            throw Boom.notFound();
        }

        let doc = await paperModel.enrichWithImpactClasses(docs[0]);
        return mapToRaSkgFormat(doc, 'product');
    },

    getProductScoresBatch: async function(ids) {
        // Get docs from the database
        let docs = await paperModel.getScores(ids, 'openaire_id');
        
        if (!docs.length) {
            throw Boom.notFound('No products found for the given identifiers');
        }
        
        // Enrich each document with impact classes
        docs = await Promise.all(docs.map(doc => paperModel.enrichWithImpactClasses(doc)));
        
        // Transform to RA-SKG format using the mapper
        return mapToRaSkgFormat(docs, 'product');
    },
};

// Export the controller with automatic logging and stats tracking
module.exports = wrapController(api_reference, controller);
