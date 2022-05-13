const axios = require("axios");
const { readProps } = require("../start/start");
const { saveToDatabase } = require("../database/saveToDatabase");
const { databaseAction } = require("../database/mongodb");
let mediaResults = [];
let mediaNotFound = [];
let counter = 1;
let successCounter = 0;
let failCount = 0;

async function getMediaInfo(data, response, mediaType) {
  let dataProps = await useMediaType(mediaType);
  let apiKey = dataProps.APIKey;
  let mediaName = dataProps.MediaName;
  let mediaValues = data;
  mediaNotFound = [];
  mediaResults = [];
  let cmd = { cmd: "find", collection: mediaName };
  let dbMediaItems = await databaseAction(cmd); //TODO: Change All Other Media Types
  console.info(`Calling API for ${dbMediaItems.length} ${mediaName} files.`);

  // Update Music
  if (mediaType === "updatemusic") {
    for (let x = 0; x < dbMediaItems.length; x++) {
      let album = dbMediaItems[x].key;
      let artist = dbMediaItems[x].data.Artist;
      try {
        await apiCallMusic(artist, album, apiKey, response);
      } catch (err) {
        failCount++;
        console.error(`Error Calling Music API: ${err}`);
        mediaNotFound.push({
          Name: album,
          Path: artist,
        });
      }
    }
  } else {
    for (let i = 0; i < mediaValues.length; i++) {
      // Update Movies
      if (mediaType === "updatemovies" || mediaType === "updatetv") {
        let mediaInfo = await apiCallMovies(apiKey, mediaValues, i);
        if (mediaInfo !== undefined) {
          await mapData(mediaInfo, mediaValues, response, i, mediaName);
        }
      }
      // Update TV
      else if (mediaType === "updatetv") {
        let mediaInfo = await apiCallTv(apiKey, mediaValues, i);
        if (mediaInfo !== undefined) {
          await mapData(mediaInfo, mediaValues, response, i, mediaName);
        }
      }
      // Update Books
      else if (mediaType === "updatebooks") {
        let mediaInfo = await apiCallBooks(mediaValues, apiKey, i);
        await mapData(mediaInfo, mediaValues, response, i, mediaName);
      }
    }

    // Save to Database
    if (mediaResults.length >= 1) {
      await saveToDatabase(mediaName, mediaName, mediaResults);
      await saveToDatabase(mediaName, "No API Result", mediaNotFound);
    } else {
      response.write(`${counter++}. ${mediaName} API Found 0 Results.`);
    }

    // Write missed items in API.
    for (let i = 0; i < mediaNotFound.length; i++) {
      response.write(
        `Name: ${Object.values(mediaNotFound)[i].Name}  Path: ${
          Object.values(mediaNotFound)[i].Path
        }\n \n`
      );
    }
  }
  response.write(
    `${counter++}. ${mediaName} API Found ${successCounter} results. ${mediaName} API Failed for ${failCount}\n`
  );
  console.log(`Finished API Calls.`);
}

// Call OMDBI API for Movies
async function apiCallMovies(apiKey, mediaValues, i) {
  const apiUrl = `http://www.omdbapi.com/`;
  let res = await axios.get(apiUrl, {
    params: {
      apikey: apiKey,
      t: Object.values(mediaValues)[i].name,
    },
  });
  let mediaInfo = res.data;
  return mediaInfo;
}

// Call OMDBI API for TV
async function apiCallTv(apiKey, mediaValues, i) {
  const apiUrl = `http://www.omdbapi.com/`;
  if (mediaValues[i].year === null) {
    let res = await axios.get(apiUrl, {
      params: {
        apikey: apiKey,
        t: Object.values(mediaValues)[i].name,
      },
    });
    let mediaInfo = res.data;
    return mediaInfo;
  } else if (mediaValues[i].year !== null) {
    let res = await axios.get(apiUrl, {
      params: {
        apikey: apiKey,
        t: Object.values(mediaValues)[i].name,
        y: Object.values(mediaValues)[i].year,
      },
    });
    let mediaInfo = res.data;
    return mediaInfo;
  }
}

// Call Apple Music API
async function apiCallMusic(artist, album, apiKey, res) {
  // Abort API Call if Time Eplasted > 3 Seconds
  const controller = new AbortController();
  timeOut = setTimeout(() => {
    failCount++;
    controller.abort();
    mediaNotFound.push({
      Name: album,
      Path: artist,
    });
  }, 3000);
  timeOut;

  // Begin API Call
  await axios
    .get(
      `https://api.music.apple.com/v1/catalog/us/search?types=albums&limit=1&term=${artist}${"+"}${album}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: controller.signal,
      }
    )
    .then((response) => {
      try {
        clearTimeout(timeOut);
        let mediaInfo = response.data;
        // No Result Found
        if (!mediaInfo.results.albums) {
          res.write(
            `${counter++}. No API Results Found for Album: ${album} Artist: ${artist} Total Failures ${failCount++}\n`
          );
          mediaNotFound.push({
            Name: album,
            Path: artist,
          });
        }
        // Found Result
        else {
          mapMusicData(mediaInfo, res, album);
        }
      } catch (err) {
        failCount++;
        console.error(`Error Handling Music API Response: ${err}`);
        mediaNotFound.push({
          Name: album,
          Path: err,
        });
      }
    });
}

// Call Google Books API
async function apiCallBooks(mediaValues, apiKey, i) {
  let title = Object.values(mediaValues)[i].name;
  let author = Object.values(mediaValues)[i].author;
  let apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${title}+inauthor:${author}&langRestrict=en&maxResults=1&key=${apiKey}`;
  let res = await axios.get(apiUrl);
  let mediaInfo = res.data;
  return mediaInfo;
}

// Push Media Info To Array
async function mapData(mediaInfo, mediaValues, response, i, mediaName) {
  if (Object.values(mediaInfo)[0] === "False" || mediaInfo.totalItems === 0) {
    await mediaNotFoundError(mediaValues, i, response, mediaName);
  } else {
    if (mediaName === "Movies") {
      mapMovieData(mediaInfo, mediaValues, i, response, mediaName);
    } else if (mediaName === "Books") {
      mapBookData(mediaInfo, mediaValues, i, response, mediaName);
    } else if (mediaName === "Music") {
      mapMusicData(mediaInfo, mediaValues, i, response);
    } else if (mediaName === "TV Shows") {
      mapTvData(mediaInfo, mediaValues, i, response, mediaName);
    }
  }
}

// Map Movies / TV Data
async function mapMovieData(mediaInfo, mediaValues, i, response, mediaName) {
  try {
    successCounter++;
    mediaResults.push({
      // All Media Same Data
      Title: mediaInfo.Title,
      Creator: mediaInfo.Director,
      Description: mediaInfo.Plot,
      Categories: mediaInfo.Genre,
      Ratings: mediaInfo.Ratings,
      ImageURL: mediaInfo.Poster,
      Length: mediaInfo.Runtime,
      Path: Object.values(mediaValues)[i].path,
      Ext: Object.values(mediaValues)[i].ext,
      Year: mediaInfo.Year,
      //Extra for Movies
      Rated: mediaInfo.Rated,
      Actors: mediaInfo.Actors,
      Metascore: mediaInfo.Metascore,
      imdbRating: mediaInfo.imdbRating,
      Awards: mediaInfo.Awards,
      Language: mediaInfo.Language,
    });
    response.write(
      `${counter++}. ${mediaName} API Found Results for ${mediaInfo.Title}\n`
    );
  } catch (err) {
    await mediaNotFoundError(mediaValues, i, response, mediaName);
  }
}

async function mapTvData(mediaInfo, mediaValues, i, response, mediaName) {
  try {
    successCounter++;
    mediaResults.push({
      Title: mediaInfo.Title,
      Creator: mediaInfo.Director,
      Description: mediaInfo.Plot,
      Categories: mediaInfo.Genre,
      Ratings: mediaInfo.Ratings,
      ImageURL: mediaInfo.Poster,
      Length: mediaInfo.Runtime,
      Path: Object.values(mediaValues)[i].path,
      Ext: Object.values(mediaValues)[i].ext,
      Year: mediaInfo.Year,
    });
    response.write(
      `${counter++}. ${mediaName} API Found Results for ${mediaInfo.Title}\n`
    );
  } catch (err) {
    await mediaNotFoundError(mediaValues, i, response, mediaName);
  }
}

// Map Book Data
async function mapBookData(mediaInfo, mediaValues, i, response, mediaName) {
  try {
    successCounter++;
    mediaResults.push({
      Title: mediaInfo.items[0].volumeInfo.title,
      Description: mediaInfo.items[0].volumeInfo.description,
      Creator: mediaInfo.items[0].volumeInfo.authors, //Author
      Categories: mediaInfo.items[0].volumeInfo.categories,
      Ratings: mediaInfo.items[0].volumeInfo.averageRating,
      ImageURL: mediaInfo.items[0].volumeInfo.imageLinks.thumbnail,
      Length: mediaInfo.items[0].volumeInfo.pageCount,
      Path: Object.values(mediaValues)[i].path,
      Ext: Object.values(mediaValues)[i].ext,
      ImageURLSmall: mediaInfo.items[0].volumeInfo.imageLinks,
      NumberOfRatings: mediaInfo.items[0].volumeInfo.ratingsCount,
      Year: mediaInfo.items[0].volumeInfo.publishedDate.slice(0, 4),
    });
    response.write(
      `${counter++}. ${mediaName} API Found Results for ${
        mediaInfo.items[0].volumeInfo.title
      }\n`
    );
  } catch (err) {
    await mediaNotFoundError(mediaValues, i, response, mediaName);
  }
}

// Map Music Data
async function mapMusicData(mediaInfo, response, album) {
  try {
    let cmd = { cmd: "find", collection: "Music", key: "key", data: album };
    let dbAlbum = await databaseAction(cmd);
    if (mediaInfo !== undefined) {
      dbAlbum[0].data.Genres =
        mediaInfo.results.albums.data[0].attributes.genreNames;
      dbAlbum[0].data.Year =
        mediaInfo.results.albums.data[0].attributes.releaseDate;
      dbAlbum[0].data.Attributes =
        mediaInfo.results.albums.data[0].attributes.artwork;
      dbAlbum[0].data.TrackCount =
        mediaInfo.results.albums.data[0].attributes.trackCount;

      dbAlbum[0].data.id =
        mediaInfo.results.albums.data[0].attributes.playParams.id;
      if (
        dbAlbum[0].data.LocalTrackCount ===
        mediaInfo.results.albums.data[0].attributes.trackCount
      ) {
        dbAlbum[0].data.HasAllTracks = true;
      } else {
        dbAlbum[0].data.HasAllTracks = false;
      }
      let cmd2 = {
        cmd: "updateOne",
        collection: "Music",
        key: album,
        data: dbAlbum[0].data,
      };
      await databaseAction(cmd2);
    }
    response.write(
      `${counter++}. Music API Found Results for ${JSON.stringify(
        dbAlbum[0].data.Album
      )}\n`
    );
    successCounter++;
  } catch (err) {
    console.error(err);
  }
  try {
    if (
      typeof mediaInfo.results.albums.data[0].attributes.editorialNotes
        .standard !== undefined
    ) {
      mediaValues[i].Albums[x].Description =
        mediaInfo.results.albums.data[0].attributes.editorialNotes.standard
          .replace("This album is Mastered for iTunes. ", "")
          .trim();
    }
  } catch (err) {
    //No Description Found
  }
}

// Map media that wasn't found into array
async function mediaNotFoundError(mediaValues, i, response, mediaName) {
  mediaNotFound.push({
    Name: mediaValues[i].name,
    Path: mediaValues[i].path,
  });
  response.write(
    `${counter++}. WARN: ${mediaName} API error with: ${
      mediaValues[i].name
    }. Total ${mediaName} Not Found: ${failCount++}\n`
  );
}

// Define | All Media | Defines media properties needed for API
async function useMediaType(mediaType) {
  if (mediaType === "updatemovies") {
    let apikey = await readProps("apikeymovie");
    let mediaName = "Movies";
    let returnObj = {
      APIKey: apikey,
      MediaName: mediaName,
    };
    return returnObj;
  } else if (mediaType === "updatebooks") {
    let apikey = await readProps("apikeybooks");
    let mediaName = "Books";
    let returnObj = {
      APIKey: apikey,
      MediaName: mediaName,
    };
    return returnObj;
  } else if (mediaType === "updatetv") {
    let apikey = await readProps("apikeymovie"); //same as movies
    let mediaName = "TV Shows";
    let returnObj = {
      APIKey: apikey,
      MediaName: mediaName,
    };
    return returnObj;
  } else if (mediaType === "updatemusic") {
    let apikey = await readProps("apikeymusic");
    let mediaName = "Music";
    let returnObj = {
      APIKey: apikey,
      MediaName: mediaName,
    };
    return returnObj;
  }
}

module.exports = { getMediaInfo };
