const { databaseAction } = require("../database/mongodb");

async function readTvSeason(show, res) {
  try {
    let cmd = {
      cmd: "find",
      collection: "TV Shows",
      key: "key",
      data: show,
    };
    let media = await databaseAction(cmd);
    res.json(media);
    return;
  } catch (err) {
    console.error(`Error Sending Season Data for show: ${show}. Error: ${err}`);
  }
}

module.exports = { readTvSeason };
