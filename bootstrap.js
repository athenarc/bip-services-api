const MYSQL = require('mysql');

// load env variables
const dotenv = require('dotenv');
dotenv.config();

var db_config = {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
    database: process.env.MYSQL_DBNAME,
    port: process.env.MYSQL_PORT,
    multipleStatements: true
};
function initializeConnectionPool(db_config){
    var numConnectionsInPool = 0;
    console.log('CALLING INITIALIZE POOL');
    
    var conn = MYSQL.createPool(db_config);
    conn.on('connection', function (connection) {
        numConnectionsInPool++;
        console.log('NUMBER OF CONNECTION IN POOL : ', numConnectionsInPool);
    });
    return conn;
}


global.connection = initializeConnectionPool(db_config);
