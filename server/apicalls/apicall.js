const axios = require("axios");
const { readProps } = require("../start/start");
const { databaseAction } = require("../database/mongodb");
let mediaResults = [];
let mediaNotFound = [];
let counter = 1;
let successCounter = 0;
let failCount = 0;
let mediaName;
let apikey;
let res;

async function getMediaInfo(response, mediaType) {
  res = response;
  await useMediaType(mediaType);
  mediaNotFound = [];
  mediaResults = [];
  let cmd = { cmd: "find", collection: mediaName };
  let dbMediaItems = await databaseAction(cmd);
  console.info(`Calling API for ${dbMediaItems.length} ${mediaName} files.`);

  //dbMediaItems.length
  for (let x = 0; x < dbMediaItems.length; x++) {
    // Update Music
    if (mediaType === "updatemusic") {
      let album = dbMediaItems[x].key;
      let artist = dbMediaItems[x].data.Artist;
      try {
        await apiCallMusic(artist, album, apikey);
      } catch (err) {
        failCount++;
        console.error(`Error Calling Music API: ${err}`);
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

  // Write missed items in API.
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
  console.log(`Finished API Calls.`);
}

// Call OMDBI API for Movies
async function apiCallMovies(apikey, dbItem) {
  const apiUrl = `http://www.omdbapi.com/`;
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
  if (dbItem.data.year === null) {
    let res = await axios.get(apiUrl, {
      params: {
        apikey: apikey,
        t: dbItem.data.name,
      },
    });
    let mediaInfo = res.data;
    return mediaInfo;
  } else if (dbItem.data.year !== null) {
    let res = await axios.get(apiUrl, {
      params: {
        apikey: apikey,
        t: dbItem.data.name,
        y: dbItem.data.year,
      },
    });
    let mediaInfo = res.data;
    return mediaInfo;
  }
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
        console.error(`Error Handling Music API Response: ${err}`);
        mediaNotFound.push({
          Name: album,
          Path: err,
        });
      }
    });
}

// Call Google Books API
async function apiCallBooks(mediaValues, apikey) {
  let title = mediaValues.data.name;
  let author = mediaValues.data.author;
  let apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${title}+inauthor:${author}&langRestrict=en&maxResults=1&key=${apikey}`;
  let res = await axios.get(apiUrl);
  let mediaInfo = res.data;
  return mediaInfo;
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
    mediaResults.push({
      Title: mediaInfo.items[0].volumeInfo.title,
      Description: mediaInfo.items[0].volumeInfo.description,
      Creator: mediaInfo.items[0].volumeInfo.authors, //Author
      Categories: mediaInfo.items[0].volumeInfo.categories,
      Ratings: mediaInfo.items[0].volumeInfo.averageRating,
      ImageURL: mediaInfo.items[0].volumeInfo.imageLinks.thumbnail,
      Length: mediaInfo.items[0].volumeInfo.pageCount,
      Path: dbItem.data.path,
      Ext: dbItem.data.ext,
      ImageURLSmall: mediaInfo.items[0].volumeInfo.imageLinks,
      NumberOfRatings: mediaInfo.items[0].volumeInfo.ratingsCount,
      Year: mediaInfo.items[0].volumeInfo.publishedDate.slice(0, 4),
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
  } catch (err) {
    await mediaNotFoundError(dbItem);
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
    console.error(err);
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
  });
  res.write(
    `${counter++}. WARN: ${mediaName} API error with: ${
      mediaValues.name
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
