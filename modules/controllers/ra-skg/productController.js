const Boom = require('@hapi/boom');
const axios = require('axios');
const { wrapController } = require('../../libs/controllerWrapper');
const { mapToRaSkgFormat } = require('../../libs/raSkgMapper');
const api_reference = "ProductController";
const paperModel = require('../../models/paperModel');

// Define the controller functions without logging
const controller = {
    getProduct: async function(local_identifier) {
        // Extract id from the local_identifier URL
        // local_identifier is in the form: https://bip.imsi.athenarc.gr/details/25061987
        const url = new URL(local_identifier.trim());
        
        // Extract the ID from the pathname (last segment after '/')
        const id = url.pathname.split('/').filter(part => part).pop();
        
        let docs = await paperModel.getScores(id, 'local_identifier');
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
                page: filters.page,
                page_size: filters.page_size
            },
            results: raSkgData,
        };
    },
};

// Export the controller with automatic logging and stats tracking
module.exports = wrapController(api_reference, controller);
