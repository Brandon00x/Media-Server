const { databaseAction } = require("../database/mongodb");

async function missingMedia() {
  let missingMedia = [];
  let books = await missingBooks();
  let movies = await missingMovies();
  let tv = await missingTv();

  missingMedia.push({
    books: books,
    tv: tv,
    movies: movies,
  });
  return missingMedia;
}

async function missingBooks() {
  let cmd = { cmd: "find", collection: "Missing Books" };
  let books = await databaseAction(cmd);
  if (books.includes("No Search Results Found")) {
    return;
  }
  return books;
}

async function missingMovies() {
  let cmd = { cmd: "find", collection: "Missing Movies" };
  let movies = await databaseAction(cmd);
  if (movies.includes("No Search Results Found")) {
    return;
  }
  return movies;
}

async function missingTv() {
  let cmd = { cmd: "find", collection: "Missing TV Shows" };
  let tv = await databaseAction(cmd);
  if (tv.includes("No Search Results Found")) {
    return;
  }
  return tv;
}

module.exports = { missingMedia };
