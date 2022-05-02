const fs = require("fs");

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
  return new Promise((resolve, reject) => {
    fs.readFile("./json/booksnotfound.json", async function (err, data) {
      if (err) {
        console.error(`Unable to Read Missing Media`);
      } else {
        books = JSON.parse(data);
        resolve(books);
      }
    });
  });
}

async function missingMovies() {
  return new Promise((resolve, reject) => {
    fs.readFile("./json/moviesNotFound.json", function (err, data) {
      if (err) {
        console.error(`Unable to Read Missing Media`);
      } else {
        movies = JSON.parse(data);
        resolve(movies);
      }
    });
  });
}

async function missingTv() {
  return new Promise((resolve, reject) => {
    fs.readFile("./json/tvshowsnotfound.json", function (err, data) {
      if (err) {
        console.error(`Unable to Read Missing Media`);
      } else {
        tv = JSON.parse(data);
        resolve(tv);
      }
    });
  });
}

module.exports = { missingMedia };
