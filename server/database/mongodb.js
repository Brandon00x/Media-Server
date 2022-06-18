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

  // console.log(
  //  `Performing Database Action: ${action} Collection: ${cmd.collection}`
  //);

  const db = client.db(dbName);
  let collection = db.collection(cmd.collection);
  let resultCmd = "done.";

  // Create Index On New Item
  if (action === "createIndex") {
    try {
      collection.createIndex({ [key]: 1 }, { unique: true });
      //console.log(`Created Index on Key: ${key}`);
    } catch (err) {
      console.warn("Create Index Error: ", key, "\n", err);
    }
  }

  // Delete One
  if (action === "deleteOne") {
    collection
      .deleteOne({ key: key })
      .then(() => {
        console.info(`Successfully Deleted Item. Key: ${key}`);
      })
      .catch((e) => {
        console.error(`Unable to delete item. Key: ${key}. Error: ${e}`);
      });
  }

  // Drop Collection
  if (action === "dropCollection") {
    collection
      .drop()
      .then(() => {
        console.info(`Successfully Dropped Collection: ${cmd.collection}`);
      })
      .catch((e) => {
        if (e.code === 26) {
          console.warn(
            `Drop Collection Failure: Collection ${cmd.collection} was not found.`
          );
        } else {
          console.error("Drop Collection Error: ", e.message);
        }
      });
  }

  // Update One Item
  if (action === "updateOne") {
    await collection
      .updateOne({ key: key }, { $set: { data: data } })
      .then((result) => {
        if (result.modifiedCount > 0) {
          console.info(
            `Updated ${key}. Results Modified: ${result.modifiedCount}`
          );
        } else if (result.matchedCount >= 1) {
          // Was Same Value Update
        } else {
          console.warn(`Update did not occur. Key: ${key}.`);
          resultCmd = "notUpdated";
        }
      })
      .catch((err) => {
        console.error(`Unable To Update ${key}. Error: ${err}`);
      });
  }

  // Insert One
  if (action === "insertOne") {
    await collection
      .insertOne({
        key,
        data,
      })
      .then((insertResult) => {
        // console.log("Inserted Data =>", insertResult);
      })
      .catch((err) => {
        if (err.code === 11000) {
          //console.log(`Duplicate Record Not Inserted. ${err}`);
        } else {
          console.error("Insert One Error: ", err);
        }
      });
  }

  // Insert Many
  if (action === "insertMany") {
    const insertResult = await collection.insertMany(data, { unique: true });
    // console.log("Inserted Data =>", insertResult);
  }

  // Search Many by Filter
  if (action === "find") {
    // console.log(`Searching For ${key}: ${data}`);
    const searchResult = await collection.find({ [key]: data }).toArray();
    if (searchResult.length > 0) {
      // console.log(`Search Results => ${searchResult}\n`);
      return searchResult;
    } else {
      resultCmd = `INFO: No Search Results Found for ${key}: ${data}`;
      console.warn(`No Search Results Found for ${key}: ${data}\n`);
    }
  }

  // Search One by Key
  if (action === "findOne") {
    // console.log(`Searching For One Result. Key: ${key}`);
    const searchResult = await collection.find({ key }).toArray();
    if (searchResult.length > 0) {
      // console.log(`Search Results => ${searchResult}\n`);
      return searchResult;
    } else {
      console.warn(`No Search Results Found for ${key}\n`);
    }
  }

  return resultCmd;
}

module.exports = { databaseAction };
