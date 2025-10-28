const Boom = require('@hapi/boom');
const { wrapController } = require('../../libs/controllerWrapper');
const { mapToRaSkgFormat } = require('../../libs/raSkgMapper');
const api_reference = "PersonController";
const scholarModel = require('../../models/scholarModel');
const { getInternalId } = require('../../libs/utils');

// Define the controller functions without logging
const controller = {
    getPerson: async function(local_identifier) {
        // Extract id from the local_identifier URL
        const id = getInternalId(local_identifier);

        let res = await scholarModel.getResearcher(id);

        if (!res || res.length === 0) {
            throw Boom.notFound();
        }

        res = res[0];

        let doc = await scholarModel.getScholarScores(res.orcid);

        return mapToRaSkgFormat({...res, ...doc}, 'person', {});
    },

    getPersonWithFilters: async function(queryParams) {
        // Process query parameters - Joi already handled all the validation and conversion
        const filters = {
            // Pass through all query parameters as-is (they're already validated and converted by Joi)
            ...queryParams
        };
        
        // Get docs from the database with filters
        let docs = await scholarModel.getResearchersWithFilters(filters);
        
        // Transform to RA-SKG format using the mapper
        const raSkgData = mapToRaSkgFormat(docs, 'person', filters);

        return {
            meta: {
                page: filters.page,
                page_size: filters.page_size
            },
            results: raSkgData,
        };
    }
};

// Export the controller with automatic logging and stats tracking
module.exports = wrapController(api_reference, controller);

