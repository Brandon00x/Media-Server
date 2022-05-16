import { v4 as uuidv4 } from "uuid";
import musicStyleProps from "./cardStylePropsMusic";
import cardStyleProps from "./cardStyleProps";
import { Button } from "react-bootstrap";
import { hex2rgba } from "./utilhelpers"; // Reusable Utils

//// Create Card Rows
// Create Rows of Media Cards. Cards Per Row = state.cardsPerRow
function createRows() {
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
function cardTop(title, mediaType, imgType, imgUrl, photo, style) {
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
function cardMiddle(
  creator,
  categories,
  mediaType,
  length,
  year,
  description,
  style
) {
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
function cardBottom(
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

export { createRows, cardTop, cardMiddle, cardBottom };
