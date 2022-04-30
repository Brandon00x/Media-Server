import React, { Component } from "react";
import { Navbar } from "react-bootstrap";
import "./navbar.css";

export default class NavBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toggleDropDownMedia: true,
      toggleDropDownOptions: true,
    };
    this.toggleDropDown = this.toggleDropDown.bind(this);
  }

  componentDidUpdate() {
    if (this.props.navtitle === "Music") {
      if (this.props.albumColors !== null) {
        this.color1 = this.props.albumColors[0].color1;
        this.color2 = this.props.albumColors[0].color2;
        this.color3 = this.props.albumColors[0].color3;
        this.color4 = this.props.albumColors[0].color4;
      }
    }
  }

  toggleDropDown(e) {
    this.dropDown = e.target.id;
    if (this.dropDown === "media") {
      this.setState((prevState) => ({
        toggleDropDownMedia: !prevState.toggleDropDownMedia,
      }));
    } else {
      this.setState((prevState) => ({
        toggleDropDownOptions: !prevState.toggleDropDownOptions,
      }));
    }
  }

  render() {
    return (
      <Navbar
        className="navBar"
        style={{ color: this.color4, backgroundColor: this.color1 }}
      >
        <span className="navbarTitle">{this.props.navtitle}</span>
        <div className="navTitleRight">
          <button
            id="media"
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
          {this.props.navtitle === "Settings" ? null : (
            <div className="navTitleRight">
              <button
                className="navOptions"
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
                      Title
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
                        : "Released"}{" "}
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
                      {this.props.navtitle === "Books" ? "Pages" : "Time"}
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
