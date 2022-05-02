import React, { Component } from "react";
import NavBar from "./NavBar";
import "./medianotfound.css";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Loading from "./Loading";

export default class MediaNotFound extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navtitle: "Missing Media",
      isLoading: true,
    };
    this.getMissingMedia = this.getMissingMedia.bind(this);
    this.openFolder = this.openFolder.bind(this);
  }

  componentDidMount() {
    this.getMissingMedia();
  }

  async getMissingMedia() {
    let res = await axios.get(`http://localhost:3020/missingmedia`);
    this.missingMedia = res.data;

    this.missingBooks = this.missingMedia[0].books;
    this.missingMovies = this.missingMedia[0].movies;
    this.missingTv = this.missingMedia[0].tv;
    this.missingBooksJsx = [];
    this.missingMoviesJsx = [];
    this.missingTvJsx = [];

    // Set Missing Books
    try {
      for (let i = 0; i < this.missingBooks.length; i++) {
        this.missingBook = this.missingBooks[i].Name.replaceAll("+", " ");
        this.missingBook = this.missingBook.replace(
          /(^\w{1})|(\s+\w{1})/g,
          (letter) => letter.toUpperCase()
        );
        this.missingBookPathIndex = this.missingBooks[i].Path.lastIndexOf("/");
        this.missingBookPath = this.missingBooks[i].Path.slice(
          0,
          this.missingBookPathIndex
        );

        this.missingBooksJsx.push(
          <div
            className="missingMediaItem"
            title={this.missingBook}
            key={uuidv4()}
          >
            <div className="missingMediaItemText">Item {[i + 1]}: </div>
            <div className="missingMediaItemText">Name: {this.missingBook}</div>
            <div className="missingMediaItemText">
              Path: {this.missingBooks[i].Path}
            </div>
            <button
              className="notFoundButton"
              onClick={this.openFolder}
              value={this.missingBookPath}
            >
              Open Folder
            </button>
            <br />
          </div>
        );
      }
    } catch (err) {
      this.missingBooksJsx.push(
        <div key={uuidv4()}>There are no missing books.</div>
      );
    }

    // Set Missing Movies
    try {
      for (let i = 0; i < this.missingMovies.length; i++) {
        this.missingMoviePathIndex =
          this.missingMovies[i].Path.lastIndexOf("/");
        this.missingMoviePath = this.missingMovies[i].Path.slice(
          0,
          this.missingMoviePathIndex
        );

        this.missingMoviesJsx.push(
          <div
            className="missingMediaItem"
            title={this.missingMovies[i].Name}
            key={uuidv4()}
          >
            <div className="missingMediaItemText">Item {[i + 1]}: </div>
            <div className="missingMediaItemText">
              Name: {this.missingMovies[i].Name}
            </div>
            <div className="missingMediaItemText">
              Path: {this.missingMovies[i].Path}
            </div>
            <button
              className="notFoundButton"
              onClick={this.openFolder}
              value={this.missingMoviePath}
            >
              Open Folder
            </button>
            <br />
          </div>
        );
      }
    } catch (err) {
      this.missingMoviesJsx.push(
        <div key={uuidv4()}>There are no missing movies.</div>
      );
    }

    // Set Missing TV
    try {
      for (let i = 0; i < this.missingTv.length; i++) {
        this.missingTvPathIndex = this.missingTv[i].Path.lastIndexOf("/");
        this.missingMoviePath = this.missingTv[i].Path.slice(
          0,
          this.missingTvPathIndex
        );

        this.missingTvJsx.push(
          <div
            className="missingMediaItem"
            title={this.missingTv[i].Name}
            key={uuidv4()}
          >
            <div className="missingMediaItemText">Item {[i + 1]}: </div>
            <div className="missingMediaItemText">
              Name: {this.missingTv[i].Name}
            </div>
            <div className="missingMediaItemText">
              Path: {this.missingTv[i].Path}
            </div>
            <button
              className="notFoundButton"
              onClick={this.openFolder}
              value={this.missingMoviePath}
            >
              Open Folder
            </button>
            <br />
          </div>
        );
      }
    } catch (err) {
      this.missingTvJsx.push(
        <div key={uuidv4()}>There are no missing TV shows.</div>
      );
    }

    this.setState({
      isLoading: false,
    });
  }

  async openFolder(e) {
    this.folder = e.target.value;
    await axios.get(`http://localhost:3020/open`, {
      params: { data: this.folder },
    });
  }

  render() {
    return (
      <div className="mediaNotFoundPage">
        <NavBar {...this.state} />
        {this.state.isLoading ? (
          <Loading />
        ) : (
          <div className="mediaNotFoundContainer">
            <h1 className="mediaNotFoundCategory">Missing Books:</h1>
            <div
              className="mediaNotFoundCategory"
              style={{ marginTop: "-20px", marginBottom: "10px" }}
            >
              Total Missing Books: {this.missingBooks.length}
            </div>
            <div className="mediaNotFoundList">{this.missingBooksJsx}</div>
            <h1 className="mediaNotFoundCategory">Missing Movies:</h1>
            <div
              className="mediaNotFoundCategory"
              style={{ marginTop: "-20px", marginBottom: "10px" }}
            >
              Total Missing Movies: {this.missingMovies.length}
            </div>
            <div className="mediaNotFoundList">{this.missingMoviesJsx}</div>
            <h1 className="mediaNotFoundCategory">Missing TV Shows:</h1>
            <div
              className="mediaNotFoundCategory"
              style={{ marginTop: "-20px", marginBottom: "10px" }}
            >
              Total Missing TV Shows: {this.missingTv.length}
            </div>
            <div className="mediaNotFoundList">{this.missingTvJsx}</div>
            <h1 className="mediaNotFoundCategory">Missing Music:</h1>
            <div className="mediaNotFoundList">
              <div className="missingMediaItem">
                <p style={{ marginLeft: "10px" }}>
                  Missing music items are still displayed on the music page.
                  They are distinguished by having a music note instead of an
                  album cover.
                </p>
              </div>
            </div>
            <h1 className="mediaNotFoundList">Missing Photos:</h1>
            <div className="mediaNotFoundList">
              <div className="missingMediaItem">
                <p style={{ marginLeft: "10px" }}>
                  Photos do not require an API call. If a photo is missing,
                  check your directory name or scan location. If the photo is
                  still not there it's file extension may not yet be supported.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
