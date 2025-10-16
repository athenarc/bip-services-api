const Boom = require('@hapi/boom');
const axios = require('axios');
const { wrapController } = require('../../libs/controllerWrapper');
const api_reference = "AgentController";
const config = require('../../../config/default');

// Define the controller functions without logging
const controller = {
    getAgentScores: async function(id) {
        let res = await axios.get(`${config.constants.bipApiBaseUrl}/api/profile`, {
            params: { orcid: id },
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });
        return res.data;
    },

    getAgentPublications: async function(id, params = {}) {
        // This is a placeholder implementation
        // You would implement the actual logic to fetch publications from your data source
        return {
            id: id,
            publications: [],
            message: "RA-SKG agent publications endpoint - implementation needed",
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
