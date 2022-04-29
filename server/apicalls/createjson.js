const fs = require("fs");

async function createJson(fileName, fileData, response) {
  try {
    let res = response;
    fs.writeFile(`./json/${fileName}`, fileData, function (err) {
      if (err) {
        res.write(`${counter++}: Error Writing ${fileName}. Error: ${err}\n`);
        console.error(`ERROR: unable to create ${fileName}. Error: ${err}`);
      } else {
        //res.write(`INFO: Created file: ${fileName}\n`);
        console.log(`Created ${fileName}\n`);
      }
    });
  } catch (err) {
    console.log(`ERROR: In createJson ${err}`);
  }
}

module.exports = { createJson };
