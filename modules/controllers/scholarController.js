const Boom = require('@hapi/boom');
const { wrapController } = require('../libs/controllerWrapper');
const api_reference = "ScholarController";
const scholarModel = require('../models/scholarModel');

// Define the controller functions without logging
const controller = {
    getScholarScores: async function(orcid) {
        return await scholarModel.getScholarScores(orcid);
    }
};

// Export the controller with automatic logging and stats tracking
module.exports = wrapController(api_reference, controller);
