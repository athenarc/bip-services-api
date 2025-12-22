const Joi = require('joi');
const { ndrController } = require('../../controllers');
const Lib = require('../../libs/commFunctions');
const stats = require('../../logger/stats.js');
const Boom = require('@hapi/boom');

module.exports = [
    {
        method: 'GET',
        path: '/ndr/products/{local_identifier}',
        config: {
            handler: async function (request, h) {
                return ndrController.getProduct(request.params.local_identifier);
            },
            description: 'Get a single product',
            notes: 'Get a single person (type of agent) - See definition in [SKG-IF Research product](https://skg-if.github.io/interoperability-framework/docs/agent.html)',
            tags: ['api', 'NDR - RA-SKG'],
            auth: false,
            validate: {
                params: {
                    local_identifier: Joi.string().required().description("The local identifier that needs to be fetched"),
                },
            }
        },
    },
    {
        method: 'GET',
        path: '/ndr/products',
        config: {
            handler: async function (request, h) {
                return ndrController.getProductsWithFilters(request.query);
            },
            description: 'Get a list of products with filtering and pagination',
            notes: 'Get a list of products with support for filtering by identifiers. Supports pagination.',
            tags: ['api', 'NDR - RA-SKG'],
            auth: false,
            validate: {
                query: Joi.object({                    
                    // Identifier filtering
                    'identifiers.id': Joi.string().description("Filter by identifier value"),
                    'identifiers.scheme': Joi.string().valid('doi', 'dblp').description("Filter by identifier scheme"),
                    
                    // Pagination
                    page: Joi.number().min(1).default(1).description("Page number - default is 1"),
                    page_size: Joi.number().min(1).max(20).default(10).description("Page size (max 20) - default is 10"),
                })
            }
        },
    }
];

