const Boom = require('@hapi/boom');
const axios = require('axios');
const { wrapController } = require('../libs/controllerWrapper');
const api_reference = "ScholarController";
var httpProxy = require('http-proxy');
const config = require('../../config/default');

// Define the controller functions without logging
const controller = {
    getScholarScores: async function(orcid) {
        let res = await axios.get(`${config.constants.bipApiBaseUrl}/api/profile`, {
            params: { orcid },
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });
        return res.data;
    }
};

// Export the controller with automatic logging and stats tracking
module.exports = wrapController(api_reference, controller);
