const Joi = require('joi');
const { productController } = require('../../controllers');
const Lib = require('../../libs/commFunctions');
const stats = require('../../logger/stats.js');

module.exports = [
    {
        method: 'GET',
        path: '/ra-skg/products/{local_identifier}',
        config: {
            handler: async function (request, h) {
                // Extract id parameter from the local_identifier URL
                const url = new URL(request.params.local_identifier.trim());
                let id = url.searchParams.get('id');

                if (!id) {
                    id = request.params.local_identifier.trim();
                }

                // patch openaire_id to be compliant with the db values
                // TODO: remove this once the db values are updated
                id = `50|${id}`;
                
                return productController.getProduct(id);
            },
            description: 'Get a single product',
            notes: 'Get a single product - See definition in [SKG-IF Research product](https://skg-if.github.io/interoperability-framework/docs/research-product.html)',
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
        path: '/ra-skg/products',
        config: {
            handler: async function (request, h) {
                // Extract identifiers from query parameter or request body
                const identifiers = request.query.identifiers ? 
                    request.query.identifiers.split(',').map(id => id.trim()) : 
                    [];
                
                if (identifiers.length === 0) {
                    throw Boom.badRequest('Missing identifiers parameter');
                }
                
                // Extract id parameters from all local_identifier URLs
                const ids = identifiers.map(local_identifier => {
                    try {
                        const url = new URL(local_identifier);
                        const id = url.searchParams.get('id');
                        if (!id) {
                            throw new Error(`Missing id parameter in URL: ${local_identifier}`);
                        }
                        return id;
                    } catch (error) {
                        throw new Error(`Invalid URL format: ${local_identifier}`);
                    }
                });
                
                return productController.getProductScoresBatch(ids);
            },
            description: 'Get a list of products',
            notes: 'Get a list of products - See definition in [SKG-IF Research product](https://skg-if.github.io/interoperability-framework/docs/research-product.html)',
            tags: ['api', 'DB - RA-SKG'],
            auth: false,
            // validate: {
            //     params: {
            //         dois: Joi.string().required().description("Comma-separated article DOIs"),
            //     },
            // }
        },
    }
];