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

    getPersonWithFilters: async function(id, params = {}) {
        // This is a placeholder implementation
        // You would implement the actual logic to fetch publications from your data source
        return {
            id: id,
            publications: [],
            message: "RA-SKG person publications endpoint - implementation needed",
            pagination: {
                page: params.page || 1,
                page_size: params.page_size || 20,
                total: 0
            }
        };
    }
};

// Export the controller with automatic logging and stats tracking
module.exports = wrapController(api_reference, controller);

