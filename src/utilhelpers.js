import axios from "axios";
import { v4 as uuidv4 } from "uuid";

// Hex Color to RGBA.
const hex2rgba = (hex, alpha = 0.5) => {
  const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
  return `rgba(${r},${g},${b},${alpha})`;
};

//// Sorting Options - Movies, TV, Books, Music, Photos
// Sort By Year
async function sortYear() {
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
async function sort() {
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
async function sortLength() {
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
        this.props.navtitle === "Books" ? "Ascending Pages" : "Ascending Time",
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

// Change Cards Per Row Value
async function changeRowCount(e, value) {
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
  await this.getMedia();
}

// Open Media File/Folder Locally
function openMedia(e) {
  let values = JSON.parse(e.target.value);
  let path = values.Path;
  axios.get(`/api/open`, { params: { data: path } });
}

// Close Pinned Card
async function closeDescriptionCard(key) {
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
function minimizeDescriptionCard(e) {
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
            this.mediaCardsDescription[i].props.children.props.children[3].key;
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
            this.mediaCardsDescription[i].props.children.props.children[3].key;
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
async function pinDescriptionCard(e) {
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
function scrollToTop() {
  const body = document.getElementById("top");
  body.scrollIntoView(
    {
      behavior: "smooth",
      block: "end",
    },
    500
  );
}

// Scrolls to Page Bottom
function scrollToBottom() {
  const body = document.getElementById("bottom");
  body.scrollIntoView(
    {
      behavior: "smooth",
      block: "end",
    },
    500
  );
}

// Scroll To Location | All Media | Scrolls A-Z to that row.
function scrollToLocation(e) {
  let location = e.target.value;
  try {
    const body = document.getElementById(location);
    body.scrollIntoView(
      {
        behavior: "smooth",
        block: "end",
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
function createScrollBar() {
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
function hideScroll() {
  this.setState((prevState) => ({
    scrollHidden: !prevState.scrollHidden,
  }));
}

// Route Open In Browser to Display Media In Browser
async function openInBrowser(e) {
  let mediaType = this.props.navtitle;
  if (mediaType === "Movies") {
    this.playInBrowser(e, true);
  } else if (mediaType === "Books") {
    this.readInBrowser(e);
  } else if (mediaType === "Music") {
    this.playInBrowser(e);
  } else if (mediaType === "TV Shows") {
    this.playInBrowser(e, false);
  } else if (mediaType === "Photos") {
    this.showPhoto(e);
  }
}

// Close Component: Show In Browser.
function closeBrowserMedia() {
  this.setState((prevState) => ({
    showInBrowser: !prevState.showInBrowser,
    showInBrowserObject: null,
    scrollHidden: false,
  }));
}

// Navbar Search
async function navSearch(e) {
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
async function hotKeys(e) {
  if (this.state.isDisabled) {
    return;
  }
  this.setState({
    isDisabled: true,
  });

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
    await this.changeRowCount(null, parseInt(this.state.cardsPerRow) + 1);
  } else if (e.key === this.state.hotkeyZoomOut) {
    // Do not decrease below min values
    if (this.state.cardsPerRow - 1 === 1) {
      return;
    } else {
      await this.changeRowCount(null, this.state.cardsPerRow - 1);
    }
  }
  this.setState({
    isDisabled: false,
  });
}

export {
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
};
