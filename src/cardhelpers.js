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
  let titleClassName;

  if (
    mediaType === "Movies" ||
    mediaType === "Books" ||
    mediaType === "TV Shows"
  ) {
    titleClassName = "mediaTitle";
    img = imgUrl;
  } else if (mediaType === "Music") {
    titleClassName = "mediaTitleMusic";
    this.transparentColor = hex2rgba(this.albumColor4).includes("NaN")
      ? (this.transparentColor = "rgb(147 191 207 / 58%)")
      : (this.transparentColor = hex2rgba(this.albumColor4));
  } else if (mediaType === "Photos") {
    titleClassName = "mediaTitle";
    if (photo === undefined) {
      console.log("undefined img");
    } else {
      img = `data:image/${imgType};base64,${photo}`;
    }
  }

  const cardTop = (
    <div className="mediaCardTop" id={title} value={title}>
      {mediaType === "Music" ? null : (
        <img
          className="mediaImg"
          src={img}
          id={title}
          value={this.noDescription}
          alt=""
          onError={(e) => {
            e.target.src = "altimage.png";
            e.target.style = `border: 1px solid white; width: ${style.img.width}; height: ${style.img.height}; margin-top: 10px`;
          }}
          style={{
            width: style.img.width,
            height: style.img.height,
            marginTop: "10px",
          }}
        />
      )}
      <div
        className={titleClassName}
        onClick={this.state.navtitle === "Music" ? this.hideAlbumTitle : null}
        style={{
          width: style.img.width,
          backgroundColor: this.transparentColor,
        }}
      >
        {title}
      </div>
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
          className="mediaCreatorMusic"
          onClick={this.hideArtist}
          title={creator}
          style={{
            width: parseFloat(style.img.width) + "vw",
            backgroundColor: this.transparentColor,
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
        <div className="mediaCategories">
          <span className="mediaCategoriesGenre">
            <span style={{ fontWeight: "bold" }}>
              {categoriesName}:{" "}
              <span style={{ fontWeight: "normal" }}>
                {categories /* Genres/Categories of Media */}
                <br />
                {released /* Media Release Date */}
                <br /> {lengthName /* Length of Media */}
                <br />{" "}
                {mediaType === "Photos" ? (
                  <div>{description}</div> // Image Type Of Photo
                ) : (
                  <div className="mediaDescription">{description}</div> // Synopsis of Plot
                )}
              </span>
            </span>
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
  // Set Button Classes for Description Cards
  let buttonSpanClass;
  let buttonClass;
  let buttonColor;
  if (descriptionOn === "nodesc" || typeof descriptionOn === "undefined") {
    if (mediaType === "Photos") {
      buttonSpanClass = "mediaButtonSpanPhotos";
    } else {
      buttonSpanClass = "mediaButtonSpan";
    }
    buttonClass = "mediaButton";
    buttonColor = "white";
  } else {
    buttonSpanClass = "mediaButtonSpanDescription";
    buttonClass = "mediaButtonDescription";
    buttonColor = "black";
  }

  // Action Button - TV Shows
  this.showTvSeason = (
    <Button
      className={buttonClass}
      onClick={this.getSeason}
      value={JSON.stringify(downloadValue)}
      name={title}
      title={`View ${title} Seasons`}
    >
      Seasons <i className="fas fa-tv" style={{ color: buttonColor }}></i>
    </Button>
  );
  // Action Button - Movies
  this.streamMovieButton = (
    <Button
      className={buttonClass}
      onClick={this.playInBrowser}
      value={JSON.stringify(downloadValue)}
      name={title}
      title={`Watch ${title}`}
    >
      Watch <i className="fas fa-tv" style={{ color: buttonColor }}></i>
    </Button>
  );
  // Action Button - Photos
  this.viewFullSizeButton = (
    <Button
      className={buttonClass}
      onClick={this.showPhoto}
      value={`data:image/${imgType};base64,${photo}`}
      name={title}
      title={`View Full Size Image`}
    >
      Full Size{" "}
      <i className="fas fa-expand-alt" style={{ color: buttonColor }}></i>
    </Button>
  );
  // Action Button - Books
  this.readButton = (
    <Button
      className={buttonClass}
      onClick={this.readInBrowser}
      value={JSON.stringify(downloadValue)}
      name={title}
      title={`Read ${title}`}
    >
      Read <i className="fas fa-book" style={{ color: buttonColor }}></i>
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
      <span id={this.spanKey} key={this.spanKey} className={buttonSpanClass}>
        <Button
          className={buttonClass}
          name={i}
          title="Description"
          id={title}
          value={JSON.stringify({
            action: "open",
            key: this.key,
          })}
          onClick={this.pinDescriptionCard}
        >
          Description <i className="fas fa-file-alt"></i>
        </Button>

        <>
          <Button
            className={buttonClass}
            title={`Open ${title} Locally`}
            value={JSON.stringify(downloadValue)}
            onClick={this.openMedia}
          >
            Open <i className="fa-solid fa-folder-open"></i>
          </Button>
          {this.streamButton}
        </>
      </span>
    );
    return cardBottom;
  }
}
//// End Create Card Sections

export { createRows, cardTop, cardMiddle, cardBottom };
