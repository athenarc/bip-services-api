/**
 * Utility functions for common operations
 */

/**
 * Extract internal ID from a local_identifier URL
 * @param {string} local_identifier - URL in the form: https://bip.imsi.athenarc.gr/details/25061987
 * @returns {string} The ID extracted from the pathname (last segment after '/')
 */
function getInternalId(local_identifier) {
    const url = new URL(local_identifier.trim());
    // Extract the ID from the pathname (last segment after '/')
    return url.pathname.split('/').filter(part => part).pop();
}

module.exports = {
    getInternalId
};


