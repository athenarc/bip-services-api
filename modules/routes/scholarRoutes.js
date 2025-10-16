const Joi = require('joi');
const controller = require('../controllers');
const stats = require('../logger/stats.js');

module.exports = [
    {
        method: 'GET',
        path: '/scholar/scores/{orcid}',
        config: {
            handler: async function (request, h) {
                return controller.scholarController.getScholarScores(request.params.orcid.trim());
            },
            description: 'Researcher-level indicators',
            tags: ['api', 'Citation-based impact indicators'],
            auth: false,
            validate: {
                params: {
                    orcid: Joi.string().required().description("Scholar ORCiD"),
                },
            }
        },
    },
];