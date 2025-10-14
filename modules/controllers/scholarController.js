const Boom = require('@hapi/boom');
const axios = require('axios');
const api_reference = "Scholar_Controller";
var httpProxy = require('http-proxy');

module.exports.getScholarScores = async function(orcid) {
    winstonLogger.info({
        api_reference: api_reference,
        event: "/scholar/scores/{orcid}",
        orcid: orcid
    });

    const bipApiBaseUrl = 'https://bip.imis.athena-innovation.gr';

    try {
        let res = await axios.get(`${bipApiBaseUrl}/api/profile`, {
            params: { orcid },
            httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
        });
        return res.data;
    } catch (err) {
        if (err.response?.status == 404) {
            throw Boom.notFound();
        } else {
            winstonLogger.error(`Unknown Error for the api ${api_reference}: ${err.message || err}`)
            throw Boom.expectationFailed("Expected this to work :(");
        }
    }
}
