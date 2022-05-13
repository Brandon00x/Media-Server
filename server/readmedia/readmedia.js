const { databaseAction } = require("../database/mongodb");

// Get Media Data from Database
async function readMedia(mediaType, res) {
  console.log(mediaType);
  let cmd = { cmd: "find", collection: mediaType, key: "key", data: mediaType };
  let media = await databaseAction(cmd);
  if (media.includes("INFO:")) {
    res.send({ message: `No ${mediaType} Found` });
  } else {
    let sendData = media[0].data;
    res.json(sendData);
  }
}

module.exports = { readMedia };
