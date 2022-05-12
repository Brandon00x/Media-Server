const { saveToDatabase } = require("../database/savetoDatabase");
const { databaseAction } = require("../database/mongodb");

async function handleSave(property, value) {
  // Try Update First
  let cmd = {
    cmd: "updateOne",
    collection: "Properties",
    key: property,
    data: value,
  };
  let updateProp = await databaseAction(cmd);
  // Save If Update Did not Occur.
  if (updateProp === "notUpdated") {
    saveToDatabase("Properties", property, value);
  }
}

module.exports = { handleSave };
