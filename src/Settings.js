import React, { Component } from "react";
import NavBar from "./NavBar";
import axios from "axios";
import "./settings.css";

const startPort = require("./port.txt");

export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navtitle: "Settings",
      startPort: "",
      port: "",
      apikeymovie: "Movie API Key",
      apikeybooks: "Books API Key",
      apikeymusic: "Music API Key",
      booksRootFolder: "",
      moviesRootFolder: "",
      musicRootFolder: "",
      tvRootFolder: "",
      photoRootFolder: "",
    };
    this.getSavedData = this.getSavedData.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.saveChangesToServer = this.saveChangesToServer.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.updateMedia = this.updateMedia.bind(this);
  }

  componentDidMount() {
    this.getSavedData();
  }

  scrollToBottom = () => {
    const element = document.getElementById("serverMessages");
    element.scrollTop = element.scrollHeight;
  };

  async getSavedData() {
    fetch(startPort)
      .then((r) => r.text())
      .then((port) => {
        this.setState({
          port: port,
          startPort: port,
        });
        return port;
      })
      .then(async (port) => {
        let res = await axios.get(`http://localhost:${port}/settings`);
        let data = res.data;
        this.setState({
          apikeymovie: data.keyMovies,
          apikeybooks: data.keyBooks,
          apikeymusic: data.keyMusic,
          booksRootFolder: data.folderBooks,
          moviesRootFolder: data.folderMovies,
          musicRootFolder: data.folderMusic,
          tvRootFolder: data.folderTv,
          photoRootFolder: data.folderPhotos,
        });
      });
  }

  // Update Media (Books, Movies, Music)
  async updateMedia(e) {
    try {
      const serverMessages = document.getElementById("serverMessages");
      let mediaCategory = e.target.name;
      let mediaPath = e.target.value;
      // Does not need to be tons of if statements.
      if (mediaCategory === "updatebooks") {
        let mediaType = "Books";
        serverMessages.innerText += `Starting Local ${mediaType} Scan...\n This could take some time if your root folder contains a lot of items\n`;
      } else if (mediaCategory === "updatemovies") {
        let mediaType = "Movies";
        serverMessages.innerText += `Starting Local ${mediaType} Scan...\n This could take some time if your root folder contains a lot of items\n`;
      } else if (mediaCategory === "updatetv") {
        let mediaType = "TV Shows";
        serverMessages.innerText += `Starting Local ${mediaType} Scan...\n This could take some time if your root folder contains a lot of items\n`;
      } else if (mediaCategory === "updatemusic") {
        let mediaType = "Music";
        serverMessages.innerText += `Starting Local ${mediaType} Scan...\n This could take some time if your root folder contains a lot of items\n`;
      } else if (mediaCategory === "updatephotos") {
        let mediaType = "Music";
        serverMessages.innerText += `Starting Local ${mediaType} Scan...\n This could take some time if your root folder contains a lot of items\n`;
      }
      let res = await fetch(`http://localhost:3020/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: mediaCategory, path: mediaPath }),
      });
      let reader = res.body.getReader();
      let result;
      let decoder = new TextDecoder("utf8");
      while (!result?.done) {
        result = await reader.read();
        let chunk = decoder.decode(result.value);
        this.scrollToBottom();
        try {
          if (chunk.length > 0) {
            serverMessages.innerText += `${chunk}\n`;
          }
        } catch (err) {
          console.warn("Error in Read Engine Data: ", err);
        }
      }
    } catch (err) {
      console.error("Error: Unable to update media: ", err);
    }
  }

  // Handle Input Box Change
  handleChange(e) {
    let newValue = e.target.value;
    this.setState({
      [e.target.id]: newValue,
    });
  }

  // Handle Submit Change then save
  async handleSubmit(e) {
    let savedValue = e.target.value;
    let property = e.target.name;
    console.info(`Submit Target: ${property}\nSubmit Value ${savedValue}`);
    this.setState({
      [property]: savedValue,
    });
    this.saveChangesToServer(property, savedValue);
  }

  // Save Folders, API Keys, or PORT changes.
  async saveChangesToServer(property, value) {
    const serverMessages = document.getElementById("serverMessages");
    serverMessages.innerText += `INFO: Updating Property: ${property}. Value: ${value}\n`;
    let res = await fetch(`http://localhost:${this.state.startPort}/save`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        property: property,
        data: value,
      }),
    });
    let reader = res.body.getReader();
    let result;
    let decoder = new TextDecoder("utf8");
    while (!result?.done) {
      result = await reader.read();
      let chunk = decoder.decode(result.value);
      this.scrollToBottom();
      try {
        if (chunk.length > 0) {
          serverMessages.innerText += `${chunk}\n`;
        }
      } catch (err) {
        console.warn("Error in Read Engine Data: ", err);
      }
    }
  }

  render() {
    return (
      <div className="settingsPage">
        <NavBar {...this.state} />
        <div className="settingsContainer">
          <div className="settingsComponents">
            <div className="scanFolderOptions">
              {/* SCAN OPTIONS */}
              <h4>Media Folder Locations</h4>
              <span className="mediaRootDirectory">
                <span className="mediaDirectoryTitle">Books Folder:</span>
                <input
                  id="booksRootFolder"
                  className="rootDirectoryInput"
                  value={this.state.booksRootFolder}
                  onChange={this.handleChange}
                  placeholder="Example: C:\Books | ~/Books | \\network\share"
                ></input>
                <button
                  className="settingsScanButton"
                  value={this.state.booksRootFolder}
                  name={"booksRootFolder"}
                  onClick={this.handleSubmit}
                >
                  Save
                </button>
                <button
                  name={"updatebooks"}
                  value={this.state.booksRootFolder}
                  className="settingsScanButton"
                  onClick={this.updateMedia}
                >
                  Scan Books
                </button>
              </span>
              <span className="mediaRootDirectory">
                <span className="mediaDirectoryTitle">Movies Folder:</span>
                <input
                  id="moviesRootFolder"
                  value={this.state.moviesRootFolder}
                  onChange={this.handleChange}
                  className="rootDirectoryInput"
                  placeholder="Example: C:\Movies | ~/Movies | \\network\share"
                ></input>
                <button
                  name={"moviesRootFolder"}
                  value={this.state.moviesRootFolder}
                  onClick={this.handleSubmit}
                  className="settingsScanButton"
                >
                  Save
                </button>
                <button
                  className="settingsScanButton"
                  value={this.state.moviesRootFolder}
                  name={"updatemovies"}
                  onClick={this.updateMedia}
                >
                  Scan Movies
                </button>
              </span>
              <span className="mediaRootDirectory">
                <span className="mediaDirectoryTitle">TV Folder:</span>
                <input
                  id="tvRootFolder"
                  value={this.state.tvRootFolder}
                  onChange={this.handleChange}
                  className="rootDirectoryInput"
                  placeholder="Example: C:\Movies | ~/Movies | \\network\share"
                ></input>
                <button
                  name={"tvRootFolder"}
                  value={this.state.tvRootFolder}
                  onClick={this.handleSubmit}
                  className="settingsScanButton"
                >
                  Save
                </button>
                <button
                  className="settingsScanButton"
                  value={this.state.tvRootFolder}
                  name={"updatetv"}
                  onClick={this.updateMedia}
                >
                  Scan TV
                </button>
              </span>
              <span className="mediaRootDirectory">
                <span className="mediaDirectoryTitle">Music Folder:</span>
                <input
                  id="musicRootFolder"
                  className="rootDirectoryInput"
                  value={this.state.musicRootFolder}
                  onChange={this.handleChange}
                  placeholder="Example: C:\Music | ~/Music | \\network\share"
                ></input>
                <button
                  className="settingsScanButton"
                  value={this.state.musicRootFolder}
                  name={"musicRootFolder"}
                  onClick={this.handleSubmit}
                >
                  Save
                </button>
                <button
                  className="settingsScanButton"
                  value={this.state.musicRootFolder}
                  name={"updatemusic"}
                  onClick={this.updateMedia}
                >
                  Scan Music
                </button>
              </span>
              <span className="mediaRootDirectory">
                <span className="mediaDirectoryTitle">Photos Folder:</span>
                <input
                  id="photoRootFolder"
                  value={this.state.photoRootFolder}
                  onChange={this.handleChange}
                  className="rootDirectoryInput"
                  placeholder="Example: C:\Movies | ~/Movies | \\network\share"
                ></input>
                <button
                  name={"photoRootFolder"}
                  value={this.state.photoRootFolder}
                  onClick={this.handleSubmit}
                  className="settingsScanButton"
                >
                  Save
                </button>
                <button
                  className="settingsScanButton"
                  value={this.state.photoRootFolder}
                  name={"updatephotos"}
                  onClick={this.updateMedia}
                >
                  Scan Photos
                </button>
              </span>
            </div>

            {/* PROGRAM OPTIONS */}
            <div>
              <div className="settingsProgramOptions">
                <h4>Program Options</h4>
                <span className="settingsProgramItem">
                  <span className="settingsProgramTitle">Port:</span>
                  <input
                    id="port"
                    className="settingsPortInput"
                    placeholder="3000"
                    maxLength={5}
                    value={this.state.port}
                    onChange={this.handleChange}
                  />
                  <button
                    name={"port"}
                    onClick={this.handleSubmit}
                    value={this.state.port}
                    className="settingsProgramButton"
                  >
                    Save
                  </button>
                </span>
              </div>
              <div>
                <span className="settingsProgramItem">
                  <span className="settingsProgramTitle">Book API Key:</span>
                  <input
                    id="apikeybooks"
                    className="settingsApiKey"
                    value={this.state.apikeybooks}
                    onChange={this.handleChange}
                  />
                  <button
                    name={"apikeybooks"}
                    className="settingsProgramButton"
                    value={this.state.apikeybooks}
                    onClick={this.handleSubmit}
                  >
                    Save
                  </button>
                </span>
              </div>
              <div>
                <span className="settingsProgramItem">
                  <span className="settingsProgramTitle">
                    Movie & TV API Key:
                  </span>
                  <input
                    id="apikeymovie"
                    className="settingsApiKey"
                    value={this.state.apikeymovie}
                    onChange={this.handleChange}
                  />
                  <button
                    name={"apikeymovie"}
                    className="settingsProgramButton"
                    value={this.state.apikeymovie}
                    onClick={this.handleSubmit}
                  >
                    Save
                  </button>
                </span>
              </div>
              <div>
                <span className="settingsProgramItem">
                  <span className="settingsProgramTitle">Music API Key:</span>
                  <input
                    id="apikeymusic"
                    className="settingsApiKey"
                    value={this.state.apikeymusic}
                    onChange={this.handleChange}
                  />
                  <button
                    name={"apikeymusic"}
                    value={this.state.apikeymusic}
                    className="settingsProgramButton"
                    onClick={this.handleSubmit}
                  >
                    Save
                  </button>
                </span>
              </div>

              {/* MEDIA NOT FOUND */}
              <div className="settingsProgramOptions">
                <h4>View Media Items With API Errors:</h4>
                <p>
                  View media items whose results were not found by the API and
                  fix their names.
                </p>
                <a
                  style={{
                    backgroundColor: "rgb(239, 239, 239)",
                    textDecoration: "none",
                    color: "black",
                    borderWidth: "2px",
                    borderStyle: "outset",
                    borderColor: "rgb(118, 118, 118)",
                    padding: "1px 6px",
                    borderImage: "initial",
                    fontSize: "14px",
                  }}
                  href="/missingmedia"
                >
                  View Missing Media
                </a>
              </div>

              {/* SCAN INSTRUCTIONS */}
              <div className="settingsDescription">
                <h4>Scan Information</h4>
                <p>Root Folder Acceptable Names:</p>
                <p>
                  All media types must be inside of a folder with the names
                  listed below. The folder name does not have to be exact, it
                  must contain the phrase listed below though.
                  <li>Books: "Book" </li>
                  <li>TV Shows: "TV Show" </li>
                  <li>Movies: "Movie" </li>
                  <li>Music: "Music" </li>
                  <li>Photos: "Photo" </li>
                </p>
                <p>How to scan:</p>
                <p>
                  When scanning for a media type the media type folder must have
                  the media type's name in it. For example if you are scanning
                  for movies the root folder of movies MUST have "movie"
                  somewhere in it's name. Acceptable folders could be named
                  "Movies", "MOVIES", "MoViEs4K", if you like to live
                  dangerously, "fjkldsafaMovieFDASF", or anything else that
                  meets the rule.{" "}
                </p>
                <p>Scanning Multiple Directories:</p>
                <p>
                  If your media type is in multiple directories use the media
                  types root directory. For example if your folder structure is
                  /Volumes/Movies {">"} MoviesHD | Movies4K | MoviesOther simply
                  use /Volumes/Movies as the scan folder. The folder /Volumes
                  would also be acceptable but take more time.{" "}
                </p>
                <p>Misc Scan Information:</p>
                <p>
                  The media scan will NOT scan if the root directory is an
                  operating system root directory such as "/", "C://",
                  "MACINTOSH HD". However, if those are entered the scan will
                  look 1 sub directory deep and if it does find a folder
                  matching media type name above it will complete the scan.
                </p>
                <span className="settingsProgramTitle"> </span>
              </div>
            </div>
            <div className="settingsServerResponseContainer">
              <h4>Server Messages:</h4>
              <span id="serverMessages" className="serverMessages"></span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
