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
    },
    {
        method: 'GET',
        path: '/paper/search',
        config: {
            handler: async function (request, h) {
                stats.update('/paper/search')
                return controller.paperController.searchPapers(request.query);
            },
            description: 'Search for articles',
            tags: ['api', 'search', 'ranking scores'],
            auth: false,
            validate: {
                query: {
                    keywords: Joi.string().required().description("Keywords to search"),
                    ordering: Joi.string().valid('popularity', 'influence', 'impulse', 'year').default('popularity').description("Sorting field"),
                    start_year: Joi.number().description("Filter papers published after this year"),
                    end_year: Joi.number().description("Filter papers published before this year"),
                    popularity: Joi.string().valid('all', 'substantial', 'exceptional').description("Filter papers based on their popularity class"),
                    influence: Joi.string().valid('all', 'substantial', 'exceptional').description("Filter papers based on their influence class"),
                    impulse: Joi.string().valid('all', 'substantial', 'exceptional').description("Filter papers based on their impulse class"),
                    page: Joi.number().min(1).default(1).description("Page number"),
                    page_size: Joi.number().min(1).default(20).description("Page size of the requested page"),
                    auth_token: Joi.string().required().description("Authntication token"),
                },
            }
        },
    }
]

module.exports = paper;