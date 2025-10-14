const fs = require('fs');
const winston = require('winston');
const WinstonRotateFile = require('winston-daily-rotate-file');

const logDir = 'log';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// converts the date object to local time string
const tsFormat = () => (new Date()).toLocaleTimeString();

const transports = [];

// If you want to use winstonLogger for your console.
if (process.env.NODE_ENV !== 'live') {
  // colorize the output to the console
  // winston console only if not production
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          // Handle objects properly
          const msg = typeof message === 'object' ? JSON.stringify(message) : message;
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} ${level}: ${msg} ${metaStr}`;
        })
      ),
      level: 'info', // level of log
    })
  );
}

// If you want to use winstonLogger to create log files.
if(process.env.NODE_ENV === 'live') {
  // generates the log files
  transports.push(
    new WinstonRotateFile({
      filename: `${logDir}/-results.log`, // filename to be created
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
      ),
      datePattern: 'yyyy-MM-dd',
      prepend: true, // prepends date to name of file
      level: 'info', // level of log
    })
  );
}
// winston logger to generate logs
global.winstonLogger = winston.createLogger({
  transports,
});
