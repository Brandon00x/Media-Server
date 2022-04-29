const fs = require("fs");

function changePort(port, res) {
  try {
    let number = port.toString();
    fs.writeFile("./private/port.txt", number, function (err) {
      if (err) {
        console.error("Error: Unable to write file port.txt for server");
      } else {
        res.end();
      }
    });
    fs.writeFile("../src/port.txt", number, function (err) {
      if (err) {
        console.error("Error: Unable to write file port.txt for client.", err);
      } else {
        res.write(
          `SUCCESS: Changed Port to ${port}. Port will change on restart.\n`
        );
        console.info("Success: Saved Port Change.");
      }
    });
  } catch (err) {
    console.error("Error: Failed to change Port: ", err);
  }
}

async function getPort() {
  return new Promise((resolve, reject) => {
    fs.readFile("./private/port.txt", "utf8", function (err, data) {
      if (err) {
        console.error(`Error: Unable to read Port.`);
        reject(err);
      } else {
        let port = parseInt(data);
        resolve(port);
      }
    });
  });
}

module.exports = { changePort, getPort };
