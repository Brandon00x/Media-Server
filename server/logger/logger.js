const { databaseAction } = require("../database/mongodb");

// Insert Log
const logger = {
  // Log Type INFO:
  info: function (msg, info) {
    let data;
    if (msg === undefined) {
      data = { Debug: info };
    } else if (info === undefined) {
      data = { INFO: msg };
    } else {
      data = { INFO: msg, Debug: info };
    }
    const logInfo = {
      cmd: "insertOne",
      collection: "logs",
      key: "Info",
      data: data,
    };
    console.log(data);
    databaseAction(logInfo);
  },

  // Log Type Silent (No Console Output)
  silent: function (msg, info) {
    let data;
    if (msg === undefined) {
      data = { Debug: info };
    } else if (info === undefined) {
      data = { SILENT: msg };
    } else {
      data = { SILENT: msg, Debug: info };
    }
    const logInfo = {
      cmd: "insertOne",
      collection: "logs",
      key: "Silent",
      data: data,
    };
    databaseAction(logInfo);
  },

  // Log Type WARNING:
  warn: function (msg, warn) {
    let data;
    if (msg === undefined) {
      data = { Debug: warn };
    } else if (warn === undefined) {
      data = { WARN: msg };
    } else {
      data = { WARN: msg, Debug: warn };
    }
    const logWarn = {
      cmd: "insertOne",
      collection: "logs",
      key: "Warning",
      data: data,
    };
    console.log("\x1b[33m", data);
    databaseAction(logWarn);
  },

  // Log Type ERROR:
  error: function (msg, error) {
    let data;
    if (msg === undefined) {
      data = { Debug: error };
    } else if (error === undefined) {
      data = { ERROR: msg };
    } else {
      data = { ERROR: msg, Debug: error };
    }
    const logError = {
      cmd: "insertOne",
      collection: "logs",
      key: "Error",
      data: data,
    };
    console.log("\x1b[31m", data);
    databaseAction(logError);
  },
};

module.exports = { logger };
