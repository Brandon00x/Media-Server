const { databaseAction } = require("../database/mongodb");

async function saveToDatabase(collection, key, data) {
  // Create Database Index on Key
  let cmd = {
    cmd: "createIndex",
    collection: collection,
    key: "key",
  };
  await databaseAction(cmd);

  // Save Data to DB
  let cmd2 = {
    cmd: "insertOne",
    collection: collection,
    key: key,
    data: data,
  };
  await databaseAction(cmd2);
}

module.exports = { saveToDatabase };
