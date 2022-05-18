const axios = require("axios");
const { readProps } = require("../start/start");
const { databaseAction } = require("../database/mongodb");
const { logger } = require("../logger/logger");

let mediaResults = [];
let mediaNotFound = [];
let counter = 1; // Server Response Message #
let successCounter = 0; // Found Items +1
let failCount = 0; // Failed Items +1
let mediaName; // Media Name. Ex: Movies, TV Shows, Books, Music
let apikey; // API Keys
let res; // Send Response Message for Server Messages
let isSingle; // Get API Result for Single Item
let resultFound; // Boolean - Single Item API Result

// Call API for Single Item Fix
async function getSingleResult(mediaType, singleItem) {
  isSingle = true;
  let deleteFoundItem = {
    cmd: "deleteOne",
    collection: `Missing ${mediaName}`,
    key: singleItem.key,
  };

  // Update Music Single Item
  if (mediaType === "updatemusic") {
    await apiCallMusic(artist, album, apikey);
  }
  // Update Books Single Item
  else if (mediaType === "updatebooks") {
    let mediaInfo = await apiCallBooks(singleItem, apikey);
    if (mediaInfo.totalItems > 0) {
      // Insert Found Item to Media Collection
      let boolSuccess = await mapBookData(mediaInfo, singleItem);
      if (boolSuccess === true) {
        // Delete Found Item from Missing Collection.
        await databaseAction(deleteFoundItem);
      }
      resultFound = true;
    } else {
      logger.info(`No Items Found for ${singleItem.name}`);
      resultFound = false;
    }
  }
  // Update TV Single Item
  else if (mediaType === "updatetv") {
    let mediaInfo = await apiCallTv(apikey, dbMediaItems[x]);
    if (mediaInfo.Response !== "False") {
      // Insert Found Item to Media Collection
      let boolSuccess = await mapTvData(mediaInfo, singleItem);
      if (boolSuccess === true) {
        // Delete Found Item from Missing Collection.
        await databaseAction(deleteFoundItem);
      }
      resultFound = true;
    } else {
      resultFound = false;
    }
  }
  // Update Movies Single Item
  else if (mediaType === "updatemovies") {
    let mediaInfo = await apiCallMovies(apikey, dbMediaItems[x]);
    if (mediaInfo.Response !== "False") {
      // Insert Found Item to Media Collection
      let boolSuccess = await mapMovieData(mediaInfo, singleItem);
      if (boolSuccess === true) {
        // Delete Found Item from Missing Collection.
        await databaseAction(deleteFoundItem);
      }
      resultFound = true;
    } else {
      resultFound = false;
    }
  }
}

async function getMediaInfo(response, mediaType, singleItem) {
  res = response;
  await useMediaType(mediaType);
  mediaNotFound = [];
  mediaResults = [];
  if (singleItem) {
    await getSingleResult(mediaType, singleItem);
    return resultFound;
  }
  let dbMediaItems;
  let cmd = { cmd: "find", collection: mediaName };
  // Get Media Items from DB
  dbMediaItems = await databaseAction(cmd);
  // Create Index on Missing Media
  let createIndex = {
    cmd: "createIndex",
    collection: `Missing ${mediaName}`,
    key: "key",
  };
  await databaseAction(createIndex);

  logger.info(`Calling API for ${dbMediaItems.length} ${mediaName} files.`);

  for (let x = 0; x < dbMediaItems.length; x++) {
    // Update Music
    if (mediaType === "updatemusic") {
      let album = dbMediaItems[x].key;
      let artist = dbMediaItems[x].data.Artist;
      try {
        await apiCallMusic(artist, album, apikey);
      } catch (err) {
        failCount++;
        logger.error(`Error Calling Music API: ${err}`);
        mediaNotFound.push({
          Name: album,
          Path: artist,
        });
      }
    }
    // Update Books
    else if (mediaType === "updatebooks") {
      let mediaInfo = await apiCallBooks(dbMediaItems[x], apikey);
      if (mediaInfo.totalItems > 0) {
        await mapBookData(mediaInfo, dbMediaItems[x]);
      }
    }
    // Update TV
    else if (mediaType === "updatetv") {
      let mediaInfo = await apiCallTv(apikey, dbMediaItems[x]);
      if (mediaInfo.Response !== "False") {
        await mapTvData(mediaInfo, dbMediaItems[x]);
      }
    }
    // Update Movies
    else if (mediaType === "updatemovies") {
      let mediaInfo = await apiCallMovies(apikey, dbMediaItems[x]);
      if (mediaInfo.Response !== "False") {
        await mapMovieData(mediaInfo, dbMediaItems[x]);
      }
    }
  }

  // Write missed items for API.
  for (let i = 0; i < mediaNotFound.length; i++) {
    res.write(
      `Name: ${Object.values(mediaNotFound)[i].Name}  Path: ${
        Object.values(mediaNotFound)[i].Path
      }\n \n`
    );
  }

  res.write(
    `${counter++}. ${mediaName} API Found ${successCounter} results. ${mediaName} API Failed for ${failCount}\n`
  );
  logger.info(`Finished API Calls.`);
}

// Call OMDBI API for Movies
async function apiCallMovies(apikey, dbItem) {
  const apiUrl = `http://www.omdbapi.com/`;
  if (isSingle) {
    title = dbItem.name;
  } else {
    title = dbItem.data.name;
  }
  let res = await axios.get(apiUrl, {
    params: {
      apikey: apikey,
      t: dbItem.data.name,
    },
  });
  let mediaInfo = res.data;
  return mediaInfo;
}

// Call OMDBI API for TV
async function apiCallTv(apikey, dbItem) {
  const apiUrl = `http://www.omdbapi.com/`;
  let title;
  let year;
  if (isSingle) {
    title = dbItem.name;
    year = dbItem.param2;
  } else {
    title = dbItem.data.name;
    year = dbItem.data.year;
  }
  if (dbItem.data.year === null) {
    let res = await axios.get(apiUrl, {
      params: {
        apikey: apikey,
        t: title,
      },
    });
    let mediaInfo = res.data;
    return mediaInfo;
  } else if (dbItem.data.year !== null) {
    let res = await axios.get(apiUrl, {
      params: {
        apikey: apikey,
        t: title,
        y: year,
      },
    });
    let mediaInfo = res.data;
    return mediaInfo;
  }
}

// Call Google Books API
async function apiCallBooks(mediaValues, apikey) {
  let title;
  let author;
  if (isSingle) {
    title = mediaValues.name;
    author = mediaValues.param2;
  } else {
    title = mediaValues.data.name;
    author = mediaValues.data.author;
  }
  logger.info(`Calling API Books ${title} ${author}`);
  let apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${title}+inauthor:${author}&langRestrict=en&maxResults=1&key=${apikey}`;
  let res = await axios.get(apiUrl);
  let mediaInfo = res.data;
  return mediaInfo;
}

// Call Apple Music API
async function apiCallMusic(artist, album, apikey) {
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
        headers: { Authorization: `Bearer ${apikey}` },
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
        logger.error(`Error Handling Music API Response: ${err}`);
        mediaNotFound.push({
          Name: album,
          Path: err,
        });
      }
    });
}

// Map Movies / TV Data
async function mapMovieData(mediaInfo, dbItem) {
  try {
    successCounter++;
    let key = dbItem.key;

    mediaResults.push({
      Title: mediaInfo.Title,
      Year: mediaInfo.Year,
      Rate: mediaInfo.Rated,
      Released: mediaInfo.Released,
      Categories: mediaInfo.Genre,
      Length: mediaInfo.Runtime,
      Creator: mediaInfo.Director,
      Writer: mediaInfo.Writer,
      Actors: mediaInfo.Actors,
      Description: mediaInfo.Plot,
      Language: mediaInfo.Language,
      Country: mediaInfo.Country,
      Awards: mediaInfo.Awards,
      ImageURL: mediaInfo.Poster,
      Ratings: mediaInfo.Ratings,
      DVD: mediaInfo.DVD,
      BoxOffice: mediaInfo.BoxOffice,
      Production: mediaInfo.Production,
      Website: mediaInfo.Website,
      Path: dbItem.data.path,
      Ext: dbItem.data.ext,
    });

    let cmd = {
      cmd: "updateOne",
      collection: "Movies",
      key: key,
      data: mediaResults,
    };
    // Update Database Entry
    await databaseAction(cmd);
    mediaResults = [];

    res.write(
      `${counter++}. ${mediaName} API Found Results for ${mediaInfo.Title}\n`
    );
  } catch (err) {
    await mediaNotFoundError(dbItem);
  }
}

async function mapTvData(mediaInfo, dbItem) {
  try {
    successCounter++;
    let key = dbItem.key;
    let cmd1 = {
      cmd: "findOne",
      collection: "TV Shows",
      key: key,
    };
    // Get TV Season Data - Add To New Array
    let tvShowData = await databaseAction(cmd1);
    let tvShowSeasonData = tvShowData[0].data.content;

    mediaResults.push({
      Title: mediaInfo.Title,
      Year: mediaInfo.Year,
      Rated: mediaInfo.Rated,
      Released: mediaInfo.Released,
      Length: mediaInfo.Runtime,
      Categories: mediaInfo.Genre,
      Creator: mediaInfo.Director,
      Writers: mediaInfo.Writers,
      Actors: mediaInfo.Actors,
      Description: mediaInfo.Plot,
      Language: mediaInfo.Language,
      Country: mediaInfo.Country,
      Awards: mediaInfo.Awards,
      ImageURL: mediaInfo.Poster,
      Ratings: mediaInfo.Ratings,
      Metascore: mediaInfo.Metascore,
      imdbRating: mediaInfo.imdbRating,
      imdbVotes: mediaInfo.imdbVotes,
      imdbId: mediaInfo.imdbId,
      totalSeasons: mediaInfo.totalSeasons,
      Path: dbItem.data.path,
      content: tvShowSeasonData,
    });

    let cmd = {
      cmd: "updateOne",
      collection: "TV Shows",
      key: key,
      data: mediaResults,
    };
    // Update Database Entry
    await databaseAction(cmd);
    mediaResults = [];

    res.write(
      `${counter++}. ${mediaName} API Found Results for ${mediaInfo.Title}\n`
    );
  } catch (err) {
    await mediaNotFoundError(dbItem);
  }
}

// Map Book Data
async function mapBookData(mediaInfo, dbItem) {
  try {
    let key = dbItem.key;
    successCounter++;
    let imgUrl;
    let path;
    let ext;
    let year;
    try {
      imgUrl = mediaInfo.items[0].volumeInfo.imageLinks.thumbnail;
      path = dbItem.data.path;
      ext = dbItem.data.ext;
      year = mediaInfo.items[0].volumeInfo.publishedDate.slice(0, 4);
    } catch (err) {
      imgUrl = "N/A";
      path = dbItem.path;
      ext = dbItem.ext;
      year = 0;
    }

    mediaResults.push({
      Title: mediaInfo.items[0].volumeInfo.title,
      Description: mediaInfo.items[0].volumeInfo.description,
      Creator: mediaInfo.items[0].volumeInfo.authors, //Author
      Categories: mediaInfo.items[0].volumeInfo.categories,
      Ratings: mediaInfo.items[0].volumeInfo.averageRating,
      ImageURL: imgUrl,
      Length: mediaInfo.items[0].volumeInfo.pageCount,
      Path: path,
      Ext: ext,
      ImageURLSmall: mediaInfo.items[0].volumeInfo.imageLinks,
      NumberOfRatings: mediaInfo.items[0].volumeInfo.ratingsCount,
      Year: year,
    });

    let cmd = {
      cmd: "updateOne",
      collection: "Books",
      key: key,
      data: mediaResults,
    };
    await databaseAction(cmd);
    mediaResults = [];
    res.write(
      `${counter++}. ${mediaName} API Found Results for ${
        mediaInfo.items[0].volumeInfo.title
      }\n`
    );
    return true;
  } catch (err) {
    if (isSingle === true) {
      logger.error(err);
      return false;
    } else {
      await mediaNotFoundError(dbItem);
    }
  }
}

// Map Music Data
async function mapMusicData(mediaInfo, album) {
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
    res.write(
      `${counter++}. Music API Found Results for ${JSON.stringify(
        dbAlbum[0].data.Album
      )}\n`
    );
    successCounter++;
  } catch (err) {
    logger.error(err);
  }
  try {
    if (
      typeof mediaInfo.results.albums.data[0].attributes.editorialNotes
        .standard !== undefined
    ) {
      dbAlbum[0].Description =
        mediaInfo.results.albums.data[0].attributes.editorialNotes.standard
          .replace("This album is Mastered for iTunes. ", "")
          .trim();
    }
  } catch (err) {
    //No Description Found
  }
}

// Map media that wasn't found into array
async function mediaNotFoundError(mediaValues) {
  mediaNotFound.push({
    Name: mediaValues.data.name,
    Path: mediaValues.data.path,
    Data: mediaValues,
  });
  let insertItem = {
    cmd: "insertOne",
    collection: `Missing ${mediaName}`,
    key: mediaValues.data.name,
    data: mediaNotFound,
  };
  // Insert Item
  await databaseAction(insertItem);
  mediaNotFound = [];
  // Create Database Index on Key
  res.write(
    `${counter++}. WARN: ${mediaName} API error with: ${
      mediaValues.data.name
    }. Total ${mediaName} Not Found: ${failCount++}\n`
  );
}

// Define | All Media | Defines media properties needed for API
async function useMediaType(mediaType) {
  if (mediaType === "updatemovies") {
    apikey = await readProps("apikeymovie");
    mediaName = "Movies";
    let returnObj = {
      apikey: apikey,
      MediaName: mediaName,
    };
    return returnObj;
  } else if (mediaType === "updatebooks") {
    apikey = await readProps("apikeybooks");
    mediaName = "Books";
    let returnObj = {
      apikey: apikey,
      MediaName: mediaName,
    };
    return returnObj;
  } else if (mediaType === "updatetv") {
    apikey = await readProps("apikeymovie"); //same as movies
    mediaName = "TV Shows";
    let returnObj = {
      apikey: apikey,
      MediaName: mediaName,
    };
    return returnObj;
  } else if (mediaType === "updatemusic") {
    apikey = await readProps("apikeymusic");
    mediaName = "Music";
    let returnObj = {
      apikey: apikey,
      MediaName: mediaName,
    };
    return returnObj;
  }
}

module.exports = { getMediaInfo };
