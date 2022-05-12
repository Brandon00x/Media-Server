import React, { Component } from "react";
import { Navbar } from "react-bootstrap";
import "./navbar.css";

export default class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toggleDropDownMedia: true,
      toggleDropDownOptions: true,
      showHideAlbum: false,
    };
    this.toggleDropDown = this.toggleDropDown.bind(this);
  }

  componentDidUpdate() {
    if (this.props.navtitle === "Music") {
      this.sortLengthTitle = "Tracks";
      if (this.props.albumColors !== null) {
        this.color1 = this.props.albumColors[0].color1;
        this.color2 = this.props.albumColors[0].color2;
        this.color3 = this.props.albumColors[0].color3;
        this.color4 = this.props.albumColors[0].color4;
      }
    } else if (this.props.navtitle === "Books") {
      this.sortLengthTitle = "Pages";
    } else if (this.props.navtitle === "Movies") {
      this.sortLengthTitle = "Time";
    } else if (this.props.navtitle === "TV Shows") {
      this.sortLengthTitle = "Time";
    } else if (this.props.navtitle === "Photos") {
      this.sortLengthTitle = "Time";
    }
  }

  toggleDropDown(e) {
    this.dropDown = e.target.id;
    if (this.dropDown === "media") {
      this.setState((prevState) => ({
        toggleDropDownMedia: !prevState.toggleDropDownMedia,
        toggleDropDownOptions: true,
      }));
    } else {
      this.setState((prevState) => ({
        toggleDropDownOptions: !prevState.toggleDropDownOptions,
        toggleDropDownMedia: true,
      }));
    }
  }

  render() {
    return (
      <Navbar
        className="navBar"
        style={{ color: this.color4, backgroundColor: this.color1, zIndex: 10 }}
      >
        <span className="navbarTitle">{this.props.navtitle}</span>
        <div className="navTitleRight">
          <button
            id="media"
            title="Media Categories"
            className="navOptions"
            onClick={this.toggleDropDown}
            style={{ color: this.color4, backgroundColor: this.color1 }}
          >
            Media
          </button>
          {this.state.toggleDropDownMedia === false ? (
            <div className="navbarDropDown">
              <div
                className="navbarDropDownItem"
                style={{ backgroundColor: this.color1 }}
              >
                <a
                  className="navbarLinkButton"
                  href="/books"
                  style={{
                    color: this.color4,
                    backgroundColor: this.color1,
                    borderColor: this.color4,
                  }}
                  onClick={this.toggleDropDown}
                >
                  Books
                </a>
                <a
                  className="navbarLinkButton"
                  href="/movies"
                  style={{
                    color: this.color4,
                    backgroundColor: this.color1,
                    borderColor: this.color4,
                  }}
                  onClick={this.toggleDropDown}
                >
                  Movies
                </a>
                <a
                  className="navbarLinkButton"
                  href="/tv"
                  style={{
                    color: this.color4,
                    backgroundColor: this.color1,
                    borderColor: this.color4,
                  }}
                  onClick={this.toggleDropDown}
                >
                  TV Shows
                </a>
                <a
                  className="navbarLinkButton"
                  href="/music"
                  style={{
                    color: this.color4,
                    backgroundColor: this.color1,
                    borderColor: this.color4,
                  }}
                  onClick={this.toggleDropDown}
                >
                  Music
                </a>
                <a
                  className="navbarLinkButton"
                  href="/photos"
                  style={{
                    color: this.color4,
                    backgroundColor: this.color1,
                    borderColor: this.color4,
                  }}
                  onClick={this.toggleDropDown}
                >
                  Photos
                </a>
                <a
                  className="navbarLinkButton"
                  href="/settings"
                  style={{
                    color: this.color4,
                    backgroundColor: this.color1,
                    borderColor: this.color4,
                  }}
                  onClick={this.toggleDropDown}
                >
                  Settings
                </a>
              </div>
            </div>
          ) : null}
          {this.props.navtitle === "Settings" ||
          this.props.navtitle === "Missing Media" ? null : (
            <div className="navTitleRight">
              <button
                className="navOptions"
                title="Media Options"
                onClick={this.toggleDropDown}
                style={{ color: this.color4, backgroundColor: this.color1 }}
              >
                Options
              </button>
              {this.state.toggleDropDownOptions === false ? (
                <div className="navbarDropDown1">
                  <div
                    className="navbarDropDownItem"
                    style={{ backgroundColor: this.color1 }}
                  >
                    <input
                      className="navMediaOptions"
                      placeholder="Find..."
                      onChange={this.props.navSearch}
                      style={{ backgroundColor: this.color1 }}
                    />
                    <button
                      className="navMediaOptions"
                      style={{
                        color: this.color4,
                        backgroundColor: this.color1,
                        borderColor: this.color4,
                        fontWeight: 600,
                      }}
                    >
                      Sorted - {this.props.sortedBy}
                    </button>
                    <button
                      className="navMediaOptions"
                      onClick={this.props.sort}
                      style={{
                        color: this.color4,
                        backgroundColor: this.color1,
                        borderColor: this.color4,
                      }}
                    >
                      {this.props.navtitle === "Music" ? "Artist" : "Title"}
                    </button>
                    <button
                      className="navMediaOptions"
                      onClick={this.props.sortYear}
                      style={{
                        color: this.color4,
                        backgroundColor: this.color1,
                        borderColor: this.color4,
                      }}
                    >
                      {this.props.navtitle === "Books"
                        ? "Published"
                        : "Released"}
                    </button>
                    <button
                      className="navMediaOptions"
                      onClick={this.props.sortLength}
                      style={{
                        color: this.color4,
                        backgroundColor: this.color1,
                        borderColor: this.color4,
                      }}
                    >
                      {this.sortLengthTitle}
                    </button>
                    <button
                      className="navMediaOptions"
                      onClick={this.props.resetSort}
                      style={{
                        color: this.color4,
                        backgroundColor: this.color1,
                        borderColor: this.color4,
                      }}
                    >
                      Reset Sort
                    </button>
                    {this.props.isLoading ? null : (
                      <div>
                        <button
                          className="navMediaOptions"
                          style={{
                            color: this.color4,
                            backgroundColor: this.color1,
                            borderColor: this.color4,
                            fontWeight: 600,
                          }}
                        >
                          View Options
                        </button>
                        <button
                          className="navMediaOptions"
                          onClick={this.props.hideScroll}
                          style={{
                            color: this.color4,
                            backgroundColor: this.color1,
                            borderColor: this.color4,
                          }}
                        >
                          {this.props.scrollHidden ? "Show" : "Hide"} Scroll
                        </button>
                        <button
                          className="navMediaOptions"
                          onClick={this.props.scrollToTop}
                          style={{
                            color: this.color4,
                            backgroundColor: this.color1,
                            borderColor: this.color4,
                          }}
                        >
                          Scroll Top
                        </button>
                        <button
                          className="navMediaOptions"
                          onClick={this.props.scrollToBottom}
                          style={{
                            color: this.color4,
                            backgroundColor: this.color1,
                            borderColor: this.color4,
                          }}
                        >
                          Scroll Bottom
                        </button>
                        <button
                          className="navMediaOptions"
                          style={{
                            color: this.color4,
                            backgroundColor: this.color1,
                            borderColor: this.color4,
                            fontWeight: 600,
                          }}
                        >
                          Zoom - {this.props.cardsPerRow}
                        </button>
                        <div
                          className="navMediaOptions sliderNav"
                          style={{
                            color: this.color4,
                            backgroundColor: this.color1,
                            borderColor: this.color4,
                          }}
                        >
                          <input
                            type="range"
                            min="2"
                            max={this.props.navtitle === "Music" ? 16 : 9}
                            step="1"
                            value={this.props.cardsPerRow}
                            className="navslider"
                            onChange={this.props.changeRowCount}
                          />
                        </div>
                      </div>
                    )}
                    {this.props.navtitle === "Music" ? (
                      <div>
                        <button
                          className="navMediaOptions"
                          onClick={this.props.hideAlbumTitle}
                          style={{
                            color: this.color4,
                            borderColor: this.color4,
                            backgroundColor: this.color1,
                          }}
                          value={false}
                        >
                          {this.props.albumTitleHidden === true
                            ? "Show Album Title"
                            : "Hide Album Title"}
                        </button>
                        <button
                          className="navMediaOptions"
                          onClick={this.props.hideArtist}
                          style={{
                            color: this.color4,
                            borderColor: this.color4,
                            backgroundColor: this.color1,
                          }}
                          value={false}
                        >
                          {this.props.artistHidden === true
                            ? "Show Artist"
                            : "Hide Artist"}
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </Navbar>
    );
  }
}
