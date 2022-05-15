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

const hex2rgba = (hex, alpha = 0.5) => {
  const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
  return `rgba(${r},${g},${b},${alpha})`;
};

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
      artistHidden: true, // Toggle Artist Over Album
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
    };
    // See Comments Above Functions
    this.getMedia = this.getMedia.bind(this);
    this.createRows = this.createRows.bind(this);
    this.cardTop = this.cardTop.bind(this);
    this.cardMiddle = this.cardMiddle.bind(this);
    this.cardBottom = this.cardBottom.bind(this);
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
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.scrollToLocation = this.scrollToLocation.bind(this);
    this.hideScroll = this.hideScroll.bind(this);
    this.getSeason = this.getSeason.bind(this);
    this.mapMusic = this.mapMusic.bind(this);
    this.playLocalSong = this.playLocalSong.bind(this);
    this.closeMusicPlayer = this.closeMusicPlayer.bind(this);
    this.musicControls = this.musicControls.bind(this);
    this.changeRowCount = this.changeRowCount.bind(this);
    this.hideArtist = this.hideArtist.bind(this);
    this.musicVolume = this.musicVolume.bind(this);
    this.hideAlbumTitle = this.hideAlbumTitle.bind(this);
    this.createScrollBar = this.createScrollBar.bind(this);
    this.navSearch = this.navSearch.bind(this);
    this.pinDescriptionCard = this.pinDescriptionCard.bind(this);
    this.closeDescriptionCard = this.closeDescriptionCard.bind(this);
    this.minimizeDescriptionCard = this.minimizeDescriptionCard.bind(this);
    this.hotKeys = this.hotKeys.bind(this);
    this.getProperties = this.getProperties.bind(this);
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
    let res = await axios.get(`${this.props.address}/props`);
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
      let res = await axios.post(`${this.props.address}/getmedia`, {
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
            ? (this.photo = await this.getLocalPhoto(this.path))
            : (this.photo = null);
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
                this.noDescription,
                this.imgType,
                this.photo,
                this.key
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
                <p className="mediaDescription">{this.description}</p>
                {this.state.cardsPerRow >= 6 ? (
                  <div id="mediaCardMidButtons">
                    <Button
                      className="mediaButton"
                      title={`Open ${this.title} Locally`}
                      value={JSON.stringify(this.downloadValue)}
                      onClick={this.openMedia}
                      style={{
                        border: "none",
                        fontWeight: "bold",
                      }}
                    >
                      Open <i className="fa-solid fa-folder-open" />
                    </Button>
                    {this.streamButton}{" "}
                  </div>
                ) : null}
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

      // Create Main Card
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
            <div className="mediaDescription">
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
  //// End Get Media Create Cards

  //// Create Card Rows
  // Create Rows of Media Cards. Cards Per Row = state.cardsPerRow
  async createRows() {
    let rowCountProps = `rowCount${this.state.cardsPerRow}`;
    let style;
    this.state.navtitle === "Music"
      ? (style = musicStyleProps[rowCountProps].rowProps) // Use Music Card Style if Music
      : (style = cardStyleProps[rowCountProps].rowProps); // Use Regular Cards Style
    this.mediaRows = []; // Media Rows X Cards per Row
    this.mediaRowItem = []; // Media Row Card X Per Row
    this.mediaRowsDescription = []; // Description Cards Row
    this.mediaRowItemDescription = []; // Description Card Row Items
    let rowAlphabet; // Scroll Bar A-Z Index
    let z = 1;

    do {
      z++;
      // Push Media Card Row Items
      this.mediaRowItem.push(this.mediaCards[z - 2]);
      this.mediaRowItemDescription.push(this.mediaCardsDescription[z - 2]);
      // Create Row if Z % cardsPerRow === 1
      if (z % this.state.cardsPerRow === 1) {
        try {
          if (
            this.props.navtitle !== "Music" &&
            this.mediaCards[z - 2].props.title.substring(0, 1) !== undefined
          ) {
            rowAlphabet = this.mediaCards[z - 2].props.title.substring(0, 1);
          } else {
            rowAlphabet = this.mediaCards[z - 2].props.artist.substring(0, 1);
          }
        } catch (err) {}

        this.mediaRows.push(
          <div
            id={rowAlphabet}
            className="mediaRow"
            key={uuidv4()}
            style={{
              height: style.height,
              width: style.width,
            }}
          >
            {this.mediaRowItem}
          </div>
        );
        this.mediaRowsDescription.push(
          <div
            id={rowAlphabet}
            className="mediaRow"
            key={uuidv4()}
            style={{
              height: style.height,
              width: style.width,
            }}
          >
            {this.mediaRowItemDescription}
          </div>
        );
        // Reset Media Row Items:
        this.mediaRowItem = [];
        this.mediaRowItemDescription = [];
      }
    } while (z < this.mediaCards.length + 10);
    // Finished Loading Display Row with Row Items
    this.setState({
      isLoading: false,
      noMediaFound: false,
    });
  }
  //// End Create Rows

  //// Create Card Sections
  // Create Card Top
  cardTop(title, mediaType, imgType, imgUrl, photo, style) {
    let img;
    let height;
    let fontSize;
    let rightRadius;
    let leftRadius;
    let display;
    let marginTop;
    let marginBottom;
    let alignItems;
    let minHeight;
    if (
      mediaType === "Movies" ||
      mediaType === "Books" ||
      mediaType === "TV Shows"
    ) {
      img = imgUrl;
      height = "3vw";
      fontSize = "1.3vw";
      marginTop = "5px";
      marginBottom = "0px";
      alignItems = "center";
    } else if (mediaType === "Music") {
      height = "auto";
      fontSize = "1vw";
      rightRadius = "10px";
      leftRadius = "10px";
      alignItems = "center";
      minHeight = "2vw";
      this.transparentColor = hex2rgba(this.albumColor4).includes("NaN")
        ? (this.transparentColor = "rgb(147 191 207 / 58%)")
        : (this.transparentColor = hex2rgba(this.albumColor4));
      if (this.state.albumTitleHidden === true) {
        display = "none";
      }
    } else if (mediaType === "Photos") {
      img = `data:image/${imgType};base64,${photo}`;
      height = "3vw";
      fontSize = "1.3vw";
      marginTop = "5px";
      marginBottom = "0px";
      alignItems = "center";
    }

    const cardTop = (
      <div className="mediaCardTop" id={title} value={title}>
        <div
          className="mediaTitle"
          onClick={this.state.navtitle === "Music" ? this.hideAlbumTitle : null}
          style={{
            top: 1,
            width: style.img.width,
            height: height,
            fontSize: fontSize,
            borderTopLeftRadius: leftRadius,
            borderTopRightRadius: rightRadius,
            display: display,
            backgroundColor: this.transparentColor,
            marginTop: marginTop,
            marginBottom: marginBottom,
            alignItems: alignItems,
            minHeight: minHeight,
          }}
        >
          {title}
        </div>
        {mediaType === "Music" ? null : (
          <img
            className="mediaImg"
            src={img}
            id={title}
            value={this.noDescription}
            alt=""
            onError={(e) => (e.target.src = "altimage.png")}
            style={{
              width: style.img.width,
              height: style.img.height,
              marginTop: "10px",
            }}
          />
        )}
      </div>
    );
    return cardTop;
  }

  // Create Card Middle
  cardMiddle(creator, categories, mediaType, length, year, description, style) {
    let lengthName;
    let categoriesName;
    let released;

    if (mediaType === "Movies") {
      lengthName = (
        <span style={{ fontWeight: "bold" }}>
          Run Time:{" "}
          <span style={{ fontWeight: "normal" }}>
            {length.slice(0, 3)} minutes.
          </span>
        </span>
      );
      released = (
        <span style={{ fontWeight: "bold" }}>
          Released: <span style={{ fontWeight: "normal" }}>{year}</span>
        </span>
      );
      categoriesName = "Genre";
    } else if (mediaType === "Books") {
      lengthName = (
        <span style={{ fontWeight: "bold" }}>
          Pages: <span style={{ fontWeight: "normal" }}>{length}</span>
        </span>
      );
      released = (
        <span style={{ fontWeight: "bold" }}>
          Published: <span style={{ fontWeight: "normal" }}>{year}</span>
        </span>
      );
      categoriesName = "Categories";
    } else if (mediaType === "Music") {
      lengthName = `Tracks: ${length}`;
      released = (
        <span style={{ fontWeight: "bold" }}>
          Released: <span style={{ fontWeight: "normal" }}>{year}</span>
        </span>
      );
      categoriesName = "Genre";
      this.transparentColor = hex2rgba(this.albumColor4).includes("NaN")
        ? (this.transparentColor = "rgb(147 191 207 / 58%)")
        : (this.transparentColor = hex2rgba(this.albumColor4));
    } else if (mediaType === "TV Shows") {
      lengthName = (
        <span style={{ fontWeight: "bold" }}>
          Run Time:{" "}
          <span style={{ fontWeight: "normal" }}>
            {length.slice(0, 3)} minutes.
          </span>
        </span>
      );
      released = (
        <span style={{ fontWeight: "bold" }}>
          Released: <span style={{ fontWeight: "normal" }}>{year}</span>
        </span>
      );
      categoriesName = "Genre";
    } else if (mediaType === "Photos") {
      lengthName = length;
      released = year;
      categoriesName = "Photos";
    }

    const cardMiddle = (
      <div className="mediaCardMiddle">
        {mediaType === "Music" ? (
          <span
            id="mediaCreator"
            className="mediaCreator"
            onClick={this.hideArtist}
            title={creator}
            style={{
              width: parseFloat(style.img.width) + "vw",
              marginLeft: "-3px",
              backgroundColor: this.transparentColor,
              color: this.albumColor1,
              position: "absolute",
              bottom: 0,
              height: "2vw",
              left: "3px",
              fontSize: "1vw",
              borderBottomLeftRadius: "10px",
              borderBottomRightRadius: "10px",
              display: this.state.artistHidden === true ? "none" : "relative",
            }}
          >
            {creator === undefined ? "N/A" : creator}
          </span>
        ) : (
          <span
            title={creator}
            className="mediaCreator"
            style={{ height: "3vw", width: parseFloat(style.img.width) + "vw" }}
          >
            {creator === undefined ? "N/A" : creator}
          </span>
        )}
        {mediaType === "Music" ? null : (
          <div
            className="cardMiddleContent"
            style={{ width: parseFloat(style.img.width) + "vw" }}
          >
            <span className="mediaCategoriesGenre">
              {mediaType === "Photos" ? (
                description
              ) : (
                <span style={{ fontWeight: "bold" }}>
                  {categoriesName}:{" "}
                  <span style={{ fontWeight: "normal" }}>{categories}</span>
                </span>
              )}
            </span>
            <div className="mediaCategories">{released}</div>
            <span className="mediaTimeInfo">
              <span className="mediaLength">{lengthName}</span>
            </span>
          </div>
        )}
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
    // Action Button - TV Shows
    this.showTvSeason = (
      <Button
        className="mediaButton"
        onClick={this.getSeason}
        value={JSON.stringify(downloadValue)}
        name={title}
        title={`View ${title} Seasons`}
        style={{
          width: "6vw",
        }}
      >
        Seasons <i className="fas fa-tv" style={{ color: "black" }}></i>
      </Button>
    );
    // Action Button - Movies
    this.streamMovieButton = (
      <Button
        className="mediaButton"
        onClick={this.playInBrowser}
        value={JSON.stringify(downloadValue)}
        name={title}
        title={`Watch ${title}`}
      >
        Watch <i className="fas fa-tv" style={{ color: "black" }}></i>
      </Button>
    );
    // Action Button - Photos
    this.viewFullSizeButton = (
      <Button
        className="mediaButton"
        onClick={this.showPhoto}
        value={`data:image/${imgType};base64,${photo}`}
        name={title}
        title={`View Full Size Image`}
      >
        Full Size <i className="fas fa-expand-alt"></i>
      </Button>
    );
    // Action Button - Books
    this.readButton = (
      <Button
        className="mediaButton"
        onClick={this.readInBrowser}
        value={JSON.stringify(downloadValue)}
        name={title}
        title={`Read ${title}`}
      >
        Read <i className="fas fa-book" style={{ color: "black" }}></i>
      </Button>
    );

    // Assign Action Specfic Button for Card
    if (mediaType === "Movies") {
      this.streamButton = this.streamMovieButton;
    } else if (mediaType === "Books") {
      this.streamButton = this.readButton;
    } else if (mediaType === "TV Shows") {
      this.streamButton = this.showTvSeason;
    } else if (mediaType === "Photos") {
      this.streamButton = this.viewFullSizeButton;
    }

    // Card Bottom JSX
    if (mediaType !== "Music") {
      this.spanKey = uuidv4();
      const cardBottom = (
        <span id={this.spanKey} key={this.spanKey} className="mediaButtonSpan">
          <Button
            className="mediaButton"
            name={i}
            title="Description"
            id={title}
            value={JSON.stringify({
              action: "open",
              key: this.key,
            })}
            onClick={this.pinDescriptionCard}
            style={{
              width: "6vw",
            }}
          >
            Description <i className="fas fa-file-alt"></i>
          </Button>
          {this.state.cardsPerRow >= 6 ? null : (
            <>
              <Button
                className="mediaButton"
                title={`Open ${title} Locally`}
                value={JSON.stringify(downloadValue)}
                onClick={this.openMedia}
              >
                Open <i className="fa-solid fa-folder-open"></i>
              </Button>
              {this.streamButton}
            </>
          )}
        </span>
      );
      return cardBottom;
    }
  }
  //// End Create Card Sections

  //// Media Type Musisc
  // Play Local Song in Browser
  async playLocalSong(e) {
    // Music Player Styling and Information
    this.albumInfo = JSON.parse(e.target.attributes.music.value);
    this.colors = this.albumInfo.colors;
    this.songName = this.albumInfo.song;
    this.songPath = this.albumInfo.path;
    this.artist = this.albumInfo.artist;
    this.album = this.albumInfo.album;
    this.trackNumber = parseInt(this.albumInfo.tracknumber);

    // Next Song Load Place Holder JSX
    this.nextSongPlaceHolder = (
      <div
        className="musicPlayer"
        style={{
          borderColor: this.colors[0].color4,
          backgroundColor: this.colors[0].color1,
        }}
      ></div>
    );
    this.setState({
      showInSameWindowObject: this.nextSongPlaceHolder,
      musicPlaying: true,
      albumColors: this.colors,
    });

    // Set Song Path / Get Album Tracks from DB.
    let res = await axios.get(`${this.props.address}/setmusic`, {
      params: { path: this.songPath, song: this.songName, album: this.album },
    });
    this.albumSongList = res.data;

    // Set Previous / Next Song Values
    for (let i = 0; i < this.albumSongList.length; i++) {
      // Match Track Number to Track Path
      if (this.trackNumber === this.albumSongList[i].TrackNumber) {
        //console.log(`Matched: ${this.albumSongList[i].Path} `);
        this.songPath = this.albumSongList[i].Path;
        // Set Prev Song Values (If Defined)
        if (i >= 1) {
          this.prevSong = this.albumSongList[i - 1].Track;
          this.prevSongTrack = this.albumSongList[i - 1].TrackNumber;
          this.prevSongPath = this.albumSongList[i - 1];
        }
        // Set Next Song Values (If Defined)
        try {
          if (i <= this.albumSongList.length) {
            this.nextSong = this.albumSongList[i + 1].Track;
            this.nextSongTrack = this.albumSongList[i + 1].TrackNumber;
            this.nextSongPath = this.albumSongList[i + 1].Path;
          }
        } catch (err) {
          //Last Song
        }
        break;
      }
    }

    this.nextTrack = {
      artist: this.artist,
      album: this.album,
      tracknumber: this.nextSongTrack,
      song: this.nextSong,
      path: this.nextSongPath,
      colors: this.colors,
    };

    this.prevTrack = {
      artist: this.artist,
      album: this.album,
      tracknumber: this.prevSongTrack,
      song: this.prevSong,
      path: this.nextSongPath,
      colors: this.colors,
    };

    // Create Music Player JSX
    this.musicPlayer = (
      <div
        className="musicPlayer"
        style={{
          borderColor: this.colors[0].color4,
          backgroundColor: this.colors[0].color1,
        }}
      >
        <div className="musicTitleDiv" style={{ color: this.colors[0].color4 }}>
          <h1 className="musicPlayerTitle">{this.songName}</h1>
          <h4
            style={{
              overflow: "hidden",
              height: "24px",
            }}
          >
            {this.album} | {this.artist}
          </h4>
        </div>
        <div className="musicControlsDiv">
          {/* Prev Icon */}
          {this.trackNumber === 1 ? (
            // Hidden Icon for Spacing
            <i
              className="hiddenSpace musicControls"
              style={{ width: "36px" }}
            />
          ) : (
            <button
              className="fas fa-angle-double-left fa-2x musicControls"
              id="musicPrev"
              title={`Previous: ${this.prevSong}`}
              onClick={this.playLocalSong}
              style={{
                color: this.colors[0].color4,
                position: "relative",
                background: "none",
                border: "none",
              }}
              music={JSON.stringify(this.prevTrack)}
            />
          )}
          {this.state.musicPlaying ? (
            <i
              className="fas fa-pause fa-2x musicControls"
              onClick={this.musicControls}
              title="Pause"
              style={{
                color: this.colors[0].color4,
                position: "relative",
              }}
            />
          ) : (
            <i
              className="fas fa-play fa-2x musicControls"
              id="musicPlay"
              title="Play"
              onClick={this.musicControls}
              style={{
                color: this.colors[0].color4,
                position: "relative",
              }}
            />
          )}
          <i
            onClick={this.closeMusicPlayer}
            title="Stop"
            className="fas fa-stop fa-2x musicControls"
            style={{
              color: this.colors[0].color4,
              position: "relative",
              marginLeft: "10px",
            }}
          />
          {/* Next Icon */}
          {this.trackNumber === this.albumSongList.length ? null : (
            <button
              id="musicNext"
              className="fas fa-angle-double-right fa-2x musicControls"
              title={`Next: ${this.nextSong}`}
              onClick={this.playLocalSong}
              style={{
                color: this.colors[0].color4,
                position: "relative",
                background: "none",
                border: "none",
              }}
              music={JSON.stringify(this.nextTrack)}
            />
          )}
          {/* Volume Slider */}
          <div className="musicVolumeSlider">
            <input
              id="musicSlider"
              className="volumeSlider"
              type="range"
              min="0"
              max="100"
              step="1"
              onChange={this.musicVolume}
              style={{
                color: this.colors[0].color4,
                backgroundImage: this.colors[0].color4,
                background: this.colors[0].color4,
              }}
            />
          </div>
        </div>
        {this.albumSongList.length === this.trackNumber ? (
          <audio id="musicPlayer" autoPlay onEnded={this.closeMusicPlayer}>
            <source
              src="http://localhost:3020/streammusic"
              onError={(e) => {
                alert(
                  `Streaming Error: Please confirm path exists or if it is a network drive, the drive is connected. Path: ${this.songPath}`
                );
              }}
              type="audio/ogg"
            />
            <source
              src="http://localhost:3020/streammusic"
              onError={(e) => {
                alert(
                  `Streaming Error: Please confirm path exists or if it is a network drive, the drive is connected. Path: ${this.songPath}`
                );
              }}
              type="audio/mpeg"
            />
            Your browser does not support the audio element.
          </audio>
        ) : (
          <audio
            id="musicPlayer"
            autoPlay
            onEnded={this.playLocalSong}
            music={JSON.stringify(this.nextTrack)}
          >
            <source
              src="http://localhost:3020/streammusic"
              onError={(e) => {
                alert(
                  `Streaming Error: Please confirm path exists or if it is a network drive, the drive is connected. Path: ${this.songPath}`
                );
              }}
              type="audio/ogg"
            />
            <source
              src="http://localhost:3020/streammusic"
              onError={(e) => {
                alert(
                  `Streaming Error: Please confirm path exists or if it is a network drive, the drive is connected. Path: ${this.songPath}`
                );
              }}
              type="audio/mpeg"
            />
            Your browser does not support the audio element.
          </audio>
        )}
      </div>
    );

    this.setState({
      showInSameWindow: true,
      showInSameWindowObject: this.musicPlayer,
      albumColors: this.colors,
    });
  }

  // Toggle Show / Hide Artist Name on Album Cover
  hideArtist() {
    let list = document.getElementsByClassName("mediaCreator");
    let artistTitleStyle = [];
    if (this.state.artistHidden === true) {
      for (let i = 0; i < list.length; ++i) {
        this.state.artistTitleStyle[i].replace("display: none;", "");
        list[i].setAttribute("style", this.state.artistTitleStyle[i]);
      }
    } else if (this.state.artistHidden === false) {
      for (let i = 0; i < list.length; ++i) {
        artistTitleStyle.push(list[i].getAttribute("style"));
        list[i].setAttribute("style", "display: none;");
      }
    }
    this.setState((prevState) => ({
      artistHidden: !prevState.artistHidden,
      artistTitleStyle: artistTitleStyle,
    }));
  }

  // Toggle Show / Hide Album Title
  hideAlbumTitle() {
    let list = document.getElementsByClassName("mediaTitle");
    let albumTitleStyle = [];
    if (this.state.albumTitleHidden === true) {
      for (let i = 0; i < list.length; ++i) {
        this.state.albumTitleStyle[i].replace("display: none;", "");
        list[i].setAttribute("style", this.state.albumTitleStyle[i]);
      }
    } else {
      for (let i = 0; i < list.length; ++i) {
        albumTitleStyle.push(list[i].getAttribute("style"));
        list[i].setAttribute("style", "display: none;");
      }
    }
    this.setState((prevState) => ({
      albumTitleHidden: !prevState.albumTitleHidden,
      albumTitleStyle: albumTitleStyle,
    }));
  }

  // Music Volume Control
  musicVolume(e) {
    this.volume = e.target.value;
    this.newVolume = this.volume / 100;
    document.getElementById("musicSlider").value = e.target.value;
    document.getElementById("musicPlayer").volume = this.newVolume;
  }

  // Music Controls
  musicControls() {
    this.musicSource = document.getElementById("musicPlayer");
    if (this.state.musicPlaying === true) {
      this.musicSource.pause();
    } else if (this.state.musicPlaying === false) {
      this.musicSource.play();
    }
    this.setState((prevState) => ({
      musicPlaying: !prevState.musicPlaying,
    }));
  }

  // Close Music Music Player
  closeMusicPlayer() {
    this.setState({
      showInSameWindow: false,
      showInSameWindowObject: null,
    });
  }
  //// End Media Type Music

  //// Media Type Photos
  // Get Binary Image from Database
  async getLocalPhoto(photoPath) {
    let res = await axios.post(`${this.props.address}/photo`, {
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
      scrollHidden: true,
    }));
  }
  ////End Media Type Photos

  //// Media Type Books
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
      let res = await axios.get(`${this.props.address}/book/`, {
        params: { path: this.path, ext: this.ext },
      });

      // If Server Returned Error Alert Error.
      if (res.data.Error) {
        alert(
          `Unable to open book. A mapped drive may be disconnect. Please confirm the path exists: ${this.path}`
        );
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
              className="far fa-times-circle fa-2x closeCircle"
            ></i>
            <div className="showInBrowserBook" dangerouslySetInnerHTML={html} />
          </div>
        );
        this.setState((prevState) => ({
          showInBrowser: !prevState.showInBrowser,
          showInBrowserObject: this.bookReader,
          scrollHidden: true,
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
                className="far fa-times-circle fa-2x closeCircle"
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
            scrollHidden: true,
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
              className="far fa-times-circle fa-2x closeCircle"
              style={{ position: "absolute", left: "78%" }}
            ></i>
          </div>
        );
        this.setState((prevState) => ({
          showInBrowser: !prevState.showInBrowser,
          showInBrowserObject: bookReader,
          scrollHidden: true,
        }));
        this.scrollToTop();
      }
    } catch (err) {
      console.error(err);
    }
  }

  //// Media Type Movies and TV Shows
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
    let res = await axios.get(`${this.props.address}/setvideo/`, {
      params: { data: path },
    });
    if (res.data) {
      // Create Movie Player JSX
      this.moviePlayer = (
        <div>
          <h1 className="showInBrowserTitle">{this.name}</h1>
          <i
            onClick={this.closeBrowserMedia}
            className="far fa-times-circle fa-2x closeCircle"
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
        scrollHidden: true,
      }));
      this.scrollToTop();
    }
  }

  //// Media Type TV Shows
  // Get Season Data for TV Show
  async getSeason(e) {
    try {
      this.showProps = JSON.parse(e.target.value);
      this.showPropsJson = JSON.stringify(this.showProps);
      console.info(`Get Season Called for ${this.showProps.Title}`);
      let res = await axios.post(`${this.props.address}/getseason`, {
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
                className="far fa-times-circle fa-2x closeCircle"
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
        scrollHidden: true,
      }));
    } catch (err) {
      console.error(`Error Generating Season Data: ${err}`);
    }
  }
  //// End Media Type TV Shows

  //// Sorting Options - Movies, TV, Books, Music, Photos
  // Sort By Year
  async sortYear() {
    console.log("Sorting By Year");
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
          return (
            a.props.children.props.year.slice(0, 4) -
            b.props.children.props.year.slice(0, 4)
          );
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
    //Define Sorted Title
    let sortedTitle;
    if (this.state.isSortedAlphabetically === true) {
      if (this.props.navtitle === "Music") {
        sortedTitle = `Descending Artist`;
      } else {
        sortedTitle = `Descending Title`;
      }
    } else {
      if (this.props.navtitle === "Music") {
        sortedTitle = `Ascending Artist`;
      } else {
        sortedTitle = `Ascending Title`;
      }
    }
    // Sort
    this.mediaCards.reverse();
    this.mediaCardsDescription.reverse();
    this.createRows();
    this.setState((prevState) => ({
      isSortedAlphabetically: !prevState.isSortedAlphabetically,
      sortedBy: sortedTitle,
    }));
  }

  // Sort By Length | Time, Pages, Tracks
  async sortLength() {
    console.log("Sorting By Length");
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
        return (
          parseInt(a.props.children.props.length) -
          parseInt(b.props.children.props.length)
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
  //// End Sort

  //// Misc Functions - All Media
  // Change Cards Per Row Value
  changeRowCount(e, value) {
    if (value !== undefined) {
      this.increase = value;
    } else {
      this.increase = e.target.value;
    }

    this.setState({
      cardsPerRow: this.increase,
    });
    if (this.props.navtitle === "Photos") {
      this.setState({
        isLoading: true,
      });
    }
    this.getMedia();
  }

  // Open Media File/Folder Locally
  openMedia = async (e) => {
    let values = JSON.parse(e.target.value);
    let path = values.Path;
    axios.get(`${this.props.address}/open`, { params: { data: path } });
  };

  // Close Pinned Card
  async closeDescriptionCard(key) {
    try {
      if (this.pinnedCardKeys.length > 0) {
        for (let x = 0; x < this.pinnedCardKeys.length; x++) {
          // Unpin Album by Deleteing it
          if (
            this.pinnedCardKeys[x].key === key &&
            this.pinnedCardKeys[x].isPinned === true
          ) {
            delete this.pinnedCards[x];
            delete this.pinnedCardKeys[x].key;
            delete this.pinnedCardKeys[x].isPinned;
            this.setState({
              pinnedCards: this.pinnedCards,
            });
            return true;
          }
        }
      }
      return false;
    } catch (err) {
      console.log("Closing Pinned Card Error: ", err);
    }
  }

  // Minimizes Description Card View
  minimizeDescriptionCard(e) {
    let key = e.target.value;
    let mediaCard;
    let mediaCardKey;
    let initialStyle;

    for (let i = 0; i < this.mediaCardsDescription.length; i++) {
      if (key === this.mediaCardsDescription[i].key) {
        mediaCardKey = this.mediaCardsDescription[i].props.children.key;
        mediaCard = document.getElementById(mediaCardKey);
        initialStyle = mediaCard.getAttribute("style");

        // Show Elements
        if (mediaCard.getAttribute("style").includes("height: 0")) {
          // Revert Media Card Attributes
          let newStyle = mediaCard
            .getAttribute("style")
            .replaceAll("height: 0; width: 15vw; border: none;", "");
          mediaCard.removeAttribute("style");
          mediaCard.setAttribute("style", newStyle);

          // Revert Media Card Bot Attributes
          if (this.props.navtitle !== "Music") {
            let descriptionSpan =
              this.mediaCardsDescription[i].props.children.props.children[3]
                .key;
            document
              .getElementById(descriptionSpan)
              .setAttribute("style", "display: ''");
          }
        }
        // Hide Elements
        else {
          // Change Media Card Attributes
          mediaCard.setAttribute(
            "style",
            `${initialStyle} height: 0; width: 15vw; border: none;`
          );

          // Change Media Card Bottom Attributes
          if (this.props.navtitle !== "Music") {
            let descriptionSpan =
              this.mediaCardsDescription[i].props.children.props.children[3]
                .key;
            document
              .getElementById(descriptionSpan)
              .setAttribute("style", "display: none;");
          }
        }
        break;
      }
    }
  }

  // Pins Description Card To Side
  async pinDescriptionCard(e) {
    let key;
    let action;
    try {
      key = JSON.parse(e.target.value).key;
      action = JSON.parse(e.target.value).action;
    } catch (err) {
      // Bootstrap Causes issues with Attributes use Get Attribute
      if (typeof key === "undefined") {
        let values = JSON.parse(e.target.getAttribute("value"));
        key = values.key;
        action = values.action;
      }
    } finally {
      // If Key is still Undefined - Return.
      if (typeof key === "undefined") {
        return;
      }
    }

    // Check if Item is already Pinned and close
    let close = await this.closeDescriptionCard(key);
    if (close) {
      return;
    } else if (!close) {
      this.openCard = [];
    }
    // Pin Cards
    if (action === "pin") {
      this.openCard = [];
      try {
        for (let i = 0; i < this.mediaCardsDescription.length; i++) {
          if (key === this.mediaCardsDescription[i].key) {
            // Pin Album
            this.pinnedCardKeys.push({ key: key, isPinned: true });
            this.pinnedCards.push(
              <div className="pinnedItem" key={key}>
                {this.mediaCardsDescription[i]}
              </div>
            );
            this.setState({
              pinnedCards: this.pinnedCards,
            });
            break;
          }
        }
      } catch (err) {
        console.log("Creating Album Pin Error: ", err);
      }
    }
    // Open 1 Card
    else if (action === "open") {
      this.openCard = [];
      for (let i = 0; i < this.mediaCardsDescription.length; i++) {
        if (key === this.mediaCardsDescription[i].key) {
          this.openCard.push(
            <div key={key}>{this.mediaCardsDescription[i]}</div>
          );
          break;
        }
      }
    }
    this.createRows();
  }

  // Scrolls to Page Top
  scrollToTop() {
    const body = document.getElementById("top");
    body.scrollIntoView(
      {
        behavior: "smooth",
      },
      500
    );
  }

  // Scrolls to Page Bottom
  scrollToBottom() {
    const body = document.getElementById("bottom");
    body.scrollIntoView(
      {
        behavior: "smooth",
      },
      500
    );
  }

  // Scroll To Location | All Media | Scrolls A-Z to that row.
  scrollToLocation(e) {
    let location = e.target.value;
    try {
      const body = document.getElementById(location);
      body.scrollIntoView(
        {
          behavior: "smooth",
        },
        500
      );
    } catch (err) {
      this.alphabet = "abcdefghijklmnopqrstuvwxyz";
      let startNum = this.alphabet.indexOf(location.toLowerCase());
      let searchNum = this.alphabet.slice(startNum);
      let nextScroll;

      // Loop To Closest Existing Row
      for (let i = 0; i < searchNum.length; i++) {
        nextScroll = document.getElementById(searchNum.charAt(i).toUpperCase());
        if (nextScroll) {
          nextScroll.scrollIntoView(
            {
              behavior: "smooth",
            },
            500
          );
          break;
        } else if (i === searchNum.length - 1) {
          const body = document.getElementById("bottom");
          body.scrollIntoView(
            {
              behavior: "smooth",
            },
            500
          );
        }
      }
    }
  }

  // Create Scroll Bar for Side
  createScrollBar() {
    this.letters = [];
    this.alphabet = "abcdefghijklmnopqrstuvwxyz";
    for (let i = 0; i < this.alphabet.length; i++) {
      this.letters.push(
        <button
          key={uuidv4()}
          onMouseOver={(e) => (e.target.style.fontSize = "50px")}
          onMouseLeave={(e) => (e.target.style.fontSize = null)}
          className="scrollBarButton"
          value={this.alphabet.charAt(i).toUpperCase()}
          onClick={this.scrollToLocation}
        >
          {this.alphabet.charAt(i).toUpperCase()}
        </button>
      );
    }
  }

  // Toggle Hide/Show Scroll
  hideScroll() {
    this.setState((prevState) => ({
      scrollHidden: !prevState.scrollHidden,
    }));
  }

  // Route Open In Browser to Display Media In Browser
  async openInBrowser(e) {
    let mediaType = this.props.navtitle;
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

  // Close Component: Show In Browser.
  closeBrowserMedia() {
    this.setState((prevState) => ({
      showInBrowser: !prevState.showInBrowser,
      showInBrowserObject: null,
      scrollHidden: false,
    }));
  }

  // Navbar Search
  async navSearch(e) {
    let searchTxt = e.target.value;
    let nextScroll;
    try {
      for (let i = 0; i < this.mediaCards.length; i++) {
        if (
          this.mediaCards[i].props.title
            .toLowerCase()
            .includes(searchTxt.toLowerCase())
        ) {
          nextScroll = document.getElementById(this.mediaCards[i].props.title);
          nextScroll.scrollIntoView(
            {
              behavior: "auto",
            },
            500
          );
          break;
        }
      }
    } catch (err) {
      console.warn(err);
    }
  }

  // Hotkeys for View Options
  async hotKeys(e) {
    if (e.key === this.state.hotkeyTop) {
      this.scrollToTop();
    } else if (e.key === this.state.hotkeyBot) {
      this.scrollToBottom();
    } else if (e.key === this.state.hotkeyHideScroll) {
      this.hideScroll();
    } else if (e.key === this.state.hotkeyHideAlbumTitle) {
      if (this.props.navtitle !== "Music") {
        return;
      }
      this.hideAlbumTitle();
    } else if (e.key === this.state.hotkeyHideArtist) {
      if (this.props.navtitle !== "Music") {
        return;
      }
      this.hideArtist();
    } else if (e.key === this.state.hotkeyZoomIn) {
      // Do not increase past max values
      if (this.props.navtitle === "Music" && this.state.cardsPerRow === 16) {
        return;
      } else if (
        this.props.navtitle !== "Music" &&
        this.state.cardsPerRow === 9
      ) {
        return;
      }
      this.changeRowCount(null, parseInt(this.state.cardsPerRow) + 1);
    } else if (e.key === this.state.hotkeyZoomOut) {
      // Do not decrease below min values
      if (this.state.cardsPerRow - 1 === 1) {
        return;
      } else {
        this.changeRowCount(null, this.state.cardsPerRow - 1);
      }
    }
  }

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
          hideArtist={this.hideArtist.bind(this)}
          hideAlbumTitle={this.hideAlbumTitle.bind(this)}
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
              <div id="top">
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
        {this.state.scrollHidden === true ? null : (
          <div className="scrollBar">{this.letters}</div>
        )}
        <div id="bottom"></div>
      </div>
    );
  }
}
