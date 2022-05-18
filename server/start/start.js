const { handleSave } = require("../save/handleSave");
const { databaseAction } = require("../database/mongodb");
const { saveToDatabase } = require("../database/savetoDatabase");
const { logger } = require("../logger/logger");

// Get Property from DB
async function readProps(prop) {
  let cmd = { cmd: "findOne", collection: "Properties", key: prop };
  let propValue = await databaseAction(cmd);
  logger.silent(
    `Read Properties: Property: ${prop}. Value: ${propValue[0].data}`
  );
  return propValue[0].data;
}

// Set Property from DB
async function setProps(serverAddress) {
  let apikeybooks = await readProps("apikeybooks");
  let apikeymovie = await readProps("apikeymovie");
  let apikeymusic = await readProps("apikeymusic");
  let booksRootFolder = await readProps("booksRootFolder");
  let moviesRootFolder = await readProps("moviesRootFolder");
  let musicRootFolder = await readProps("musicRootFolder");
  let tvRootFolder = await readProps("tvRootFolder");
  let photoRootFolder = await readProps("photoRootFolder");
  let port = await readProps("port");
  let zoomLevelMusic = await readProps("zoomLevelMusic");
  let zoomLevelOther = await readProps("zoomLevelOther");
  let toggleArtist = await readProps("toggleArtist");
  let toggleAlbum = await readProps("toggleAlbum");
  let toggleScroll = await readProps("toggleScroll");
  let scrollTop = await readProps("scrollTop");
  let scrollBot = await readProps("scrollBot");
  let hideScroll = await readProps("hideScroll");
  let hideAlbum = await readProps("hideAlbum");
  let hideArtist = await readProps("hideArtist");
  let zoomIn = await readProps("zoomIn");
  let zoomOut = await readProps("zoomOut");

  let startObj = {
    keyBooks: apikeybooks,
    keyMovies: apikeymovie,
    keyMusic: apikeymusic,
    folderBooks: booksRootFolder,
    folderMovies: moviesRootFolder,
    folderMusic: musicRootFolder,
    folderTv: tvRootFolder,
    folderPhotos: photoRootFolder,
    port: port,
    address: serverAddress,
    zoomLevelMusic: zoomLevelMusic,
    zoomLevelOther: zoomLevelOther,
    toggleArtist: toggleArtist,
    toggleAlbum: toggleAlbum,
    toggleScroll: toggleScroll,
    scrollTop: scrollTop,
    scrollBot: scrollBot,
    hideScroll: hideScroll,
    hideAlbum: hideAlbum,
    hideArtist: hideArtist,
    zoomIn: zoomIn,
    zoomOut: zoomOut,
  };
  return startObj;
}

// Set Server LAN IP for Clients
function setServerIp() {
  let address = Object.values(require("os").networkInterfaces())
    .flat()
    .filter(({ family, internal }) => family === "IPv4" && !internal)
    .map(({ address }) => address);

  // Filter VPN Lan Addresses - Use First Address.
  if (address.length > 1) {
    address = address[0];
  }
  handleSave("IP Address", address.toString());
  return address.toString();
}

// Set Server Port
async function getPort() {
  let port = await readProps("port");
  if (port === undefined) {
    port = 3020;
    saveToDatabase("Properties", "port", port);
    return port;
  } else {
    saveToDatabase("Properties", "port", port);
    return port;
  }
}

// Confirm Default Properties have Values - If not set them.
async function checkPropertiesFirstRun(serverAddress) {
  logger.silent("Confirming Default Properties have Values.");
  let props = await setProps(serverAddress);

  let defaultProps = {
    zoomLevelMusic: 4,
    zoomLevelOther: 5,
    toggleArtist: false,
    toggleAlbum: false,
    toggleScroll: false,
    scrollTop: 6,
    scrollBot: 7,
    hideScroll: 3,
    hideAlbum: 4,
    hideArtist: 5,
    zoomIn: 2,
    zoomOut: 1,
  };

  // Loop Through Props and Compare.
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) {
      let undefinedValue = key;
      for (const [key, value] of Object.entries(defaultProps)) {
        if (undefinedValue === key) {
          logger.warn(
            `Undefined Default Property: ${key} found. Updated Property: ${key}. New Value: ${value}`
          );
          let cmd = {
            cmd: "insertOne",
            collection: "Properties",
            key: key,
            data: value,
          };
          // Update Undefined Property to Default Value
          databaseAction(cmd);
        }
      }
    }
  }
}

module.exports = {
  setProps,
  setServerIp,
  getPort,
  readProps,
  checkPropertiesFirstRun,
};
