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
                return personController.getPersonWithFilters(request.query);
            },
            description: 'Get a list of persons with filtering and pagination',
            notes: 'Get a list of persons with support for filtering by identifiers, ra_metrics. Supports pagination.',
            tags: ['api', 'DB - RA-SKG'],
            auth: false,
            validate: {
                query: Joi.object({
                    
                    // Identifier filtering
                    'identifiers.id': Joi.string().description("Filter by identifier value"),
                    'identifiers.scheme': Joi.string().valid('orcid').description("Filter by identifier scheme"),
                    
                    // RA Metrics class filtering
                    'ra_metrics.ra_metric.ra_measure.class': Joi.string().uri().description("Filter by ra_measure class URI"),
                    'ra_metrics.ra_metric.ra_category.class': Joi.string().uri().description("Filter by ra_category class URI"),

                    // RA Metrics labels filtering
                    'ra_metrics.ra_metric.ra_measure.labels': Joi.string().description("Filter by ra_measure labels (partial match)"),
                    'ra_metrics.ra_metric.ra_category.labels': Joi.string().description("Filter by ra_category labels (partial match)"),
                    
                    // Pagination
                    page: Joi.number().min(1).default(1).description("Page number - default is 1"),
                    page_size: Joi.number().min(1).max(20).default(10).description("Page size (max 20) - default is 10"),
                })
            }
        },
    },
];

