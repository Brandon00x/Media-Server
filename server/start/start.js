//TODO: Make this with Database Later
const fs = require("fs");

let propsObj = [];

async function readProps(prop) {
  return new Promise((resolve, reject) => {
    fs.readFile(`./private/${prop}.txt`, "utf8", function (err, data) {
      if (err) {
        reject(err);
      } else {
        // console.log(`PROP ${prop}: ${data}`);
        propsObj.push({ prop: data });
        resolve(data);
      }
    });
  });
}

module.exports = { readProps };
