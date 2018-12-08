const { createLogger, format, transports } = require('winston');

const { combine, timestamp, json } = format;

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    json(),
  ),
  colorize: true,
  transports: [
    new transports.Console(),
  ],
});

module.exports = { logger };
