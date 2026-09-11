const axios = require('axios');
const https = require('https');
const { wrapController } = require('../libs/controllerWrapper');
const database = require('../databaseInteractions');
const config = require('../../config/default');

const api_reference = 'HealthController';
const CHECK_TIMEOUT_MS = 5000;

async function checkMysql() {
    const start = Date.now();
    try {
        await database.executeSQLQuery('SELECT 1 AS ok');
        return {
            status: 'up',
            latencyMs: Date.now() - start
        };
    } catch (err) {
        return {
            status: 'down',
            latencyMs: Date.now() - start,
            error: err.message || String(err)
        };
    }
}

async function checkBipApi() {
    const baseUrl = config.constants.bipApiBaseUrl;
    if (!baseUrl) {
        return {
            status: 'skipped',
            reason: 'BIP_API_BASE_URL not configured'
        };
    }

    const start = Date.now();
    try {
        await axios.get(baseUrl, {
            timeout: CHECK_TIMEOUT_MS,
            validateStatus: () => true,
            httpsAgent: new https.Agent({ rejectUnauthorized: false })
        });
        return {
            status: 'up',
            latencyMs: Date.now() - start
        };
    } catch (err) {
        return {
            status: 'down',
            latencyMs: Date.now() - start,
            error: err.message || String(err)
        };
    }
}

const controller = {
    getHealth: async function () {
        const [mysql, bipApi] = await Promise.all([
            checkMysql(),
            checkBipApi()
        ]);

        const checks = { mysql, bipApi };
        const requiredChecks = Object.values(checks).filter(
            (check) => check.status !== 'skipped'
        );
        const allUp = requiredChecks.every((check) => check.status === 'up');

        return {
            status: allUp ? 'ok' : 'error',
            timestamp: new Date().toISOString(),
            checks
        };
    }
};

module.exports = wrapController(api_reference, controller);
