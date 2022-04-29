import React, { Component } from "react";
import axios from "axios";
import NavBar from "./NavBar";
import { v4 as uuidv4 } from "uuid";
import { Card, Button } from "react-bootstrap";
import "./media.css";
import ShowInBrowser from "./ShowInBrowser";
import Loading from "./Loading";

const url = "http://localhost:3020/getmedia";
const urlTvSeasons = "http://localhost:3020/getseason";
const photoUrl = "http://localhost:3020/photo";

export default class Template extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: true, // Toggle Show Loading Page
      noMediaFound: true, // Toggle No Media Found Page
      isSortedAlphabetically: true, // Sorted Alphabetically
      isSortedByYear: false, // Sorted By Year/Relase Date/Publish Data
      isSortedByLength: false, // Sorted By Pages/Time/Tracks
      sortedBy: "Ascending Title", // Navbar Sorted Title
      navtitle: this.props.navtitle, // Navbar Main Title from Media Component
      showInBrowser: false, // Toggle Show Media Item in Component: Show In Browser
      showInBrowserObject: null, // Set Media Object Used in Show in Browser Component
      showInSameWindow: false, // Toggle Show Media Object in Same Browser Window
      showInSameWindowObject: null, // Set Media Object used in Show in Same Window Object
    };
    // See Comments Above Functions
    this.getMedia = this.getMedia.bind(this);
    this.createRows = this.createRows.bind(this);
    this.cardTop = this.cardTop.bind(this);
    this.cardMiddle = this.cardMiddle.bind(this);
    this.cardBottom = this.cardBottom.bind(this);
    this.showDescription = this.showDescription.bind(this);
    this.openMedia = this.openMedia.bind(this);
    this.sort = this.sort.bind(this);
    this.sortYear = this.sortYear.bind(this);
    this.sortLength = this.sortLength.bind(this);
    this.getLocalPhoto = this.getLocalPhoto.bind(this);
    this.openInBrowser = this.openInBrowser.bind(this);
    this.showPhoto = this.showPhoto.bind(this);
    this.playInBrowser = this.playInBrowser.bind(this);
    this.readInBrowser = this.readInBrowser.bind(this);
    this.closeBrowserMedia = this.closeBrowserMedia.bind(this);
    this.scrollToTop = this.scrollToTop.bind(this);
    this.getSeason = this.getSeason.bind(this);
    this.mapMusic = this.mapMusic.bind(this);
    this.playLocalSong = this.playLocalSong.bind(this);
    this.closeMediaPlayer = this.closeMediaPlayer.bind(this);
    this.musicControls = this.musicControls.bind(this);
  }

  // Component Mounted
  async componentDidMount() {
    await this.getMedia();
  }

  // Scrolls to Top of Page when Called.
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Create Music Cards
  async mapMusic(data, mediaType) {
    this.songs = [];
    this.songPaths = [];
    this.albumColors = [];
    //this.downloadValue = [];
    this.noDescription = "nodesc";
    this.descriptionOn = "desc";

    // Loop Through Albums To Make Cards
    let x = 0;
    this.albumNumber = 0;

    // Loop Through Artists
    for (let i = 0; i < data.length; i++) {
      // Stop Looping
      if (i === data.length - 1) {
        break;
      }
      // While Albums + 1 !== Undefined => Create Cards
      do {
        if (data[i].Albums.length >= 1) {
          // Assign Data
          this.albumColor1 = data[i].Albums[x].Attributes.textColor1;
          this.albumColor2 = data[i].Albums[x].Attributes.textColor2;
          this.albumColor3 = data[i].Albums[x].Attributes.textColor3;
          this.albumColor4 = data[i].Albums[x].Attributes.textColor4;
          this.albumColors.push({
            color1: this.albumColor1,
            color2: this.albumColor2,
            color3: this.albumColor3,
            color4: this.albumColor4,
          });
          this.albumId = data[i].Albums[x].id;
          this.localTrackCount = data[i].Albums[x].LocalTrackCount;

          // Get Song Data for Album
          for (let y = 0; y < data[i].Albums[x].Tracks.length; y++) {
            // TODO: Add Database Push for Album / Songs
            // Push Inital Song Track for Next Songs
            if (y === 0) {
              this.songPaths.push({
                Song: data[i].Albums[x].Tracks[y].Track,
                Track: data[i].Albums[x].Tracks[y].TrackNumber,
                Path: data[i].Albums[x].Tracks[y].Path,
              });
            }
            // Push Song Tracks for Next Songs
            if (y <= data[i].Albums[x].Tracks.length - 2) {
              this.songPaths.push({
                Song: data[i].Albums[x].Tracks[y + 1].Track,
                Track: data[i].Albums[x].Tracks[y + 1].TrackNumber,
                Path: data[i].Albums[x].Tracks[y + 1].Path,
              });
            }
            this.trackKey = data[i].Result;
            this.trackNumber = data[i].Albums[x].Tracks[y].TrackNumber;
            this.trackName = data[i].Albums[x].Tracks[y].Track;
            this.trackPath = data[i].Albums[x].Tracks[y].Path;
            this.key = uuidv4();
            this.songs.push(
              <div className="musicTracks" key={this.key}>
                <span className="musicTrack">
                  {this.trackNumber}. {this.trackName}
                </span>
                <div className="musicButtonDiv">
                  <button
                    className="musicOpenTrack"
                    onClick={this.openMedia}
                    value={JSON.stringify({ Path: this.trackPath })}
                    style={{
                      backgroundColor: `#${this.albumColor1}`,
                      color: `#${this.albumColor4}`,
                      border: "none",
                    }}
                  >
                    Open
                  </button>
                  <button
                    id="musicPlaySong"
                    className="musicOpenTrack"
                    onClick={this.playLocalSong}
                    name={this.trackName}
                    title={this.trackNumber}
                    value={JSON.stringify(this.songPaths)}
                    music={JSON.stringify({
                      artist: data[i].Artist,
                      album: data[i].Albums[x].Album,
                    })}
                    colors={JSON.stringify(this.albumColors)}
                    style={{
                      backgroundColor: `#${this.albumColor1}`,
                      color: `#${this.albumColor4}`,
                      border: "none",
                    }}
                  >
                    Play
                  </button>
                </div>
              </div>
            );
          }

          // Create Main Card
          this.mediaCards.push(
            <Card
              className="mediaCard"
              key={uuidv4()}
              title={data[i].Albums[x].Album}
              year={data[i].Albums[x].Year}
              length={data[i].Albums[x].TrackCount}
              style={{
                backgroundColor: `#${this.albumColor1}`,
                color: `#${this.albumColor4}`,
              }}
            >
              {this.cardTop(
                data[i].Albums[x].Album,
                mediaType,
                null,
                data[i].Albums[x].Attributes.url,
                null
              )}
              {this.cardMiddle(
                data[i].Artist,
                data[i].Albums[x].Genres,
                mediaType,
                data[i].Albums[x].TrackCount,
                this.albumNumber++,
                data[i].Albums[x].Year,
                data[i].Albums[x].Description
              )}
              {this.cardBottom(
                { Path: data[i].Albums[x].Path },
                mediaType,
                data[i].Albums[x].Album,
                this.albumNumber,
                this.noDescription,
                null,
                null
              )}
            </Card>
          );

          // Set Album Description
          if (data[i].Albums[x].Description.length > 1) {
            let html = { __html: data[i].Albums[x].Description };
            this.descriptionText = (
              <div>
                <h4 className="mediaDescriptionTitle">Description</h4>
                <p dangerouslySetInnerHTML={html}></p>
              </div>
            );
          } else {
            this.descriptionText = null;
          }

          // Create Description Card
          this.mediaCardsDescription.push(
            <Card
              className="mediaCard"
              key={uuidv4()}
              title={data[i].Albums[x].Album}
              year={data[i].Albums[x].Year}
              length={data[i].Albums[x].TrackCount}
              style={{
                backgroundColor: `#${this.albumColor1}`,
                color: `#${this.albumColor4}`,
              }}
            >
              <div className="mediaTitle">{data[i].Albums[x].Album}</div>
              <div className="mediaDescription">
                <h4 className="mediaDescriptionTitle">
                  Tracks | Description | Info
                </h4>
                <h4 className="mediaDescriptionTitle">Tracks</h4>
                <div
                  className="musicTrackHolder"
                  style={{ borderColor: this.albumColor2 }}
                >
                  {this.songs}
                </div>
                {this.descriptionText}
                <h4 className="mediaDescriptionTitle">Misc Info</h4>
                <p>Local Tracks: {this.localTrackCount}</p>
                <p>
                  Local Library has All Tracks:{" "}
                  {data[i].Albums[x].HasAllTracks.toString()}
                </p>
                <div className="musicDescriptionButtonDiv">
                  <button
                    className="musicOpenFolderButton"
                    value={JSON.stringify({ Path: data[i].Path })}
                    onClick={this.openMedia}
                    style={{
                      backgroundColor: `#${this.albumColor1}`,
                      color: `#${this.albumColor4}`,
                    }}
                  >
                    Artist Folder
                  </button>
                  <button
                    className="musicOpenFolderButton"
                    value={JSON.stringify({ Path: data[i].Albums[x].Path })}
                    onClick={this.openMedia}
                    style={{
                      backgroundColor: `#${this.albumColor1}`,
                      color: `#${this.albumColor4}`,
                    }}
                  >
                    Album Folder
                  </button>
                </div>
              </div>
              {this.cardBottom(
                { Path: data[i].Albums[x].Path },
                mediaType,
                data[i].Albums[x].Album,
                this.albumNumber,
                this.descriptionOn,
                null,
                null
              )}
            </Card>
          );

          // Reset Arrays for Next Album Loop
          this.songs = [];
          this.songPaths = [];
          this.albumColors = [];
          //this.downloadValue = [];
          x = x + 1;
        }
      } while (x <= data[i].Albums.length - 1);
      // Reset Next Artist Loop
      if (data[i].Result !== data[i + 1].Result) {
        x = 0;
      }
    }
    this.createRows();
  }

  // TODO: Add Database Calls for Album Songs.
  // Play Local Song in Browser
  async playLocalSong(e) {
    // Music Player Styling and Information
    this.colors = JSON.parse(e.target.attributes.colors.value);
    this.trackNumber = parseInt(e.target.title);
    this.trackName = e.target.name;
    this.albumInfo = JSON.parse(e.target.attributes.music.value);
    this.artist = this.albumInfo.artist;
    this.album = this.albumInfo.album;
    this.songPath = JSON.parse(e.target.value);

    // Next Song Load Place Holder JSX
    this.nextSongPlaceHolder = (
      <div
        className="musicPlayer"
        style={{
          borderColor: `#${this.colors[0].color4}`,
          backgroundColor: `#${this.colors[0].color1}`,
        }}
      ></div>
    );
    this.setState({
      showInSameWindowObject: this.nextSongPlaceHolder,
    });

    // Get Song Path Matching Track Number (Used for Prev/Next)
    for (let i = 0; i < this.songPath.length; i++) {
      // Match Track Number to Track Path
      if (this.trackNumber === this.songPath[i].Track) {
        //console.log(`Matched: ${this.songPath[i].Path} `);
        this.songPath = this.songPath[i].Path;
        // Set Prev Song Path (If Defined)
        if (i >= 1) {
          this.prevSong = this.songPath[i - 1].Song;
          this.prevSongTrack = this.songPath[i - 1].Track;
          this.prevSongPath = this.songPath[i - 1];
        }
        // Set Next Song Path (If Defined)
        if (i <= this.songPath.length) {
          this.nextSong = this.songPath[i + 1].Song;
          this.nextSongTrack = this.songPath[i + 1].Track;
          this.nextSongPath = this.songPath[i + 1].Path;
        }
        break;
      }
    }
    // Set Song Path
    await axios.get(`http://localhost:3020/setmusic`, {
      params: { path: this.songPath, song: this.trackName },
    });

    // Create Music Player JSX
    this.musicPlayer = (
      <div
        className="musicPlayer"
        style={{
          borderColor: `#${this.colors[0].color4}`,
          backgroundColor: `#${this.colors[0].color1}`,
        }}
      >
        <div
          style={{ color: `#${this.colors[0].color4}`, marginRight: "20px" }}
        >
          <h1 style={{ marginBottom: "-25px" }}>{this.trackName}</h1>
          <h4>
            {this.album} | {this.artist}
          </h4>
        </div>
        <div className="musicControlsDiv">
          {/* Prev Icon */}
          <i
            className="fas fa-angle-double-left fa-2x musicControls"
            id="musicPrev"
            onClick={this.musicControls}
            style={{
              color: `#${this.colors[0].color2}`,
              position: "relative",
            }}
          />
          {/* Play Icon */}
          <i
            className="fas fa-play fa-2x musicControls"
            id="musicPlay"
            onClick={this.musicControls}
            style={{
              color: `#${this.colors[0].color2}`,
              position: "relative",
            }}
          />
          {/* Pause Icon */}
          <i
            className="fas fa-pause fa-2x musicControls"
            id="musicPause"
            onClick={this.musicControls}
            style={{
              color: `#${this.colors[0].color2}`,
              position: "relative",
            }}
          />
          {/* Next Icon */}
          <button
            className="fas fa-angle-double-right fa-2x musicControls"
            id="musicNext"
            onClick={this.playLocalSong}
            style={{
              color: `#${this.colors[0].color2}`,
              position: "relative",
              background: "none",
              border: "none",
            }}
            name={this.nextSong}
            title={this.nextSongTrack}
            value={e.target.value}
          />
        </div>
        <audio id="musicPlayer" autoPlay>
          <source src="http://localhost:3020/streammusic" type="audio/ogg" />
          <source src="http://localhost:3020/streammusic" type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        <span>
          <i
            onClick={this.closeMediaPlayer}
            className="fas fa-stop fa-2x"
            style={{
              color: `#${this.colors[0].color2}`,
              position: "relative",
            }}
          />
        </span>
      </div>
    );

    this.setState({
      showInSameWindow: true,
      showInSameWindowObject: this.musicPlayer,
    });
    this.scrollToTop();
  }

  // Music Controls for Media Type Music
  musicControls(e) {
    this.mediaEvent = e.target.id;
    this.musicSource = document.getElementById("musicPlayer");
    console.log(this.mediaEvent);
    if (this.mediaEvent === "musicPause") {
      this.musicSource.pause();
    } else if (this.mediaEvent === "musicPlay") {
      this.musicSource.play();
    } else if (this.mediaEvent === "musicNext") {
      //this.musicSource.next();
    } else if (this.mediaEvent === "musicPrev") {
      //this.musicSource.prev();
    }
  }

  // Get Media Items from JSON and Make Display Cards
  async getMedia() {
    let mediaType = this.props.navtitle;
    console.info("Template Media Type: ", mediaType);
    try {
      this.mediaCards = [];
      this.mediaCardsDescription = [];
      let res = await axios.post(url, {
        data: mediaType,
      });
      let data = res.data;
      // Call Map Music Data (Do Not Execute Rest of Function)
      if (mediaType === "Music") {
        this.mapMusic(data, mediaType);
        return;
      }
      // No Data Was Found - Set No Media Found Page.
      if (data.message === `No ${mediaType} Found`) {
        console.warn(`No ${mediaType} Found`);
        this.setState({
          noMediaFound: true,
          isLoading: false,
        });
        return;
      }
      // Create Cards for TV, Movies, Books, Photos
      else {
        for (let i = 0; i < data.length; i++) {
          this.title = data[i].Title;
          this.creator =
            mediaType === "TV Shows" ? data[i].Actors : data[i].Creator;
          this.description = data[i].Description;
          this.categories = data[i].Categories;
          this.path = data[i].Path;
          this.ext = data[i].Ext;
          this.imgUrl = data[i].ImageURL;
          mediaType === "Photos"
            ? (this.photo = await this.getLocalPhoto(data[i].ImageURL))
            : (this.photo = null);
          mediaType === "Photos"
            ? (this.imgType = data[i].Ext.slice(1))
            : (this.imgType = null);
          this.length =
            data[i].Length === undefined || data[i].Length === "N/A"
              ? "0"
              : data[i].Length.toString();
          this.key = uuidv4();
          this.year =
            data[i].Year === undefined ? "0" : data[i].Year.toString();
          this.downloadValue = {
            Path: this.path,
            Title: this.title,
            Ext: this.ext,
            Img: this.imgUrl,
          };
          this.noDescription = "nodesc";
          this.descriptionOn = "desc";
          this.mediaCards.push(
            <Card
              className="mediaCard"
              key={this.key}
              title={this.title}
              year={this.year}
              length={this.length}
            >
              {this.cardTop(
                this.title,
                mediaType,
                this.imgType,
                this.imgUrl,
                this.photo
              )}
              {this.cardMiddle(
                this.creator,
                this.categories,
                mediaType,
                this.length,
                i,
                this.year,
                this.description
              )}
              {this.cardBottom(
                this.downloadValue,
                mediaType,
                this.title,
                i,
                this.noDescription,
                this.imgType,
                this.photo
              )}
            </Card>
          );
          this.mediaCardsDescription.push(
            <Card
              className="mediaCard"
              key={this.key}
              title={this.title}
              year={this.year}
              length={this.length}
            >
              <div className="mediaTitle">{this.title}</div>
              <p className="mediaDescription">{this.description}</p>
              {this.cardBottom(
                this.downloadValue,
                mediaType,
                this.title,
                i,
                this.descriptionOn,
                this.imgType,
                this.photo
              )}
            </Card>
          );
        }
      }
      // Create Rows of 4 Cards per Row
      this.createRows();
    } catch (err) {
      console.error(`Error Creating Media Cards: ${err}`);
      this.setState({
        isLoading: false,
        noMediaFound: true,
      });
    }
  }

  // Get BASE64 Converted Local Photo.
  async getLocalPhoto(photoPath) {
    let res = await axios.post(photoUrl, {
      data: photoPath,
    });
    let photo = res.data;
    if (photo === "Error") {
      this.setState({
        isLoading: false,
        noMediaFound: true,
      });
    } else {
      return photo;
    }
  }

  // Show Bigger Preview of Photo
  async showPhoto(e) {
    this.fullSizeImage = e.target.value;
    this.name = e.target.name;
    console.info(`Show Photo Called. Title ${this.name}`);
    this.imagePreview = (
      <div>
        <h1 className="showInBrowserTitle">{this.name}</h1>
        <img
          onClick={this.showPhoto}
          className="showInBrowserImage"
          src={this.fullSizeImage}
          alt=""
        ></img>
      </div>
    );
    this.setState((prevState) => ({
      showInBrowser: !prevState.showInBrowser,
      showInBrowserObject: this.imagePreview,
    }));
  }

  // Display Book in Browser
  async readInBrowser(e) {
    try {
      this.bookObject = JSON.parse(e.target.value);
      this.path = this.bookObject.Path;
      this.ext = this.bookObject.Ext;
      this.name = e.target.name;
      console.info(
        `Read In Browser Called. Title: ${this.name}. Extension Type ${this.ext}`
      );
      let res = await axios.get(`http://localhost:3020/book/`, {
        params: { path: this.path, ext: this.ext },
      });

      // If Server Returned Error Alert Error.
      if (res.data.Error) {
        alert(res.data.Error);
        return;
      }

      // Render Extension Epub
      if (this.ext === ".epub") {
        this.book = res.data;
        let html = { __html: this.book };
        this.bookReader = (
          <div>
            <h1 className="showInBrowserTitle">{this.name}</h1>
            <i
              onClick={this.closeBrowserMedia}
              className="far fa-times-circle fa-2x"
            ></i>
            <div className="showInBrowserBook" dangerouslySetInnerHTML={html} />
          </div>
        );
        this.setState((prevState) => ({
          showInBrowser: !prevState.showInBrowser,
          showInBrowserObject: this.bookReader,
        }));
        this.scrollToTop();
      }
      // Render Extension PDF
      else if (this.ext === ".pdf") {
        if (res.data.Success) {
          let pdf = await require("./PDFs/ViewPDF.pdf");
          let bookReader = (
            <div>
              <h1 className="showInBrowserTitle">{this.name}</h1>
              <i
                onClick={this.closeBrowserMedia}
                className="far fa-times-circle fa-2x"
                style={{ position: "absolute", left: "78%" }}
              ></i>
              <iframe
                title={this.name}
                className="showInBrowserPDF"
                src={pdf}
              />
            </div>
          );
          this.setState((prevState) => ({
            showInBrowser: !prevState.showInBrowser,
            showInBrowserObject: bookReader,
          }));
          this.scrollToTop();
        }
      }
      // Render Extension DOC
      // TODO: DOC Files are not supported as of now. Will Alert Error Msg before code executes.
      else if (this.ext === ".doc") {
        let bookReader = (
          <div>
            <h1 className="showInBrowserTitle">Doc Files Are Not Supported</h1>
            <p>
              Please use open to view the doc file. Doc files will be supported
              in a future release.
            </p>
            <i
              onClick={this.closeBrowserMedia}
              className="far fa-times-circle fa-2x"
              style={{ position: "absolute", left: "78%" }}
            ></i>
          </div>
        );
        this.setState((prevState) => ({
          showInBrowser: !prevState.showInBrowser,
          showInBrowserObject: bookReader,
        }));
        this.scrollToTop();
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Close Component: Show In Browser.
  closeBrowserMedia() {
    this.setState((prevState) => ({
      showInBrowser: !prevState.showInBrowser,
      showInBrowserObject: null,
    }));
  }

  // Close Music Media Player
  closeMediaPlayer() {
    this.setState({
      showInSameWindow: false,
      showInSameWindowObject: null,
    });
  }

  // Play Movie/TV Show in Browser
  async playInBrowser(e) {
    this.movieObject = JSON.parse(e.target.value);
    let path = this.movieObject.Path;
    this.name = e.target.name;
    this.poster = this.movieObject.Img;
    this.ext = this.movieObject.Ext;
    console.info(
      `Play In Browser Called. Title: ${this.name}. Extension: ${this.ext}`
    );
    // Set Movie / TV Video Path.
    let res = await axios.get(`http://localhost:3020/setvideo/`, {
      params: { data: path },
    });
    if (res.data) {
      // Create Movie Player JSX
      this.moviePlayer = (
        <div>
          <h1 className="showInBrowserTitle">{this.name}</h1>
          <i
            onClick={this.closeBrowserMedia}
            className="far fa-times-circle fa-2x"
            style={{ position: "absolute", left: "97%", top: "9%" }}
          ></i>
          <video
            id="videoPlayer"
            style={{ width: "100vw", height: "83vh" }}
            controls
            autoPlay
            poster={this.poster}
          >
            <source src={`http://localhost:3020/video/`} type="video/mp4" />
          </video>
        </div>
      );

      // Render Show In Browser Component
      this.setState((prevState) => ({
        showInBrowser: !prevState.showInBrowser,
        showInBrowserObject: this.moviePlayer,
      }));
      this.scrollToTop();
    }
  }

  // Route Open In Browser to Display Media In Browser
  async openInBrowser(e) {
    let mediaType = this.props.navtitle;
    console.info(`Open In Browser Called. Media Type ${mediaType}`);
    if (mediaType === "Movies") {
      this.playInBrowser(e);
    } else if (mediaType === "Books") {
      this.readInBrowser(e);
    } else if (mediaType === "Music") {
      this.playInBrowser(e);
    } else if (mediaType === "TV Shows") {
      this.playInBrowser(e);
    } else if (mediaType === "Photos") {
      this.showPhoto(e);
    }
  }

  // Create Card Top
  cardTop(title, mediaType, imgType, imgUrl, photo) {
    let img;
    if (mediaType === "Movies") {
      img = imgUrl;
    } else if (mediaType === "Books") {
      img = imgUrl;
    } else if (mediaType === "Music") {
      if (imgUrl !== undefined) {
        img = imgUrl.replace("{w}x{h}", "300x300");
      } else {
        img = "./notplaying.png";
      }
    } else if (mediaType === "TV Shows") {
      img = imgUrl;
    } else if (mediaType === "Photos") {
      img = `data:image/${imgType};base64,${photo}`;
    }
    const cardTop = (
      <div className="mediaCardTop">
        <div className="mediaTitle">{title}</div>
        <img
          className="mediaImg"
          src={img}
          alt=""
          style={{
            width: "210px",
            maxheight: "315px:",
            minheight: "315px:",
          }}
        />
      </div>
    );
    return cardTop;
  }

  // Create Card Middle
  cardMiddle(
    creator,
    categories,
    mediaType,
    length,
    mediaNumber,
    year,
    description
  ) {
    let lengthName;
    let typeName;
    let categoriesName;
    let released;
    if (mediaType === "Movies") {
      lengthName = `Run Time: ${length.slice(0, 3)} minutes.`;
      typeName = "Movie:";
      released = `Released: ${year}`;
      categoriesName = "Genre";
    } else if (mediaType === "Books") {
      lengthName = `Pages: ${length}`;
      typeName = "Book:";
      released = `Published: ${year}`;
      categoriesName = "Categories";
    } else if (mediaType === "Music") {
      lengthName = `Tracks: ${length}`;
      typeName = "Album:";
      released = `Released: ${year}`;
      categoriesName = "Genre";
    } else if (mediaType === "TV Shows") {
      lengthName = `Run Time: ${length.slice(0, 3)} minutes`;
      typeName = "TV Show:";
      released = `Released: ${year}`;
      categoriesName = "Genre";
    } else if (mediaType === "Photos") {
      lengthName = length;
      typeName = "Photos:";
      released = year;
      categoriesName = "Photos";
    }
    const cardMiddle = (
      <div className="mediaCardMiddle">
        <span className="mediaCreator">
          {creator === undefined ? "N/A" : creator}
        </span>
        <span className="mediaCategoriesGenre">
          {mediaType === "Photos"
            ? description
            : `${categoriesName}: ${categories}`}
        </span>
        <span className="mediaCategories">{released}</span>
        <span className="mediaTimeInfo">
          <span className="mediaLength">{lengthName}</span>
          <span className="mediaItemNumber">
            {typeName} {[mediaNumber + 1]}
          </span>
        </span>
      </div>
    );
    return cardMiddle;
  }

  // Create Card Bottom
  cardBottom(
    downloadValue,
    mediaType,
    title,
    i,
    descriptionOn,
    imgType,
    photo
  ) {
    // Action Button - Music
    this.listenButton = (
      <Button
        className="mediaButton"
        onClick={this.showDescription}
        value={descriptionOn}
        id={title}
        name={title}
        style={{
          backgroundColor: `#${this.albumColor1}`,
          color: `#${this.albumColor4}`,
          border: "none",
          fontWeight: "bold",
        }}
      >
        Listen
      </Button>
    );
    // Action Button - TV Shows
    this.showTvSeason = (
      <Button
        className="mediaButton"
        onClick={this.getSeason}
        value={JSON.stringify(downloadValue)}
        name={title}
        style={{
          border: "none",
          backgroundColor: "burlywood",
          fontWeight: "bold",
        }}
      >
        Seasons
      </Button>
    );
    // Action Button - Movies
    this.streamMovieButton = (
      <Button
        className="mediaButton"
        onClick={this.playInBrowser}
        value={JSON.stringify(downloadValue)}
        name={title}
        style={{
          border: "none",
          backgroundColor: "burlywood",
          fontWeight: "bold",
        }}
      >
        Watch
      </Button>
    );
    // Action Button - Photos
    this.viewFullSizeButton = (
      <Button
        className="mediaButton"
        onClick={this.showPhoto}
        value={`data:image/${imgType};base64,${photo}`}
        name={title}
        style={{
          border: "none",
          backgroundColor: "burlywood",
          fontWeight: "bold",
        }}
      >
        Full Size
      </Button>
    );
    // Action Button - Books
    this.readButton = (
      <Button
        className="mediaButton"
        onClick={this.readInBrowser}
        value={JSON.stringify(downloadValue)}
        name={title}
        style={{
          border: "none",
          backgroundColor: "burlywood",
          fontWeight: "bold",
        }}
      >
        Read
      </Button>
    );

    // Assign Action Specfic Button for Card
    if (mediaType === "Movies") {
      this.streamButton = this.streamMovieButton;
      this.backgroundColor = "burlywood";
      this.color = "black";
    } else if (mediaType === "Books") {
      this.streamButton = this.readButton;
      this.backgroundColor = "burlywood";
      this.color = "black";
    } else if (mediaType === "Music") {
      this.streamButton = this.listenButton;
      this.backgroundColor = `#${this.albumColor1}`;
      this.color = `#${this.albumColor4}`;
    } else if (mediaType === "TV Shows") {
      this.streamButton = this.showTvSeason;
      this.backgroundColor = "burlywood";
      this.color = "black";
    } else if (mediaType === "Photos") {
      this.streamButton = this.viewFullSizeButton;
      this.backgroundColor = "burlywood";
      this.color = "black";
    }

    // Card Bottom JSX
    const cardBottom = (
      <span className="mediaButtonSpan">
        <Button
          onClick={this.showDescription}
          value={descriptionOn}
          id={title}
          key={i}
          className="mediaButton"
          style={{
            backgroundColor: this.backgroundColor,
            color: this.color,
            border: "none",
            fontWeight: "bold",
          }}
        >
          Description
        </Button>
        <Button
          className="mediaButton"
          onClick={this.openMedia}
          value={JSON.stringify(downloadValue)}
          style={{
            backgroundColor: this.backgroundColor,
            color: this.color,
            border: "none",
            fontWeight: "bold",
          }}
        >
          Open
        </Button>
        {this.streamButton}
      </span>
    );
    return cardBottom;
  }

  // Get Season Data for TV Show
  async getSeason(e) {
    try {
      this.showProps = JSON.parse(e.target.value);
      this.showPropsJson = JSON.stringify(this.showProps);
      console.info(`Get Season Called for ${this.showProps.Title}`);
      let res = await axios.post(urlTvSeasons, {
        data: this.showProps.Title,
      });
      this.seasonObject = res.data;

      this.seasonsJsx = [];
      this.episodeJsx = [];
      let checkOneSeason;
      try {
        if (this.seasonObject[0].Data.length) {
          checkOneSeason = true;
        } else if (this.seasonObject[0].Data.seasonObj.length >= 1) {
          checkOneSeason = false;
          // Sort Seasons Numerically
          await this.seasonObject[0].Data.seasonObj.sort(function (a, b) {
            return a.Season - b.Season;
          });
        }
      } catch (err) {
        checkOneSeason = true;
      }

      // Only One Season
      if (checkOneSeason) {
        this.totalSeasons = 1;
        // Create JSX for One Season
        for (let x = 0; x < this.seasonObject[0].Data.Episodes.length; x++) {
          let episode = this.seasonObject[0].Data.Episodes[x].Episode;
          let path = this.seasonObject[0].Data.Episodes[x].Path;
          this.episodeJsx.push(
            <div key={uuidv4()} className="episodesJsx">
              <ul className="episodeJsxUl">Episode: {episode}</ul>
              <ul className="episodeJsxUlPath">Path: {path}</ul>
              <div className="episodesJsxButtonDiv">
                <button
                  className="episodeJsxButton"
                  onClick={this.openInBrowser}
                  value={this.showPropsJson}
                >
                  Stream
                </button>
                <button
                  className="episodeJsxButton"
                  onClick={this.openMedia}
                  value={this.showPropsJson}
                >
                  Open
                </button>
                <button className="episodeJsxButton">Description</button>
              </div>
            </div>
          );
        }
        this.seasonsJsx.push(
          <div key={uuidv4()} className="seasonsJsx">
            <h3>Total Episodes: {this.seasonObject[0].Data.Episodes.length}</h3>
            <div>{this.episodeJsx}</div>
          </div>
        );
      }
      // More than 1 Season
      else {
        this.totalSeasons = this.seasonObject[0].Data.seasonObj.length;
        let x = 0;
        // Create JSX for Multiple Seasons
        for (let i = 0; i < this.seasonObject[0].Data.seasonObj.length; i++) {
          do {
            this.episode =
              this.seasonObject[0].Data.seasonObj[i].Episodes[x].Episode;
            let path = this.seasonObject[0].Data.seasonObj[i].Episodes[x].Path;
            this.episodeJsx.push(
              <div key={uuidv4()} className="episodesJsx">
                <ul className="episodeJsxUl">Episode: {this.episode}</ul>
                <ul className="episodeJsxUlPath">Path: {path}</ul>
                <div className="episodesJsxButtonDiv">
                  <button
                    className="episodeJsxButton"
                    onClick={this.openInBrowser}
                    value={this.showPropsJson}
                  >
                    Stream
                  </button>
                  <button
                    className="episodeJsxButton"
                    onClick={this.openMedia}
                    value={this.showPropsJson}
                  >
                    Open
                  </button>
                  <button className="episodeJsxButton">Description</button>
                </div>
              </div>
            );
            x += 1;
          } while (
            x <=
            this.seasonObject[0].Data.seasonObj[i].Episodes.length - 1
          );
          x = 0;
          this.seasonsJsx.push(
            <div key={uuidv4()} className="seasonsJsx">
              <h1>Season: {this.seasonObject[0].Data.seasonObj[i].Season} </h1>
              <h3>
                Total Episodes:{" "}
                {this.seasonObject[0].Data.seasonObj[i].Episodes.length}
              </h3>
              <div>{this.episodeJsx}</div>
            </div>
          );
          this.episodeJsx = [];
        }
      }
      // Define Season Preview JSX Element with Data Above
      this.seasonPreview = (
        <div>
          <div className="seasonsPreview">
            <div className="seasonsPreviewTitleDiv">
              <div className="seasonsShowTitle">{this.showProps.Title}</div>
              <div className="seasonsShowSubTitle">
                Total Seasons: {this.totalSeasons}
              </div>
              <div className="seasonsShowSubTitle2">
                File Location:{" "}
                <span style={{ fontStyle: "italic" }}>
                  {this.showProps.Path}{" "}
                </span>
                <button
                  className="fas fa-external-link-alt"
                  value={this.showPropsJson}
                  onClick={this.openMedia}
                ></button>
              </div>
              <i
                onClick={this.closeBrowserMedia}
                className="far fa-times-circle fa-2x"
                style={{ left: "126%", top: "-66%" }}
              ></i>
            </div>
            <div className="seasonsPreviewImgDiv">
              <img
                src={this.showProps.Img}
                alt=""
                className="seasonsPreviewImg"
              />
            </div>
          </div>
          <div className="episodesJsxRoot">{this.seasonsJsx}</div>
        </div>
      );
      // Render Season(s) In Component: Show In Browser
      this.setState((prevState) => ({
        showInBrowser: !prevState.showInBrowser,
        showInBrowserObject: this.seasonPreview,
      }));
    } catch (err) {
      console.error(`Error Generating Season Data: ${err}`);
    }
  }

  // Create Rows of Media Cards. Four Cards per Row.
  async createRows(cardsPerRow) {
    this.mediaRows = [];
    this.mediaRowsDescription = [];
    let x = 0;
    while (x < this.mediaCards.length) {
      x++;
      if (x % 4 === 1) {
        this.mediaRows.push(
          <div className="mediaRow" key={uuidv4()}>
            {this.mediaCards[x - 1]}
            {this.mediaCards[x]}
            {this.mediaCards[x + 1]}
            {this.mediaCards[x + 2]}
          </div>
        );
        this.mediaRowsDescription.push(
          <div className="mediaRow" key={uuidv4()}>
            {this.mediaCardsDescription[x - 1]}
            {this.mediaCardsDescription[x]}
            {this.mediaCardsDescription[x + 1]}
            {this.mediaCardsDescription[x + 2]}
          </div>
        );
      }
    }
    // Finished Loading Display Cards
    this.setState({
      isLoading: false,
      noMediaFound: false,
    });
  }

  // Toggle Show Media Description for Media Card
  async showDescription(e) {
    let toggleShowDesc = e.target.value; // Will be nodesc or desc
    let id = e.target.id; // Will Be Media Title
    for (let i = 0; i < this.mediaCards.length; i++) {
      if (
        this.mediaCards[i].props.title === id &&
        toggleShowDesc === "nodesc"
      ) {
        this.previousCard = this.mediaCards[i];
        this.mediaCards[i] = this.mediaCardsDescription[i];
        await this.createRows();
        this.mediaCards[i] = this.previousCard;
        return;
      } else if (toggleShowDesc === "desc") {
        this.previousCard = this.mediaCardsDescription[i];
        this.mediaCardsDescription[i] = this.mediaCards[i];
        await this.createRows();
        this.mediaCardsDescription[i] = this.previousCard;
        return;
      }
    }
  }

  // Sort By Year
  async sortYear() {
    if (this.state.isSortedByYear === false) {
      // Sort Cards
      if (this.props.navtitle === "Photos") {
        this.mediaCards.sort(function (a, b) {
          return a.props.year.slice(-4) - b.props.year.slice(-4);
        });
      } else {
        this.mediaCards.sort(function (a, b) {
          return a.props.year.slice(0, 4) - b.props.year.slice(0, 4);
        });
      }
      // Sort Description Cards
      if (this.props.navtitle === "Photos") {
        this.mediaCardsDescription.sort(function (a, b) {
          return a.props.year.slice(-4) - b.props.year.slice(-4);
        });
      } else {
        this.mediaCardsDescription.sort(function (a, b) {
          return a.props.year.slice(0, 4) - b.props.year.slice(0, 4);
        });
      }
      this.createRows();
      this.setState((prevState) => ({
        isSortedByYear: !prevState.isSortedByYear,
        sortedBy:
          this.props.navtitle === "Books"
            ? "Ascending Published"
            : "Ascending Released",
      }));
    }
    // Reverse Sort By Year
    else if (this.state.isSortedByYear === true) {
      // Sort Cards Reverse
      if (this.props.navtitle === "Photos") {
        this.mediaCards.reverse(function (a, b) {
          return a.props.year.slice(-4) - b.props.year.slice(-4);
        });
      } else {
        this.mediaCards.reverse(function (a, b) {
          return a.props.year.slice(0, 4) - b.props.year.slice(0, 4);
        });
      }
      // Sort Description Cards Reverse
      if (this.props.mediaType === "Photos") {
        this.mediaCardsDescription.reverse(function (a, b) {
          return a.props.year.slice(-4) - b.props.year.slice(-4);
        });
      } else {
        this.mediaCardsDescription.reverse(function (a, b) {
          return a.props.year.slice(0, 4) - b.props.year.slice(0, 4);
        });
      }
      this.createRows();
      this.setState((prevState) => ({
        isSortedByYear: !prevState.isSortedByYear,
        sortedBy:
          this.props.navtitle === "Books"
            ? "Descending Published"
            : "Descending Released",
      }));
    }
  }

  // Sort by Title
  async sort() {
    if (this.state.isSortedAlphabetically === false) {
      this.mediaCards.sort(function (a, b) {
        return a.props.title - b.props.title;
      });
      this.mediaCardsDescription.sort(function (a, b) {
        return a.props.title - b.props.title;
      });
      this.createRows();
      this.setState((prevState) => ({
        isSortedAlphabetically: true,
        sortedBy: "Ascending Title",
      }));
    }
    // Reverse Sort By Title
    else if (this.state.isSortedAlphabetically === true) {
      this.mediaCards.reverse(function (a, b) {
        return a.props.title - b.props.title;
      });
      this.mediaCardsDescription.reverse(function (a, b) {
        return a.props.title - b.props.title;
      });
      this.createRows();
      this.setState((prevState) => ({
        isSortedAlphabetically: false,
        sortedBy: "Descending Title",
      }));
    }
  }

  // Sort By Length | Time, Pages, Tracks
  async sortLength() {
    if (this.state.isSortedByLength === false) {
      this.mediaCards.sort(function (a, b) {
        let spaceIndex1 = a.props.length.indexOf(" ");
        let spaceIndex2 = b.props.length.indexOf(" ");
        return (
          a.props.length.slice(0, spaceIndex1) -
          b.props.length.slice(0, spaceIndex2)
        );
      });
      this.mediaCardsDescription.sort(function (a, b) {
        let spaceIndex1 = a.props.length.indexOf(" ");
        let spaceIndex2 = b.props.length.indexOf(" ");
        return (
          a.props.length.slice(0, spaceIndex1) -
          b.props.length.slice(0, spaceIndex2)
        );
      });
      this.createRows();
      this.setState((prevState) => ({
        isSortedByLength: !prevState.isSortedByLength,
        sortedBy:
          this.props.navtitle === "Books"
            ? "Ascending Pages"
            : "Ascending Time",
      }));
    }
    // Reverse Sort By Length
    else if (this.state.isSortedByLength === true) {
      this.mediaCards.reverse(function (a, b) {
        let spaceIndex1 = a.props.length.indexOf(" ");
        let spaceIndex2 = b.props.length.indexOf(" ");
        return (
          a.props.length.slice(0, spaceIndex1) -
          b.props.length.slice(0, spaceIndex2)
        );
      });
      this.mediaCardsDescription.reverse(function (a, b) {
        let spaceIndex1 = a.props.length.indexOf(" ");
        let spaceIndex2 = b.props.length.indexOf(" ");
        return (
          a.props.length.slice(0, spaceIndex1) -
          b.props.length.slice(0, spaceIndex2)
        );
      });
      this.createRows();
      this.setState((prevState) => ({
        isSortedByLength: !prevState.isSortedByLength,
        sortedBy:
          this.props.navtitle === "Books"
            ? "Descending Pages"
            : "Descending Time",
      }));
    }
  }

  // Open Media File/Folder Locally
  openMedia = async (e) => {
    let values = JSON.parse(e.target.value);
    let path = values.Path;
    let url = "http://localhost:3020/open";
    axios.get(url, { params: { data: path } });
  };

  render() {
    return (
      <div className="templateRoot">
        <NavBar
          {...this.state}
          sort={this.sort.bind(this)}
          sortYear={this.sortYear.bind(this)}
          sortLength={this.sortLength.bind(this)}
          resetSort={this.getMedia.bind(this)}
        />
        {this.state.showInSameWindow ? this.state.showInSameWindowObject : null}
        {this.state.isLoading ? (
          <div className="mediaLoading">
            <Loading />
          </div>
        ) : (
          <div className="marginTop">
            {this.state.noMediaFound ? (
              <div className="mediaNotFound">
                <span className="mediaNotFoundTitle">
                  <h1 style={{ color: "white" }}>
                    No {this.props.navtitle.toLowerCase()} found. Please go to
                    settings and scan again.
                  </h1>{" "}
                  <Button className="scanMediaButton" href="/settings">
                    Settings
                  </Button>
                </span>
                <div id="scanMessages" className="scanMessages">
                  {this.scanMessage}
                </div>
              </div>
            ) : (
              <div>
                {this.state.showInBrowser ? (
                  <ShowInBrowser
                    {...this.state}
                    openInBrowser={this.openInBrowser.bind(this)}
                    showPhoto={this.showPhoto.bind(this)}
                  />
                ) : (
                  this.mediaRows
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
}
