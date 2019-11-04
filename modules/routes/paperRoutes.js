
const Joi = require('joi');
const controller = require('../controllers');
const Lib = require('../libs/commFunctions')
const paper = [
    {
        method: 'GET',
        path: '/paper/{doi}',
        config: {
            handler: async function (request, h) {
                return controller.paperController.getPaperScores(request.params.doi);
            },
            description: 'Ranking scores for an article',
            tags: ['api', 'ranking scores'],
            auth: false,
            validate: {
                params: {
                    doi: Joi.string().required().description("Article DOI"),
                },
            }
        },
    },
    {
        method: 'POST',
        path: '/paper/access_token_login',
        config: {
            handler: async function (request, h) {
                let accessTokenData = request.auth.artifacts;
                let accessToken = request.auth.credentials.token
                return controller.adminController.accessTokenLogin(accessToken, accessTokenData);
            },
            description: 'Admin Login via access token',
            notes: 'Admin Login api',
            tags: ['api', 'Admin'],
            auth:{
                strategy: 'skelton'
            },
            validate: {
                headers: Lib.authorizationHeaderObj
            }
        },
    }
]


module.exports = paper