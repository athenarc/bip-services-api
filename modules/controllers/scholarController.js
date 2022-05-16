const { serverUnavailable } = require('boom');
const Boom = require('boom');
const rp = require('request-promise');
const api_reference = "Scholar_Controller";
var httpProxy = require('http-proxy');

module.exports.getScholarScores = async function(orcid) {
    winstonLogger.info({
        api_reference: api_reference,
        event: "/scholar/scores/{orcid}",
        orcid: orcid
    });

    const bipApiBaseUrl = 'https://bip.imis.athena-innovation.gr';
    let options  = {
        url: `${bipApiBaseUrl}/api/profile`,
        qs: {
            orcid
        }, 
        rejectUnauthorized: false,
        json: true,
    };

    try {
        let res = await rp(options);
        return res;
    } catch (err) {
        if (err.error.status == 404) {
            throw Boom.notFound();
        } else {
            winstonLogger.error("Unknown Error for the api ", api_reference, err)
            const err = Boom.expectationFailed("Expected this to work :(");
            throw err;  
        }
    }
}
