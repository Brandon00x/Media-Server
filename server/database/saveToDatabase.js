const { databaseAction } = require("../database/mongodb");

async function saveToDatabase(mediaType, data) {
  let cmd = {
    cmd: "createIndex",
    collection: mediaType,
    key: "key",
  };
  // Create Database Index on Key
  await databaseAction(cmd);

  // Save Media Array to DB
  let cmd2 = {
    cmd: "insertOne",
    collection: mediaType,
    key: mediaType,
    data: data,
  };
  await databaseAction(cmd2);
}

module.exports = { saveToDatabase };
