const { MongoClient } = require("mongodb");

// Connection URL
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

// Database Name
const dbName = "mediaServer";

// Database Call
// CMD Example Format: { cmd: "find", collection: "music", key: "Album", data: album };
async function databaseAction(cmd) {
  await client.connect();
  let action = cmd.cmd; // Action To Preform
  let key = cmd.key; // Key
  let data = cmd.data; // Data
  try {
    console.info(
      `Performing Database Action: ${action} Collection: ${
        cmd.collection
      }\nKey: ${key} \nData Type: ${typeof data} Data Length: ${data.length}\n`
    );
  } catch (err) {}

  const db = client.db(dbName);
  // Use Collection In Cmd
  let collection = db.collection(cmd.collection);

  if (action === "createIndex") {
    try {
      collection.createIndex({ [key]: 1 }, { unique: true });
      console.info(`Created Index on Key: ${key}`);
    } catch (err) {
      console.warn("Create Index Error: ", key, "\n", err);
    }
  }

  // Insert One
  if (action === "insertOne") {
    try {
      let insertResult = await collection.insertOne({
        key,
        data,
      });
      console.info("Inserted Data =>", insertResult);
    } catch (err) {
      if (err.code === 11000) {
        console.log(`Duplicate Record Not Inserted`);
      } else {
        console.error("Insert One Error: ", err);
      }
    }
  }

  // Insert Many
  if (action === "insertMany") {
    const insertResult = await collection.insertMany(data, { unique: true });
    console.info("Inserted Data =>", insertResult);
  }

  // Search By Filter
  if (action === "find") {
    console.info(`Searching For ${key}: ${data}`);
    const searchResult = await collection.find({ [key]: data }).toArray();
    if (searchResult.length > 0) {
      console.log(`Search Results => ${searchResult}`);
      return searchResult;
    } else {
      console.warn(`No Search Results Found for ${key}`);
    }
  }

  return "done.";
}

module.exports = { databaseAction };
