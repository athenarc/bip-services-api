const Joi = require('joi');
const controller = require('../controllers');
const stats = require('../logger/stats.js');

const scholar = [
    {
        method: 'GET',
        path: '/scholar/scores/{orcid}',
        config: {
            handler: async function (request, h) {
                stats.update('/scholar/scores/');
                return controller.scholarController.getScholarScores(request.params.orcid.trim());
            },
            description: 'Researcher-level indicators',
            tags: ['api', 'researcher-level indicators'],
            auth: false,
            validate: {
                params: {
                    orcid: Joi.string().required().description("Scholar ORCiD"),
                },
            }
        },
    },
]


module.exports = scholar;