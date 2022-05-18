import React, { Component } from "react";
import NavBar from "./NavBar";
import "./medianotfound.css";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Loading from "./Loading";

// TODO: Change API Calls from Localhost to Server IP
export default class MediaNotFound extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navtitle: "Missing Media",
      isLoading: true,
      isEditing: false,
      editTitle: null,
      editCreator: null,
    };
    this.getMissingMedia = this.getMissingMedia.bind(this);
    this.openFolder = this.openFolder.bind(this);
    this.updateItem = this.updateItem.bind(this);
    this.onChangeEvt = this.onChangeEvt.bind(this);
    this.searchApi = this.searchApi.bind(this);
  }

  componentDidMount() {
    this.getMissingMedia();
  }

  async getMissingMedia() {
    let res = await axios.get(`/missingmedia`);
    this.missingMedia = res.data;
    this.missingBooks = this.missingMedia[0].books;
    this.missingMovies = this.missingMedia[0].movies;
    this.missingTv = this.missingMedia[0].tv;
    this.missingBooksTotal = "undefined" ? 0 : this.missingBooks.length;
    this.missingMoviesTotal = "undefined" ? 0 : this.missingMovies.length;
    this.missingTvTotal = "undefined" ? 0 : this.missingTv.length;

    this.missingBooksJsx = [];
    this.missingMoviesJsx = [];
    this.missingTvJsx = [];
    // Set Missing Books
    try {
      for (let i = 0; i < this.missingBooks.length; i++) {
        this.missingBook = this.missingBooks[i].data[0].Name.replace(
          /(^\w{1})|(\s+\w{1})/g,
          (letter) => letter.toUpperCase()
        );
        this.missingBookPathIndex =
          this.missingBooks[i].data[0].Path.lastIndexOf("/");
        this.missingBookPath = this.missingBooks[i].data[0].Path.slice(
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
              Path: {this.missingBooks[i].data[0].Path}
            </div>
            <button
              className="notFoundButton"
              onClick={this.openFolder}
              value={this.missingBookPath}
            >
              Open Folder
            </button>
            <button
              className="notFoundButton"
              onClick={this.updateItem}
              name={"updatebooks"}
              value={JSON.stringify(this.missingBooks[i].data[0])}
            >
              Update Item
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
            <button
              className="notFoundButton"
              onClick={this.updateItem}
              value={this.missingMoviePath}
              name={"updatemovies"}
            >
              Update Item
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
            <button
              className="notFoundButton"
              onClick={this.updateItem}
              value={this.missingTv}
              name={"updatetv"}
            >
              Update Item
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

  updateItem(e) {
    this.jsxEdit = [];
    this.mediaItemData = [];
    try {
      this.item = JSON.parse(e.target.value);
      this.mediaType = e.target.name;
      this.mediaItemData.push({ data: this.item, mediaType: this.mediaType });
    } catch (err) {
      // Close JSX Item
      this.setState({
        isEditing: false,
      });
      return;
    }

    this.jsxEdit.push(
      <div className="missingItemEdit" key={uuidv4()}>
        <div className="missingItemTitleBar">
          <h2
            style={{
              marginLeft: "10px",
            }}
          >
            Edit Item
          </h2>
          <i
            className="far fa-times-circle fa-2x"
            onClick={this.updateItem}
            style={{
              marginRight: "5px",
              marginTop: "-25px",
            }}
          ></i>
        </div>
        <div className="missingItemContent">
          <h3 style={{ textAlign: "center" }}>{this.item.Name}</h3>
          <div className="missingItemEditContent">
            <h4 style={{ width: "60px" }}>Title: </h4>{" "}
            <input
              className="editMediaItemInput"
              name={"title"}
              onChange={this.onChangeEvt}
              placeholder={this.item.Name}
            ></input>
          </div>
          <div className="missingItemEditContent">
            <h4 style={{ width: "60px" }}>Author: </h4>{" "}
            <input
              className="editMediaItemInput"
              name={"creator"}
              onChange={this.onChangeEvt}
              placeholder={this.item.Data.data.author}
            ></input>
          </div>
          <button
            value={JSON.stringify(this.mediaItemData)}
            onClick={this.searchApi}
            style={{
              marginBottom: "10px",
            }}
          >
            Update
          </button>
        </div>
      </div>
    );
    this.setState({
      isEditing: true,
    });
  }

  onChangeEvt(e) {
    this.item = e.target.name;
    this.value = e.target.value;
    if (this.item === "title") {
      this.setState({
        editTitle: e.target.value,
      });
    } else if (this.item === "creator") {
      this.setState({
        editCreator: e.target.value,
      });
    }
  }

  async searchApi(e) {
    let apiData = [];
    this.mediaType = JSON.parse(e.target.value)[0].mediaType;
    this.dbKey = JSON.parse(e.target.value)[0].data.Data.key;
    this.title = this.state.editTitle;
    this.creator = this.state.editCreator;
    this.path = JSON.parse(e.target.value)[0].data.Path;
    this.ext = JSON.parse(e.target.value)[0].data.Data.data.ext;

    apiData.push({
      mediaType: this.mediaType,
      key: this.dbKey,
      name: this.title,
      param2: this.creator,
      path: this.path,
      ext: this.ext,
    });
    console.log(this.mediaType, this.title, this.creator, this.dbKey);

    // Retry Item
    try {
      if (this.title.length > 0 && this.creator.length > 0) {
        console.log("Searching");
        let res = await axios.get(`/retrymissingitem`, {
          params: { data: apiData },
        });
        let data = res.data;

        if (data) {
          console.log(`Found Result For ${this.title}`);
          this.setState({
            isEditing: false,
          });
          this.getMissingMedia();
        } else if (!data) {
          console.log(`No Result Found For ${this.title}`);
        }
      }
    } catch (err) {
      console.warn("No Search Input. ", err);
    }
  }

  async openFolder(e) {
    this.folder = e.target.value;
    await axios.get(`/open`, {
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
            {this.state.isEditing === true ? this.jsxEdit : null}
            <h1 className="mediaNotFoundCategory">Missing Books:</h1>
            <div
              className="mediaNotFoundCategory"
              style={{ marginTop: "-20px", marginBottom: "10px" }}
            >
              Total Missing Books: {this.missingBooksTotal}
            </div>
            <div className="mediaNotFoundList">{this.missingBooksJsx}</div>
            <h1 className="mediaNotFoundCategory">Missing Movies:</h1>
            <div
              className="mediaNotFoundCategory"
              style={{ marginTop: "-20px", marginBottom: "10px" }}
            >
              Total Missing Movies: {this.missingMoviesTotal}
            </div>
            <div className="mediaNotFoundList">{this.missingMoviesJsx}</div>
            <h1 className="mediaNotFoundCategory">Missing TV Shows:</h1>
            <div
              className="mediaNotFoundCategory"
              style={{ marginTop: "-20px", marginBottom: "10px" }}
            >
              Total Missing TV Shows: {this.missingTvTotal}
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
