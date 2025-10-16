const winstonLogger = require('../logger/winstonLogger');
const stats = require('../logger/stats');

/**
 * Wrapper function that automatically logs and tracks stats for controller function calls
 * @param {string} api_reference - The controller name (e.g., "Product_Controller")
 * @param {string} event - The function name (e.g., "getProduct")
 * @param {Function} fn - The controller function to wrap
 * @returns {Function} - Wrapped function with automatic logging and stats
 */
function withLogging(api_reference, event, fn) {

    return async function(...args) {
        const startTime = Date.now();
        
        // Update stats
        stats.update(`${api_reference}/${event}`);

        try {

            // Call the original function
            const result = await fn.apply(this, args);
            
            // Log function success
            winstonLogger.info({
                api_reference: api_reference,
                event: event,
                args: args.length > 0 ? args : undefined,
                timestamp: new Date().toISOString(),
                duration: Date.now() - startTime
            });
            
            return result;
            
        } catch (err) {
            // Log function error
            winstonLogger.error({
                api_reference: api_reference,
                event: event,
                args: args.length > 0 ? args : undefined,
                error: err.message || err,
                timestamp: new Date().toISOString(),
                duration: Date.now() - startTime
            });
            
            console.error(err);

            // Re-throw the error so Hapi can handle it properly
            throw err;
        }
    };
}

/**
 * Apply logging and stats tracking to all functions in a controller object
 * @param {string} api_reference - The controller name
 * @param {Object} controller - The controller object with functions
 * @param {Object} statsPaths - Optional object mapping function names to stats paths
 * @returns {Object} - Controller with wrapped functions
 */
function wrapController(api_reference, controller) {
    const wrappedController = {};

    for (const [functionName, functionBody] of Object.entries(controller)) {
        if (typeof functionBody === 'function') {
            wrappedController[functionName] = withLogging(api_reference, functionName, functionBody);
        } else {
            wrappedController[functionName] = functionBody;
        }
    }
    
    return wrappedController;
}

module.exports = {
    withLogging,
    wrapController
};
