const Joi = require('joi');
const { personController } = require('../../controllers/index.js');
const stats = require('../../logger/stats.js');
const Boom = require('@hapi/boom');

module.exports = [
    {
        method: 'GET',
        path: '/ra-skg/persons/{local_identifier}',
        config: {
            handler: async function (request, h) {          
                return personController.getPerson(request.params.local_identifier);
            },
            description: 'Get a single person',
            notes: 'Get a single person (type of agent) - See definition in [SKG-IF Research product](https://skg-if.github.io/interoperability-framework/docs/agent.html)',
            tags: ['api', 'DB - RA-SKG'],
            auth: false,
            validate: {
                params: {
                    local_identifier: Joi.string().uri().required().description("The local identifier that needs to be fetched"),
                },
            }
        },
    },
    {
        method: 'GET',
        path: '/ra-skg/persons',
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
                
                return controller.personController.getPersonWithFilters(id, request.query);
            },
            description: 'Get person publications (ra-skg)',
            notes: 'Enhanced publications endpoint with pagination',
            tags: ['api', 'DB - RA-SKG'],
            auth: false,
            validate: {
                query: {
                    page: Joi.number().min(1).default(1).description("Page number"),
                    page_size: Joi.number().min(1).max(100).default(20).description("Page size"),
                },
            }
        },
    },
];

