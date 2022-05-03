const Joi = require('joi');
const controller = require('../controllers');
const Lib = require('../libs/commFunctions');
const stats = require('../logger/stats.js');

const paper = [
    {
        method: 'GET',
        path: '/paper/scores/{doi}',
        config: {
            handler: async function (request, h) {
                stats.update('/paper/scores/')
                return controller.paperController.getPaperScores(request.params.doi.trim());
            },
            description: 'Ranking scores for a single article',
            tags: ['api', 'ranking scores'],
            auth: false,
            validate: {
                params: {
                    doi: Joi.string().required().description("Article DOI"),
                },
            }
        },
    },
    {
        method: 'GET',
        path: '/paper/scores/batch/{dois}',
        config: {
            handler: async function (request, h) {
                stats.update('/paper/scores/batch/')
                return controller.paperController.getPaperScoresBatch(request.params.dois.trim().split(','));
            },
            description: 'Ranking scores for multiple articles',
            notes: 'Maximum of 50 DOIs per request',
            tags: ['api', 'ranking scores'],
            auth: false,
            validate: {
                params: {
                    dois: Joi.string().required().description("Comma-separated article DOIs"),
                },
            }
        },
    }
]

module.exports = paper;