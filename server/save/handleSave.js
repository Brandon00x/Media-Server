const fs = require("fs");
const properties = require("../private/properties");
const { changePort } = require("../port/port");

async function handleSave(property, value, response) {
  let res = response;
  if (Object.keys(properties.properties).includes(property) === true) {
    writeToTxt(property, value, res);
  } else {
    console.error(`Error: Property: ${property}, Value: ${value} are invalid.`);
    res.write(
      `Error: Property: ${property} and Value: ${value} are invalid.\n`
    );
  }
}

//Todo: Replace Later With Database...
function writeToTxt(prop, value, res) {
  if (prop === "port") {
    changePort(value, res);
  } else {
    fs.writeFile(`./private/${prop}.txt`, value, function (err) {
      if (err) {
        console.error(`Error: Unable to create file: ${err}`);
      } else {
        console.info(
          `Successfully updated Proptery: ${prop} with Value: ${value}\n`
        );
        res.write(
          `Successfully updated Proptery: ${prop} with Value: ${value}\n`
        );
        res.end();
      }
    });
  }
}

module.exports = { handleSave };
