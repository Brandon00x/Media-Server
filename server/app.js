const express = require("express");
const cors = require("cors");
const app = express();
const fs = require("fs");
const exec = require("child_process").exec;
const { startScan } = require("./scanmedia/scanmedia");
const { getPort } = require("./port/port");
const { handleSave } = require("./save/handleSave"); //TODO: CHANGE LATER FOR DATABASE
const { readProps } = require("./start/start"); //TODO: REMOVE LATER FOR DATABASE
const { getMediaInfo } = require("./apicalls/apicall");
const { readMedia } = require("./readmedia/readmedia");
const { readBook } = require("./readmedia/readbook");
const { readTvSeason } = require("./readmedia/readtvseason");
const { databaseAction } = require("./database/mongodb");

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};
app.use(express.json());
app.use(cors());

let videoSreamPath;
let musicStreamPath;

//TODO REPLACE WITH DATABASE.
//Sends Keys and Folder Locations When Settings is Loaded
app.get("/settings", cors(corsOptions), async function (req, res) {
  try {
    let port = await getPort();
    let apikeybooks = await readProps("apikeybooks");
    let apikeymovie = await readProps("apikeymovie");
    let apikeymusic = await readProps("apikeymusic");
    let booksRootFolder = await readProps("booksRootFolder");
    let moviesRootFolder = await readProps("moviesRootFolder");
    let musicRootFolder = await readProps("musicRootFolder");
    let tvRootFolder = await readProps("tvRootFolder");
    let photoRootFolder = await readProps("photoRootFolder");

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
    };
    res.send(startObj);
  } catch (err) {
    console.error(`Error Sending Settings Data: ${err}`);
  }
});

// Save Folders, API Keys, or PORT Change.
app.post("/save", cors(corsOptions), async function (req, res) {
  let property = req.body.property;
  let data = req.body.data;
  console.info(
    `Save Property Requested: Propterty: ${property}. Data: ${data}`
  );
  handleSave(property, data, res);
});

// Scan local media (books, movies, music) then call API for each one to update.
app.post("/update", cors(corsOptions), async function (req, res) {
  try {
    let mediaCategory = await req.body.type;
    let mediaPath = await req.body.path;
    let mediaData = await startScan(res, mediaCategory, mediaPath);
    if (mediaData.length > 0 && mediaCategory !== "updatephotos") {
      //await getMediaInfo(mediaData, res, mediaCategory);
    } else if (mediaData.length === 0) {
      res.write(
        `INFO: Found 0 local media items. Please check your directory and read the information section.\n`
      );
    }
    res.end();
  } catch (err) {
    console.error(`Error: Unable to finish scan request: ${err}`);
    res.end();
  }
});

// Send Base64 Encoded Photo for Photos Page.
// Todo: Use Database for this later
app.post("/photo", cors(corsOptions), async function (req, res) {
  let photoPath = await req.body.data;
  fs.readFile(photoPath, function (err, data) {
    if (err) {
      console.error("Error Getting Local Photo: ", err);
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

// Send Local Book Data Saved From API Call. Does not call API.
app.post("/getmedia", cors(corsOptions), async function (req, res) {
  let mediaType = await req.body.data;
  console.info(`Media Data Requested for ${mediaType}`);
  readMedia(mediaType, res);
});

// Send Season / Episode Data for TV Shows
app.post("/getseason", cors(corsOptions), async function (req, res) {
  let replaceSpecialCharacters = await req.body.data;
  let show = replaceSpecialCharacters
    .replaceAll(":", "")
    .replaceAll("!", "")
    .replaceAll(",", "");
  console.info(`Season Data Requested for show: ${show}`);
  await readTvSeason(show, res);
});

// Open File Requested Locally. (Not In Browser)
app.get("/open", cors(corsOptions), async function (req, res) {
  try {
    let path = req.query.data;
    let finalPath = '"' + path + '"';

    // Check OS
    let isWin = /^win/.test(process.platform); // possible outcomes -> 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
    console.info(`Platform was Windows? ${isWin}\nPath: ${finalPath}\n`);
    exec((isWin ? "start " : "open ") + finalPath, function (err) {
      if (err !== null) {
        console.error(`Error Opening File: ${err}.\nError Path: ${path}\n`);
      }
    });
    res.end();
  } catch (err) {
    console.error("Error Opening File: ", err);
  }
});

// Set Movie Stream Path
app.get("/setvideo", async function (req, res) {
  videoSreamPath = req.query.data;
  console.info(`Set Video Stream Path:\n${videoSreamPath}`);
  res.send(true);
});

// Stream Movie
// TODO: Decode h265 and other video codec support.
app.get("/video", async function (req, res) {
  try {
    let path = await videoSreamPath;
    // TODO: TV Show Stream Not Done
    if (path.includes("TV Show")) {
      console.error("INFO: Streaming TV Shows Not Finished");
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
    console.error(`Error Streaming Video:\n${err}\n`);
  }
});

// Parse Epub Book File. Append Parsed Content into Readable HTML and Send.
app.get("/book", async function (req, res) {
  let path = req.query.path;
  let ext = req.query.ext;
  console.info(`Get Book Request: Extension Type: ${ext}`);
  readBook(path, ext, res);
});

// Set Music Stream Path
app.get("/setmusic", async function (req, res) {
  musicStreamPath = req.query.path;
  let song = req.query.song;
  let album = req.query.album;
  console.info(`Music Play Request for Song: ${song} Album ${album}.`);
  // Get Database Album Songs/Paths
  let cmd = { cmd: "find", collection: "music", key: "key", data: album };
  let dbSongs = await databaseAction(cmd);
  res.json(dbSongs[0].data[0].Songs);
});

// Stream Music
app.get("/streammusic", function (req, res) {
  try {
    res.writeHead(200, { "Content-Type": "audio/mp3" });
    let musicStream = fs.createReadStream(musicStreamPath);
    console.log(`Streaming Path ${musicStreamPath}`);
    musicStream.pipe(res);
  } catch (err) {
    console.error(`Streaming Error: ${err}`);
  }
});

// Start Server and Read PORT File
const startServer = async () => {
  let port = await getPort();
  app.listen(port, () => {
    console.info(`Media Metadata Server Listening On: ${port}.\n`);
  });
};

startServer();
