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
                const id = url.searchParams.get('id');

                if (!id) {
                    throw Boom.badRequest('Missing id parameter in local_identifier');
                }

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
    },
    // {
    //     method: 'GET',
    //     path: '/paper/search',
    //     config: {
    //         handler: async function (request, h) {
    //             stats.update('/paper/search')
    //             return controller.paperController.searchPapers(request.query);
    //         },
    //         description: 'Search for articles in the BIP! database',
    //         notes: 'This endpoint requires a valid authentication token',
    //         tags: ['api', 'impact indicators'],
    //         auth: false,
    //         validate: {
    //             query: {
    //                 keywords: Joi.string().required().description("Keywords to search"),
    //                 rcsb_id: Joi.string().description("RCSB Identifier"),
    //                 ordering: Joi.string().valid('popularity', 'influence', 'citation_count', 'impulse', 'year').default('popularity').description("Sorting field"),
    //                 start_year: Joi.number().description("Filter papers published after this year"),
    //                 end_year: Joi.number().description("Filter papers published before this year"),
    //                 popularity: Joi.string().valid('all', 'top001', 'top01', 'top1', 'top10').description("Filter papers based on their popularity class"),
    //                 influence: Joi.string().valid('all', 'top001', 'top01', 'top1', 'top10').description("Filter papers based on their influence class"),
    //                 cc: Joi.string().valid('all', 'top001', 'top01', 'top1', 'top10').description("Filter papers based on their citation count class"),                    
    //                 impulse: Joi.string().valid('all', 'top001', 'top01', 'top1', 'top10').description("Filter papers based on their impulse class"),
    //                 page: Joi.number().min(1).default(1).description("Page number"),
    //                 page_size: Joi.number().min(1).default(20).description("Page size of the requested page"),
    //                 auth_token: Joi.string().required().description("Authntication token"),
    //             },
    //         }
    //     },
    // }
];