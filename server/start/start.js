const { handleSave } = require("../save/handleSave");
const { databaseAction } = require("../database/mongodb");
const { saveToDatabase } = require("../database/savetoDatabase");

async function readProps(prop) {
  let cmd = { cmd: "findOne", collection: "Properties", key: prop };
  let propValue = await databaseAction(cmd);
  //console.log(`Read Properties: Property: ${prop}: `, propValue[0].data);
  return propValue[0].data;
}

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

module.exports = { setProps, setServerIp, getPort, readProps };
