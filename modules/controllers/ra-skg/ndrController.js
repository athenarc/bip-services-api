const Boom = require('@hapi/boom');
const { wrapController } = require('../../libs/controllerWrapper');
const { mapToRaSkgFormat } = require('../../libs/raSkgMapper');
const { getInternalId } = require('../../libs/utils');
const api_reference = "NdrController";
const ndrModel = require('../../models/ndrModel');

// Define the controller functions without logging
const controller = {
    getProduct: async function(local_identifier) {
        // Extract id from the local_identifier
        const id = getInternalId(local_identifier);
        
        let doc = await ndrModel.getProductById(id);
        if(!doc){
            throw Boom.notFound();
        }

        return mapToRaSkgFormat(doc, 'product', {});
    },

    getProductsWithFilters: async function(queryParams) {
        // Process query parameters - Joi already handled all the validation and conversion
        const filters = {
            // Pass through all query parameters as-is (they're already validated and converted by Joi)
            ...queryParams
        };
        
        // Get docs from the database with filters
        let docs = await ndrModel.getProductsWithFilters(filters);

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

