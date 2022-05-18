const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs");
const exec = require("child_process").exec;
const { startScan } = require("./scanmedia/scanmedia");
const { handleSave } = require("./save/handleSave");
const {
  setProps,
  setServerIp,
  getPort,
  checkPropertiesFirstRun,
} = require("./start/start");
const { getMediaInfo } = require("./apicalls/apicall");
const { readBook } = require("./readmedia/readbook");
const { readTvSeason } = require("./readmedia/readtvseason");
const { databaseAction } = require("./database/mongodb");
const { missingMedia } = require("./missingmedia/missingmedia");
const { logger } = require("./logger/logger");

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
app.use(express.json());
app.use(cors());

let videoSreamPath;
let musicStreamPath;
let serverAddress;

// Sends Properties, Keys, and Folder Locations
app.get("/api/props", cors(corsOptions), async function (req, res) {
  try {
    logger.silent(`Route Get Request for /props`);
    let startObj = await setProps(serverAddress);
    res.send(startObj);
  } catch (err) {
    logger.error(`Error Sending Properties Data: ${err}`);
  }
});

// Save Properties, Folders, API Keys, or PORT Change.
app.post("/api/save", cors(corsOptions), async function (req, res) {
  let property = req.body.property;
  let data = req.body.data;
  handleSave(property, data, res);
  logger.info(
    `Route Post Request for /save.  Success: Saved Propterty: ${property}. Data: ${data}`
  );
  res.send(`Success: Saved Propterty: ${property}. Data: ${data}`);
});

// Scan local media (books, movies, music) then call API for each one to update.
app.post("/api/update", cors(corsOptions), async function (req, res) {
  try {
    logger.silent("Route Post Request /update.");
    let mediaCategory = await req.body.type;
    let mediaPath = await req.body.path;

    // Scan | Find Local Media
    let mediaData = await startScan(res, mediaCategory, mediaPath);

    // API Call | Get Metadata Information for Media
    if (mediaData.length > 0 && mediaCategory !== "updatephotos") {
      logger.info(
        `Local Media Scan Complete. Found ${mediaData.length} items. Starting API calls for ${mediaCategory}.`
      );
      let isSingle = false;
      await getMediaInfo(res, mediaCategory, isSingle);
    }
    // API Found 0 Results
    else if (mediaData.length === 0) {
      res.write(
        `INFO: Found 0 local media items. Please check your directory and read the information section.\n`
      );
    }
    res.end();
  } catch (err) {
    logger.error(`Error: Unable to finish scan request: ${err}`);
    res.end();
  }
});

// Send Missing Media Information
app.get("/api/missingmedia", async function (req, res) {
  let missingItems = await missingMedia();
  logger.info(`Getting Missing Media Items ${missingItems.length}`);
  res.json(missingItems);
});

// Retry Missing Media Item
app.get("/api/retrymissingitem", async function (req, res) {
  let data = JSON.parse(req.query.data);
  let mediaItem = data;
  let mediaType = data.mediaType;
  logger.info(`Retrying Missing Item: ${mediaItem}. Media Type: ${mediaType}`);
  let result = await getMediaInfo(res, mediaType, mediaItem);
  res.write(result.toString());
  res.end();
});

// Send Base64 Encoded Photo for Photos Page.
app.post("/api/photo", cors(corsOptions), async function (req, res) {
  let photoPath = await req.body.data;
  fs.readFile(photoPath, function (err, data) {
    if (err) {
      logger.error("Error Getting Local Photo: ", err);
      res.send("Error");
      res.end();
    } else {
      const buffer = Buffer.from(data);
      let imgBase64 = buffer.toString("base64");
      res.send(imgBase64);
      res.end();
    }
  });
});

// Send Media API Data from Database
app.post("/api/getmedia", cors(corsOptions), async function (req, res) {
  let mediaType = await req.body.data;
  logger.info(`Media Data Requested for ${mediaType}`);
  let cmd = { cmd: "find", collection: mediaType };
  let dbMediaItems = await databaseAction(cmd);
  res.send(dbMediaItems);
});

// Send Season / Episode Data for TV Shows
app.post("/api/getseason", cors(corsOptions), async function (req, res) {
  let replaceSpecialCharacters = await req.body.data;
  let show = replaceSpecialCharacters
    .replaceAll(":", "")
    .replaceAll("!", "")
    .replaceAll(",", "");
  logger.info(`Season Data Requested for show: ${show}`);
  // TODO: Local TV Season Use DB Instead of JSON
  await readTvSeason(show, res);
});

// Open File Requested Locally. (Not In Browser)
app.get("/api/open", cors(corsOptions), async function (req, res) {
  try {
    let path = req.query.data;
    let finalPath = '"' + path + '"';

    // Check OS
    let isWin = /^win/.test(process.platform); // possible outcomes -> 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
    logger.info(`Platform was Windows? ${isWin}\nPath: ${finalPath}\n`);
    exec((isWin ? "start " : "open ") + finalPath, function (err) {
      if (err !== null) {
        logger.error(`Error Opening File: ${err}.\nError Path: ${path}\n`);
      }
    });
    res.end();
  } catch (err) {
    logger.error("Error Opening File: ", err);
  }
});

// Set Movie Stream Path
app.get("/api/setvideo", async function (req, res) {
  videoSreamPath = req.query.data;
  logger.info(`Set Video Stream Path:\n${videoSreamPath}`);
  res.send(true);
});

// Stream Movie
// TODO: Decode h265 and other video codec support.
app.get("/api/video", async function (req, res) {
  try {
    let path = await videoSreamPath;
    // TODO: TV Show Stream Not Done
    if (path.includes("TV Show")) {
      logger.error("INFO: Streaming TV Shows Not Finished");
      return;
    }
    let stat = fs.statSync(path);
    let fileSize = stat.size;
    let range = req.headers.range;
    if (range) {
      let parts = range.replace(/bytes=/, "").split("-");
      let start = parseInt(parts[0], 10);
      let end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      let chunksize = end - start + 1;
      let file = fs.createReadStream(path, { start, end });
      let head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      let head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      fs.createReadStream(path).pipe(res);
    }
  } catch (err) {
    logger.error(`Error Streaming Video:\n${err}\n`);
  }
});

// Set Music Stream Path
app.get("/api/setmusic", async function (req, res) {
  musicStreamPath = req.query.path;
  let song = req.query.song;
  let album = req.query.album;
  logger.info(`Music Play Request for Song: ${song} Album ${album}.`);
  // Get Database Album Songs/Paths
  let cmd = { cmd: "find", collection: "Music", key: "key", data: album };
  let dbSongs = await databaseAction(cmd);
  res.json(dbSongs[0].data.Tracks);
});

// Stream Music
app.get("/api/streammusic", function (req, res) {
  let musicStream = fs.createReadStream(musicStreamPath);
  musicStream.on("error", (err) => {
    logger.error(`Streaming Error: ${err}`);
    res.status(400);
    return;
  });
  res.writeHead(200, { "Content-Type": "audio/mp3" });
  musicStream.pipe(res);
});

// Parse Epub Book File. Append Parsed Content into Readable HTML and Send.
app.get("/api/book", async function (req, res) {
  let path = req.query.path;
  let ext = req.query.ext;
  logger.info(`Get Book Request: Extension Type: ${ext}`);
  readBook(path, ext, res);
});

// Start Server and Read PORT File
const startServer = async () => {
  logger.info("Starting Server:");
  let ip = setServerIp();
  let port = await getPort();
  serverAddress = `http://${ip}:${port}`;
  app.listen(port, () => {
    checkPropertiesFirstRun(serverAddress);
    logger.info(`Media Server Listening on Port: ${port}.`);
  });
};

startServer();
