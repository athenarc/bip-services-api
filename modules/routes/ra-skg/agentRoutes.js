const Joi = require('joi');
const controller = require('../../controllers/index.js');
const stats = require('../../logger/stats.js');

module.exports = [
    {
        method: 'GET',
        path: '/ra-skg/agents/{local_identifier}',
        config: {
            handler: async function (request, h) {
                // Extract id parameter from the local_identifier URL
                const local_identifier = request.params.local_identifier.trim();
                const url = new URL(local_identifier);
                const id = url.searchParams.get('id');
                
                if (!id) {
                    throw Boom.badRequest('Missing id parameter in local_identifier URL');
                }
                
                return controller.agentRaSkgController.getAgentScores(id);
            },
            description: 'Get agent scores (ra-skg)',
            notes: 'Enhanced agent endpoint with ra-skg specific metrics',
            tags: ['api', 'DB - RA-SKG'],
            auth: false,
            validate: {
                params: {
                    local_identifier: Joi.string().uri().required().description("Agent local identifier"),
                },
            }
        },
    },
    {
        method: 'GET',
        path: '/ra-skg/agents',
        config: {
            handler: async function (request, h) {
                // This route should probably get local_identifier from query params or request body
                const local_identifier = request.query.local_identifier;
                
                if (!local_identifier) {
                    throw Boom.badRequest('Missing local_identifier parameter');
                }
                
                // Extract id parameter from the local_identifier URL
                const url = new URL(local_identifier);
                const id = url.searchParams.get('id');
                
                if (!id) {
                    throw Boom.badRequest('Missing id parameter in local_identifier URL');
                }
                
                return controller.agentRaSkgController.getAgentPublications(id, request.query);
            },
            description: 'Get agent publications (ra-skg)',
            notes: 'Enhanced publications endpoint with pagination',
            tags: ['api', 'DB - RA-SKG'],
            auth: false,
            validate: {
                // params: {
                //     local_identifier: Joi.string().required().description("Agent local identifier"),
                // },
                query: {
                    page: Joi.number().min(1).default(1).description("Page number"),
                    page_size: Joi.number().min(1).max(100).default(20).description("Page size"),
                },
            }
        },
    },
];
