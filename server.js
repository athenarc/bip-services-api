/***********************************************************
**************     Author - Mukesh Sharma     **************
**************      Date - 2018/07/22         **************
***********************************************************/

/**
 * Logger file startup
 */
const winstonLogger = require('./modules/logger/winstonLogger.js');

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const AuthBearer = require('hapi-auth-bearer-token');
const Libs = require('./modules/libs/commFunctions')


global.Config = require('./config')
global.Constant = require('./constant')

const Routes = require('./modules/routes')
require('./bootstrap') // Database Initialization

/** 
 * serverSetup function to write all the server bootstraping things in one place
 **/
async function serverSetup() {
    try {   
        
        /** 
         * server host and port configuration for server setup 
         **/
        const serverConfig = Config.serverSetupConfig
        const server = Hapi.server(serverConfig);
        
        await server.register(AuthBearer)

        server.auth.strategy('skelton', 'bearer-access-token', {
            allowQueryToken: true,              // optional, false by default
            validate: async (request, token, h) => {
                const isValid = await Libs.verifyToken(token);
                const credentials = { token };
                let artifacts = {};
                if(isValid){
                    artifacts = isValid.data;
                }
                return { isValid, credentials, artifacts };
            }
        });

        /** 
         * swagger setup for routes documentation 
         **/
        const swaggerOptions = Config.swaggerSetupConfig

        /**
         * registeration of inert and vision as per swagger dependencies.
         **/
        await server.register([
            Inert,
            Vision,
            {
                plugin: HapiSwagger,
                options: swaggerOptions
            }
        ]);

        /**
         * Routes registerations in server
         */
        server.route(Routes);

        /************************
         **** server started ****
         ************************/
        await server.start();
        winstonLogger.info(`Server is running at -------------------------------> ${server.info.uri}`);
    } catch (error) {
        winstonLogger.error(`Unable to start server -----------------------------> ${error.message || error}`);
        /**
         * Shutdown Process if error
         */
        process.exit(1);
    }
}

process.on('uncaughtException', (err) => {
    winstonLogger.error(`uncaught Exception Occurred ------------> ${err.stack || err.message}`);
});
  

serverSetup();


