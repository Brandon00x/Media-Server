const fs = require("fs");
function readMedia(mediaType, response) {
  let res = response;
  fs.readFile(`./json/${mediaType}.json`, "utf8", function (err, data) {
    if (err) {
      console.error(`ERROR: Cannot find ${mediaType}.json.`);
      res.send({ message: `No ${mediaType} Found` });
    } else if (data.length > 0) {
      let media = JSON.parse(data);
      console.info(
        `Sending ${mediaType} Information for ${media.length} ${mediaType}\n`
      );
      res.json(media);
      res.end();
    }
  });
}

module.exports = { readMedia };
