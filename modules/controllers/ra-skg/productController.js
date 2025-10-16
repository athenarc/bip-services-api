const Boom = require('@hapi/boom');
const axios = require('axios');
const { wrapController } = require('../../libs/controllerWrapper');
const api_reference = "ProductController";
const config = require('../../../config/default');

// Define the controller functions without logging
const controller = {
    getProduct: async function(id) {
       return "Test";
    },

    getProductScoresBatch: async function(ids) {
        let res = await axios.get(`${config.constants.bipApiBaseUrl}/api/paper/scores/batch/${ids.join(',')}`, {
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });
        return res.data;
    },

    searchProducts: async function(params) {
        let res = await axios.get(`${config.constants.bipApiBaseUrl}/api/paper/search`, {
            params: params,
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });
        return res.data;
    }
};

// Export the controller with automatic logging and stats tracking
module.exports = wrapController(api_reference, controller);
