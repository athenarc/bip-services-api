/**
 * Utility functions for common operations
 */

/**
 * Extract internal ID from a local_identifier
 * Handles two formats:
 * 1. NDR format: otf___1730027051396___person-1 (returns "person-1")
 * 2. URL format: https://bip.imsi.athenarc.gr/details/25061987 (returns "25061987")
 * @param {string} local_identifier - Identifier in NDR format or URL format
 * @returns {string} The ID extracted from the identifier
 */
function getInternalId(local_identifier) {
    const trimmed = local_identifier.trim();
    
    // Check if it's in NDR format (contains ___)
    if (trimmed.includes('___')) {
        // Split by ___ and get the last segment
        const parts = trimmed.split('___');
        return parts[parts.length - 1];
    }
    
    // Otherwise, treat as URL and extract from pathname
    try {
        const url = new URL(trimmed);
        // Extract the ID from the pathname (last segment after '/')
        return url.pathname.split('/').filter(part => part).pop();
    } catch (e) {
        // If it's not a valid URL, return as-is
        return trimmed;
    }
}

module.exports = {
    getInternalId
};


