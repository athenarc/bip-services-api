const Boom = require('@hapi/boom');
const axios = require('axios');
const { wrapController } = require('../../libs/controllerWrapper');
const { mapToRaSkgFormat } = require('../../libs/raSkgMapper');
const api_reference = "ProductController";
const paperModel = require('../../models/paperModel');

// Define the controller functions without logging
const controller = {
    getProduct: async function(local_identifier) {
        // Extract id parameter from the local_identifier URL
        const url = new URL(local_identifier.trim());
        let id = url.searchParams.get('id');

        if (!id) {
            id = local_identifier.trim();
        }

        // patch openaire_id to be compliant with the db values
        // TODO: remove this once the db values are updated
        id = `50|${id}`;
        
        let docs = await paperModel.getScores(id, 'openaire_id');
        if(!docs.length){
            throw Boom.notFound();
        }

        let doc = await paperModel.enrichWithImpactClasses(docs[0]);
        return mapToRaSkgFormat(doc, 'product', {});
    },

    getProductsWithFilters: async function(queryParams) {
        // Process query parameters - Joi already handled all the validation and conversion
        const filters = {
            // Pass through all query parameters as-is (they're already validated and converted by Joi)
            ...queryParams
        };
        
        // Get docs from the database with filters
        let docs = await paperModel.getScoresWithFilters(filters);

        // Enrich each document with impact classes
        docs = await Promise.all(docs.map(doc => paperModel.enrichWithImpactClasses(doc)));

        // Transform to RA-SKG format using the mapper
        const raSkgData = mapToRaSkgFormat(docs, 'product', filters);

        return {
            meta: {
                count: docs.length,
                page: filters.page,
                page_size: filters.page_size
            },
            results: raSkgData,
        };
    },
};

// Export the controller with automatic logging and stats tracking
module.exports = wrapController(api_reference, controller);
