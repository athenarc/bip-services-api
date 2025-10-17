const Joi = require('joi');
const { productController } = require('../../controllers');
const Lib = require('../../libs/commFunctions');
const stats = require('../../logger/stats.js');
const Boom = require('@hapi/boom');

module.exports = [
    {
        method: 'GET',
        path: '/ra-skg/products/{local_identifier}',
        config: {
            handler: async function (request, h) {
                return productController.getProduct(request.params.local_identifier);
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
                return productController.getProductsWithFilters(request.query);
            },
            description: 'Get a list of products with filtering and pagination',
            notes: 'Get a list of products with support for filtering by product_type, identifiers, ra_metrics, and value thresholds. Supports pagination.',
            tags: ['api', 'DB - RA-SKG'],
            auth: false,
            validate: {
                query: Joi.object({
                    
                    // Product filtering
                    product_type: Joi.string().valid('literature', 'research data', 'research software', 'other').description("Filter by product type"),
                    
                    // Identifier filtering
                    'identifiers.id': Joi.string().description("Filter by identifier value"),
                    'identifiers.scheme': Joi.string().valid('doi', 'pmid', 'pmcid').description("Filter by identifier scheme"),
                    
                    // RA Metrics class filtering
                    'ra_metrics.ra_metric.ra_measure.class': Joi.string().uri().description("Filter by ra_measure class URI"),
                    'ra_metrics.ra_metric.ra_category.class': Joi.string().uri().description("Filter by ra_category class URI"),

                    // RA Metrics labels filtering
                    'ra_metrics.ra_metric.ra_measure.labels': Joi.string().description("Filter by ra_measure labels (partial match)"),
                    'ra_metrics.ra_metric.ra_category.labels': Joi.string().description("Filter by ra_category labels (partial match)"),
                    
                    // Value filtering
                    'cf.min.ra_metrics.ra_metric.ra_value': Joi.number().min(0).description("Minimum threshold for metric value"),
                    'cf.max.ra_metrics.ra_metric.ra_value': Joi.number().min(0).description("Maximum threshold for metric value"),

                    // Pagination
                    page: Joi.number().min(1).default(1).description("Page number - default is 1"),
                    page_size: Joi.number().min(1).max(100).default(10).description("Page size (max 100) - default is 10"),
                }).custom((value, helpers) => {
                    // Custom validation: require ra_metrics.ra_metric.ra_measure.class when min/max values are provided
                    const hasMinValue = value['cf.min.ra_metrics.ra_metric.ra_value'] !== undefined;
                    const hasMaxValue = value['cf.max.ra_metrics.ra_metric.ra_value'] !== undefined;
                    const hasMeasureClass = value['ra_metrics.ra_metric.ra_measure.class'] !== undefined;
                    
                    if ((hasMinValue || hasMaxValue) && !hasMeasureClass) {
                        return helpers.error('custom.valueFilterRequiresMeasureClass');
                    }
                    
                    return value;
                }).messages({
                    'custom.valueFilterRequiresMeasureClass': 'ra_metrics.ra_metric.ra_measure.class is required when using cf.min.ra_metrics.ra_metric.ra_value or cf.max.ra_metrics.ra_metric.ra_value'
                })
            }
        },
    }
];