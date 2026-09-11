const { healthController } = require('../controllers');

module.exports = [
    {
        method: 'GET',
        path: '/health',
        config: {
            handler: async function (request, h) {
                const result = await healthController.getHealth();
                const statusCode = result.status === 'ok' ? 200 : 503;
                return h.response(result).code(statusCode);
            },
            description: 'Health check including dependency status',
            notes: 'Checks MySQL connectivity and the external BIP API when configured. Returns 503 if any required dependency is down.',
            tags: ['api', 'Health'],
            auth: false
        }
    }
];
