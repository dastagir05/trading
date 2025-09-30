// backend/logger.js
const pino = require("pino");

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    process.env.NODE_ENV === "production"
      ? undefined
      : {
          target: "pino-pretty", // pretty console logs in development
          options: {
            colorize: true,
            translateTime: "yyyy-mm-dd HH:MM:ss",
          },
        },
  base: { pid: false }, // removes process id from logs for cleaner view
});

export default logger;
