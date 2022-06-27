import React, { Component } from "react";
import axios from "axios";
import NavBar from "./NavBar";
import { v4 as uuidv4 } from "uuid";
import { Card, Button } from "react-bootstrap";
import "./media.css";
import ShowInBrowser from "./ShowInBrowser";
import Loading from "./Loading";
import musicStyleProps from "./cardStylePropsMusic";
import cardStyleProps from "./cardStyleProps";
import Draggable from "react-draggable";
import { createRows, cardTop, cardMiddle, cardBottom } from "./cardhelpers"; // Card Parts \ Create Rows
import {
  hideArtist,
  hideAlbumTitle,
  playLocalSong,
  musicVolume,
  musicControls,
  closeMusicPlayer,
} from "./musichelpers"; // Music Helpers
import { getLocalPhoto, showPhoto } from "./photoshelper"; // Photos Helpers
import { readInBrowser } from "./bookshelper"; // Books Helpers
import { playInBrowser } from "./movieshelper"; // Movies Helper
import { getSeason } from "./tvhelpers"; // TV Helper
import {
  hex2rgba,
  sort,
  sortYear,
  sortLength,
  changeRowCount,
  openMedia,
  closeDescriptionCard,
  minimizeDescriptionCard,
  pinDescriptionCard,
  scrollToTop,
  scrollToBottom,
  scrollToLocation,
  createScrollBar,
  hideScroll,
  openInBrowser,
  closeBrowserMedia,
  navSearch,
  hotKeys,
} from "./utilhelpers"; // Reusable Utils

export default class Template extends Component {
  constructor(props) {
    super(props);
    this.pinnedCards = [];
    this.pinnedCardKeys = [];
    this.pinnedStyleLeft = 0; // Pinned Side
    this.state = {
      navtitle: this.props.navtitle, // Navbar Main Title from Media Component
      cardsPerRow: 4, // Zoom Level | Cards Per Row
      scrollHidden: false, // Toggle Show Hide Scroll Bar

      // Componenet Props | Loading / No Media Items / Show In Browser
      isLoading: true, // Toggle Show Loading Page
      noMediaFound: false, // Toggle Show No Media Found Page
      showInBrowser: false, // Toggle Show Media Item in Component: Show In Browser
      showInBrowserObject: null, // Set Media Object Used in Show in Browser Component

      // View Object in same Component Popout
      showInSameWindow: false, // Toggle Show Media Object in Same Browser Window
      showInSameWindowObject: null, // Set Media Object used in Show in Same Window Object

      // Sort Props
      isSortedAlphabetically: true, // Sorted Alphabetically
      isSortedByYear: false, // Sorted By Year/Relase Date/Publish Data
      isSortedByLength: false, // Sorted By Pages/Time/Tracks
      sortedBy: "Alphabetically", // Navbar Sorted Title

      // Music Props
      albumColors: null, // Music Album Colors for NavBar Styling
      mediaRows: null, // Media Rows with Cards
      pinnedCards: null, // Pinned Albums
      musicPlaying: false, // Toggle Play/Pause Music
      artistHidden: false, // Toggle Artist Over Album
      albumTitleHidden: false, // Toggle Album Title On/Off
      albumTitleStyle: null, //Holds Style for Album Title
      artistTitleStyle: null, // Holds Style for Artist Title

      // Hotkey Props
      hotkeyTop: null,
      hotkeyBot: null,
      hotkeyHideScroll: null,
      hotkeyHideAlbumTitle: null,
      hotkeyHideArtist: null,
      hotkeyZoomIn: null,
      hotkeyZoomOut: null,
      isDisabled: false,
    };
    // See Comments Above Functions
    this.getMedia = this.getMedia.bind(this);
    this.createRows = createRows.bind(this);
    this.cardTop = cardTop.bind(this);
    this.cardMiddle = cardMiddle.bind(this);
    this.cardBottom = cardBottom.bind(this);
    this.openMedia = openMedia.bind(this);
    this.sort = sort.bind(this);
    this.sortYear = sortYear.bind(this);
    this.sortLength = sortLength.bind(this);
    this.getLocalPhoto = getLocalPhoto.bind(this);
    this.openInBrowser = openInBrowser.bind(this);
    this.showPhoto = showPhoto.bind(this);
    this.playInBrowser = playInBrowser.bind(this);
    this.readInBrowser = readInBrowser.bind(this);
    this.closeBrowserMedia = closeBrowserMedia.bind(this);
    this.scrollToTop = scrollToTop.bind(this);
    this.scrollToBottom = scrollToBottom.bind(this);
    this.scrollToLocation = scrollToLocation.bind(this);
    this.hideScroll = hideScroll.bind(this);
    this.createScrollBar = createScrollBar.bind(this);
    this.getSeason = getSeason.bind(this);
    this.mapMusic = this.mapMusic.bind(this);
    this.playLocalSong = playLocalSong.bind(this);
    this.closeMusicPlayer = closeMusicPlayer.bind(this);
    this.musicControls = musicControls.bind(this);
    this.changeRowCount = changeRowCount.bind(this);
    this.hideArtist = hideArtist.bind(this);
    this.hideAlbumTitle = hideAlbumTitle.bind(this);
    this.musicVolume = musicVolume.bind(this);
    this.navSearch = navSearch.bind(this);
    this.pinDescriptionCard = pinDescriptionCard.bind(this);
    this.closeDescriptionCard = closeDescriptionCard.bind(this);
    this.minimizeDescriptionCard = minimizeDescriptionCard.bind(this);
    this.hotKeys = hotKeys.bind(this);
    this.getProperties = this.getProperties.bind(this);
    this.mapPhotos = this.mapPhotos.bind(this);
  }

  // Component Mounted
  async componentDidMount() {
    await this.getProperties(); // Gets/Sets Saved Properties for Zoom, Scroll, Titles, etc.
    document.addEventListener("keydown", this.hotKeys); // Enable Hotkeys
    this.createScrollBar(); // Create Scroll Bar
    await this.getMedia(); // Get Media Items
  }

  // Gets/Sets Saved Properties for Zoom, Scroll, Titles, etc.
  async getProperties() {
    let res = await axios.get(`/api/props`);
    let props = res.data;
    // Set Properties
    this.setState({
      cardsPerRow:
        this.props.navtitle === "Music"
          ? props.zoomLevelMusic
          : props.zoomLevelOther,
      artistHidden: JSON.parse(props.toggleArtist), //str to bool
      albumTitleHidden: JSON.parse(props.toggleAlbum),
      scrollHidden: props.toggleScroll,
      hotkeyTop: props.scrollTop,
      hotkeyBot: props.scrollBot,
      hotkeyHideScroll: props.hideScroll,
      hotkeyHideAlbumTitle: props.hideAlbum,
      hotkeyHideArtist: props.hideArtist,
      hotkeyZoomIn: props.zoomIn,
      hotkeyZoomOut: props.zoomOut,
    });
  }

  ////  Get Media and Create Media Cards
  async getMedia() {
    let mediaType = this.props.navtitle;
    console.info("Template Media Type: ", mediaType);
    this.mediaCards = [];
    this.mediaCardsDescription = [];
    let data;

    try {
      let res = await axios.post(`/api/getmedia`, {
        data: mediaType,
      });
      data = res.data;
    } catch (err) {
      console.error(
        `Server Unavailable. Unable get Media Type: ${mediaType}.\nServer Error: ${err}`
      );
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

    // Call Map Music Data
    if (mediaType === "Music") {
      data.sort(function (a, b) {
        return a.data.Artist.localeCompare(b.data.Artist);
      });
      this.mapMusic(data, mediaType);
      return;
    } else if (mediaType === "Photos") {
      data.sort(function (a, b) {
        return a.data.name.localeCompare(b.data.name);
      });
      this.mapPhotos(data, mediaType);
    }
    // Create Cards for TV, Movies, Books, Photos
    else {
      // Filter Results with Name instead of Title
      data = data.filter(function (item) {
        return item.data.name === undefined; // Return Titles (They are API Updated)
      });

      // Sort Title A-Z
      data.sort(function (a, b) {
        return a.data[0].Title.localeCompare(b.data[0].Title);
      });

      // Map Data
      try {
        let rowCount = `rowCount${this.state.cardsPerRow}`;
        this.style = cardStyleProps[rowCount].cardProps;
        for (let i = 0; i < data.length; i++) {
          this.title = data[i].data[0].Title;
          this.creator =
            mediaType === "TV Shows"
              ? data[i].data[0].Actors
              : data[i].data[0].Creator;
          this.description = data[i].data[0].Description;
          this.categories = data[i].data[0].Categories;
          this.path = data[i].data[0].Path;
          this.ext = data[i].data[0].Ext;
          this.imgUrl = data[i].data[0].ImageURL;
          mediaType === "Photos"
            ? (this.imgType = data[i].data[0].Ext.slice(1))
            : (this.imgType = null);

          this.length =
            data[i].data[0].Length === null || data[i].data[0].Length === "N/A"
              ? "0"
              : data[i].data[0].Length.toString();

          this.key = uuidv4();
          this.year =
            data[i].data[0].Year === undefined
              ? "0"
              : data[i].data[0].Year.toString();
          this.downloadValue = {
            Path: this.path,
            Title: this.title,
            Ext: this.ext,
            Img: this.imgUrl,
          };
          this.noDescription = "nodesc";
          this.descriptionOn = "desc";
          this.seasonCount =
            data[i].data[0].totalSeasons === null
              ? 1
              : data[i].data[0].totalSeasons;

          this.mediaCards.push(
            <Card
              className="mediaCard"
              id={this.title}
              key={this.key}
              title={this.title}
              year={this.year}
              length={this.length}
              style={{ height: "auto" }}
            >
              {this.cardTop(
                this.title,
                mediaType,
                this.imgType,
                this.imgUrl,
                this.photo,
                this.style
              )}
              {this.cardBottom(
                this.downloadValue,
                mediaType,
                this.title,
                i,
                this.noDescription,
                this.imgType,
                this.photo,
                this.seasonCount
              )}
            </Card>
          );
          // All Media No Music
          this.mediaCardsDescription.push(
            <Draggable key={this.key}>
              <Card
                id={this.key}
                className="mediaCard"
                key={this.key}
                title={this.title}
                year={this.year}
                length={this.length}
                style={{
                  position: "absolute",
                  display: "flex",
                  zIndex: "2",
                  width: "30vw",
                  height: "30vw",
                  top: "20%",
                  border: "1px solid black",
                  background: "burlywood",
                }}
              >
                <div
                  className="mediaTopBar"
                  style={{
                    backgroundColor: "goldenrod",
                  }}
                >
                  <div className="mediaTopBarButtons">
                    <button
                      className="far fa-times-circle"
                      title="Close"
                      value={JSON.stringify({
                        action: "close",
                        key: this.key,
                      })}
                      onClick={this.pinDescriptionCard}
                      style={{
                        background: "none",
                        border: "none",
                        marginLeft: "5px",
                      }}
                    />
                    <button
                      className="fa-solid fa-thumbtack"
                      title="Pin"
                      value={JSON.stringify({ action: "pin", key: this.key })}
                      onClick={this.pinDescriptionCard}
                      style={{
                        background: "none",
                        border: "none",
                      }}
                    />
                    <button
                      className="far fa-window-minimize"
                      title="Minimize"
                      onClick={this.minimizeDescriptionCard}
                      value={this.key}
                      style={{
                        background: "none",
                        border: "none",
                        position: "relative",
                      }}
                    />
                  </div>
                  <div
                    className="mediaDescBarTitle"
                    style={{ fontSize: "1vw" }}
                  >
                    {this.title}
                  </div>
                </div>
                {this.cardMiddle(
                  this.creator,
                  this.categories,
                  mediaType,
                  this.length,
                  this.year,
                  this.description,
                  this.style
                )}
                {this.cardBottom(
                  this.downloadValue,
                  mediaType,
                  this.title,
                  i,
                  this.descriptionOn,
                  this.imgType,
                  this.photo,
                  this.seasonCount
                )}
              </Card>
            </Draggable>
          );
        }

        // Create this.state.cardsPerRow of Row
        this.createRows();
      } catch (err) {
        console.error(
          `Error Creating Media Cards: ${err}, Title: ${this.title}`
        );
        this.setState({
          isLoading: false,
          noMediaFound: true,
        });
      }
    }

    // Cards Error: No Media Found
  }

  // Create Music Cards
  async mapMusic(data, mediaType) {
    this.songs = [];
    this.songPaths = [];
    this.albumColors = [];
    this.noDescription = "nodesc";
    this.descriptionOn = "desc";

    // Card Styling Properties
    this.rowCount = `rowCount${this.state.cardsPerRow}`;
    this.style = musicStyleProps[this.rowCount].cardProps;
    // Loop Through Albums To Make Cards
    let y = 0;
    this.albumNumber = 0;
    // Loop Through Artists
    for (let i = 0; i < data.length; i++) {
      // Stop Looping
      let dataProps = data[i].data;

      this.localTrackCount = dataProps.LocalTrackCount;

      this.albumColor1 = `#${dataProps.Attributes.textColor1}`;
      this.albumColor2 = `#${dataProps.Attributes.textColor2}`;
      this.albumColor3 = `#${dataProps.Attributes.textColor3}`;
      this.albumColor4 = `#${dataProps.Attributes.textColor4}`;
      this.albumColors.push({
        color1: this.albumColor1,
        color2: this.albumColor2,
        color3: this.albumColor3,
        color4: this.albumColor4,
      });

      do {
        this.trackNumber = dataProps.Tracks[y].TrackNumber;
        this.trackName = dataProps.Tracks[y].Track;
        this.trackPath = dataProps.Tracks[y].Path;
        this.key = uuidv4();

        this.songs.push(
          <div
            className="musicTracks"
            key={this.key}
            title={this.trackName}
            style={{
              backgroundColor:
                y % 2 === 1
                  ? hex2rgba(this.albumColor2, 0.8)
                  : this.albumColor2,
            }}
          >
            <span className="musicTrack">{this.trackName}</span>
            <div className="musicButtonDiv">
              <button
                className="fa-solid fa-folder-open"
                onClick={this.openMedia}
                title={`Open ${this.trackName}.`}
                value={JSON.stringify({ Path: this.trackPath })}
                style={{
                  color: this.albumColor4,
                  border: "none",
                  background: "none",
                }}
              />
              <button
                id="musicPlaySong"
                className="fas fa-play"
                onClick={this.playLocalSong}
                title={`Play ${this.trackName}`}
                music={JSON.stringify({
                  artist: dataProps.Artist,
                  album: dataProps.Album,
                  tracknumber: this.trackNumber,
                  song: this.trackName,
                  path: this.trackPath,
                  colors: this.albumColors,
                })}
                style={{
                  color: this.albumColor4,
                  border: "none",
                  background: "none",
                }}
              />
            </div>
          </div>
        );
        y++;
      } while (y < dataProps.Tracks.length);
      // Reset Arrays for Next Album Loop
      let url;
      try {
        if (dataProps.Attributes.url !== undefined) {
          url = dataProps.Attributes.url.replace("{w}x{h}", "226x250");
        } else {
          url = "./notplaying.png";
        }
      } catch (err) {}

      // Create Main Card Music
      this.mediaCards.push(
        <Card
          id={dataProps.Album}
          className="mediaCard"
          key={this.key}
          title={dataProps.Album}
          artist={dataProps.Artist}
          year={dataProps.Year}
          length={this.localTrackCount.toString()}
          onClick={this.pinDescriptionCard}
          value={JSON.stringify({ action: "open", key: this.key })}
          style={{
            zIndex: 1,
            width: this.style.img.width,
            backgroundColor: this.albumColor1,
            color: this.albumColor4,
            backgroundImage: `url(${url})`,
          }}
        >
          {this.cardTop(
            dataProps.Album,
            mediaType,
            null,
            dataProps.Attributes.url,
            null,
            this.style
          )}
          {this.cardMiddle(
            dataProps.Artist,
            dataProps.Genres,
            mediaType,
            dataProps.TrackCount,
            dataProps.Year,
            dataProps.Description,
            this.style
          )}
          {this.cardBottom(
            { Path: dataProps.Path },
            mediaType,
            dataProps.Album,
            this.albumNumber,
            this.noDescription,
            null,
            null
          )}
        </Card>
      );

      // Set Album Description
      if (dataProps.Description.length > 1) {
        let html = { __html: dataProps.Description };
        this.descriptionText = (
          <div>
            <h4 className="mediaDescriptionTitle">Description</h4>
            <p dangerouslySetInnerHTML={html}></p>
          </div>
        );
      } else {
        this.descriptionText = null;
      }

      // Create Description Card Music
      this.mediaCardsDescription.push(
        <Draggable key={this.key}>
          <Card
            // id={data[i].Albums[x].Album}
            id={this.key}
            className="mediaCard"
            key={this.key}
            title={dataProps.Album}
            artist={dataProps.Artist}
            year={dataProps.Year}
            length={dataProps.TrackCount}
            value={this.descriptionOn}
            onMouseEnter={(e) => {
              e.target.style.zIndex = "4";
            }}
            onMouseLeave={(e) => {
              e.target.style.zIndex = "2";
            }}
            style={{
              position: "absolute",
              display: "flex",
              zIndex: "2",
              width: "30vw",
              height: "30vw",
              top: "20%",
              backgroundColor: this.albumColor1,
              color: this.albumColor4,
              border: `2px solid ${this.albumColor4}`,
            }}
          >
            <div
              className="mediaTopBar"
              style={{
                backgroundColor:
                  this.albumColor2 === "#undefined"
                    ? "burlywood"
                    : this.albumColor2,
                borderColor: this.albumColor4,
              }}
            >
              <div className="mediaTopBarButtons">
                <button
                  className="far fa-times-circle"
                  title="Close"
                  value={JSON.stringify({ action: "close", key: this.key })}
                  onClick={this.pinDescriptionCard}
                  style={{
                    color: this.albumColor4,
                    background: "none",
                    border: "none",
                    marginLeft: "5px",
                  }}
                />
                <button
                  className="fa-solid fa-thumbtack"
                  title="Pin"
                  value={JSON.stringify({ action: "pin", key: this.key })}
                  onClick={this.pinDescriptionCard}
                  style={{
                    color: this.albumColor4,
                    background: "none",
                    border: "none",
                  }}
                />
                <button
                  className="far fa-window-minimize"
                  title="Minimize"
                  onClick={this.minimizeDescriptionCard}
                  value={this.key}
                  style={{
                    color: this.albumColor4,
                    background: "none",
                    border: "none",
                    position: "relative",
                  }}
                />
              </div>
              <div className="mediaDescBarTitle">{dataProps.Album}</div>
            </div>

            {/* TRACKS */}
            <div className="mediaDescriptionMusic">
              <div
                className="musicTrackHolder"
                style={{ borderColor: this.albumColor2 }}
              >
                <div className="descriptionPara">
                  <h4 className="mediaDescriptionTitle">Tracks</h4>
                </div>
                {this.songs}
              </div>

              {/* DESCRIPTION */}
              <div className="descriptionHolder">
                <div className="descriptionPara">{this.descriptionText}</div>

                {/* INFO */}
                <div className="descriptionPara">
                  <h4 className="mediaDescriptionTitle">Info</h4>
                </div>
                <p className="descriptionPara">
                  <span style={{ fontWeight: "bold" }}>Genre: </span>
                  {dataProps.Genres}
                </p>
                <p className="descriptionPara">
                  <span style={{ fontWeight: "bold" }}> Released: </span>
                  {dataProps.Year}
                </p>
                <p className="descriptionPara">
                  <span style={{ fontWeight: "bold" }}>Tracks: </span>
                  {this.localTrackCount}
                </p>
                <p className="descriptionPara">
                  <span style={{ fontWeight: "bold" }}>
                    Has All Album Tracks:{" "}
                  </span>
                  {dataProps.HasAllTracks.toString()}
                </p>
              </div>

              <div className="musicDescriptionButtonDiv">
                <button
                  className="musicOpenFolderButton"
                  title="Open Artist Folder"
                  value={JSON.stringify({ Path: dataProps.Path })}
                  onClick={this.openMedia}
                  style={{
                    background: "none",
                    color: this.albumColor4,
                  }}
                >
                  Artist Folder <i className="fa-solid fa-folder-open" />
                </button>

                <button
                  className="musicOpenFolderButton"
                  title="Close"
                  onClick={this.pinDescriptionCard}
                  value={JSON.stringify({ action: "close", key: this.key })}
                  style={{
                    background: "none",
                    color: this.albumColor4,
                  }}
                >
                  Close
                </button>
                <button
                  className="musicOpenFolderButton"
                  title="Open Album Folder"
                  value={JSON.stringify({ Path: dataProps.Path })}
                  onClick={this.openMedia}
                  style={{
                    background: "none",
                    color: this.albumColor4,
                  }}
                >
                  Album Folder <i className="fa-solid fa-folder-open" />
                </button>
              </div>
            </div>
            {this.cardBottom(
              { Path: dataProps.Path },
              mediaType,
              dataProps.Album,
              this.albumNumber,
              this.descriptionOn,
              null,
              null
            )}
          </Card>
        </Draggable>
      );
      this.songs = [];
      this.songPaths = [];
      this.albumColors = [];
      y = 0;
    }

    this.createRows();
  }

  // Photos Card
  async mapPhotos(data, mediaType) {
    console.log("Mapping Photos");
    try {
      let rowCount = `rowCount${this.state.cardsPerRow}`;
      this.style = cardStyleProps[rowCount].cardProps;
      for (let i = 0; i < data.length; i++) {
        this.resultItemNum = data[i].data.result;
        this.title = data[i].data.name;
        this.path = data[i].data.Path;
        this.ext = data[i].data.Ext;
        this.description = data[i].data.Description;
        this.creator = data[i].data.Creator;
        this.imageUrl = data[i].data.ImageURL;
        this.length = data[i].data.Length;
        this.year = data[i].data.Year;
        this.photo = await this.getLocalPhoto(this.path);
        this.key = uuidv4();
        this.downloadValue = {
          Path: this.path,
          Title: this.title,
          Ext: this.ext,
          Img: this.imgUrl,
        };

        // Photos Card
        this.mediaCards.push(
          <Card
            className="mediaCard"
            id={this.title}
            key={this.key}
            title={this.title}
            year={this.year}
            length={this.length}
            style={{ height: "auto" }}
          >
            {this.cardTop(
              this.title,
              mediaType,
              this.imgType,
              this.imgUrl,
              this.photo,
              this.style
            )}
            {this.cardBottom(
              this.downloadValue,
              mediaType,
              this.title,
              i,
              this.noDescription,
              this.imgType,
              this.photo,
              this.key
            )}
          </Card>
        );
        // Photos Description Card
        this.mediaCardsDescription.push(
          <Draggable key={this.key}>
            <Card
              id={this.key}
              className="mediaCard"
              key={this.key}
              title={this.title}
              year={this.year}
              length={this.length}
              style={{
                position: "absolute",
                display: "flex",
                zIndex: "2",
                width: "30vw",
                height: "30vw",
                top: "20%",
                border: "1px solid black",
                background: "burlywood",
              }}
            >
              <div
                className="mediaTopBar"
                style={{
                  backgroundColor: "goldenrod",
                }}
              >
                <div className="mediaTopBarButtons">
                  <button
                    className="far fa-times-circle"
                    title="Close"
                    value={JSON.stringify({
                      action: "close",
                      key: this.key,
                    })}
                    onClick={this.pinDescriptionCard}
                    style={{
                      background: "none",
                      border: "none",
                      marginLeft: "5px",
                    }}
                  />
                  <button
                    className="fa-solid fa-thumbtack"
                    title="Pin"
                    value={JSON.stringify({ action: "pin", key: this.key })}
                    onClick={this.pinDescriptionCard}
                    style={{
                      background: "none",
                      border: "none",
                    }}
                  />
                  <button
                    className="far fa-window-minimize"
                    title="Minimize"
                    onClick={this.minimizeDescriptionCard}
                    value={this.key}
                    style={{
                      background: "none",
                      border: "none",
                      position: "relative",
                    }}
                  />
                </div>
                <div className="mediaDescBarTitle" style={{ fontSize: "1vw" }}>
                  {this.title}
                </div>
              </div>
              <div className="photosDescriptionContainer">
                {this.cardMiddle(
                  this.creator,
                  this.categories,
                  mediaType,
                  this.length,
                  this.year,
                  this.description,
                  this.style
                )}
              </div>
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
          </Draggable>
        );
      }
      // Create Photo Rows
      this.createRows();
    } catch (err) {
      console.error(`Error Mapping Photos ${err}`);
    }
  }
  //// End Get Media Create Cards

  render() {
    return (
      <div className="templateRoot">
        <NavBar
          {...this.state}
          sort={this.sort.bind(this)}
          sortYear={this.sortYear.bind(this)}
          sortLength={this.sortLength.bind(this)}
          resetSort={this.getMedia.bind(this)}
          changeRowCount={this.changeRowCount.bind(this)}
          hideArtist={hideArtist.bind(this)}
          hideAlbumTitle={hideAlbumTitle.bind(this)}
          scrollToTop={this.scrollToTop.bind(this)}
          scrollToBottom={this.scrollToBottom.bind(this)}
          navSearch={this.navSearch.bind(this)}
          hideScroll={this.hideScroll.bind(this)}
        />
        <div className="pinnedItems">{this.state.pinnedCards}</div>
        <div className="openDescriptionCard">{this.openCard}</div>
        {this.state.showInSameWindow ? this.state.showInSameWindowObject : null}
        {this.state.isLoading ? (
          <div className="mediaLoading">
            <Loading />
          </div>
        ) : (
          <div id="mediaContentContainer" className="mediaContent">
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
                <div id="top"></div>

                {this.state.showInBrowser ? (
                  <ShowInBrowser
                    {...this.state}
                    openInBrowser={this.openInBrowser.bind(this)}
                    showPhoto={this.showPhoto.bind(this)}
                    closeBrowserMedia={this.closeBrowserMedia.bind(this)}
                    getSeason={this.getSeason.bind(this)}
                  />
                ) : (
                  this.mediaRows
                )}
              </div>
            )}
          </div>
        )}
        {this.state.scrollHidden === true ? null : (
          <div className="scrollBar">{this.letters}</div>
        )}
        <div id="bottom"></div>
      </div>
    );
  }
}
