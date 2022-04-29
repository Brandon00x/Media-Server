const fs = require("fs");

async function readTvSeason(show, res) {
  try {
    fs.readFile(`./json/localtvshows.json`, "utf8", function (err, data) {
      if (err) {
        console.error(`ERROR: Cannot find localtvshows.json.`);
        res.send({ message: `No Season Data Found` });
      } else if (data.length > 0) {
        let media = JSON.parse(data);
        let seasons;

        for (let i = 0; i < media.length; i++) {
          if (
            show.toLowerCase().includes(media[i].name.toLowerCase()) &&
            media[i].name !== ""
          ) {
            console.info(`Sending Season Information for show: ${show}`);
            seasons = media[i].content;
            res.json(seasons);
            return;
          }
        }
      }
    });
  } catch (err) {
    console.error(`Error Sending Season Data for show: ${show}. Error: ${err}`);
  }
}

module.exports = { readTvSeason };
