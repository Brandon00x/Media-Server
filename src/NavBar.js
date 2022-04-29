import React, { Component } from "react";
import { Navbar, NavDropdown } from "react-bootstrap";
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
      <Navbar className="navBar">
        <span className="navbarTitle">{this.props.navtitle}</span>
        <div className="navTitleRight">
          <Navbar.Collapse id="basic-navbar-nav">
            <NavDropdown
              className="navOptions"
              title="Media"
              id="media"
              onClick={this.toggleDropDown}
            >
              {this.state.toggleDropDownMedia === false ? (
                <div>
                  <NavDropdown.Item
                    className="navLink"
                    onClick={this.toggleDropDown}
                    href="/books"
                  >
                    Books
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    className="navLink"
                    onClick={this.toggleDropDown}
                    href="/movies"
                  >
                    Movies
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    className="navLink"
                    onClick={this.toggleDropDown}
                    href="/tv"
                  >
                    TV Shows
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    className="navLink"
                    onClick={this.toggleDropDown}
                    href="/music"
                  >
                    Music
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    className="navLink"
                    onClick={this.toggleDropDown}
                    href="/photos"
                  >
                    Photos
                  </NavDropdown.Item>
                  <NavDropdown.Item
                    className="navLink"
                    onClick={this.toggleDropDown}
                    href="/settings"
                  >
                    Settings
                  </NavDropdown.Item>{" "}
                </div>
              ) : null}
            </NavDropdown>
          </Navbar.Collapse>
          {this.props.navtitle === "Settings" ? null : (
            <Navbar.Collapse id="basic-navbar-nav">
              <NavDropdown
                className="navOptions"
                title="Options"
                id="options"
                onClick={this.toggleDropDown}
              >
                {this.state.toggleDropDownOptions === false ? (
                  <div>
                    <NavDropdown.Item
                      className="navMediaOptions"
                      style={{ fontWeight: 600 }}
                    >
                      Sorted - {this.props.sortedBy}
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      className="navMediaOptions"
                      onClick={this.props.sort}
                    >
                      Title
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      className="navMediaOptions"
                      onClick={this.props.sortYear}
                    >
                      {this.props.navtitle === "Books"
                        ? "Published"
                        : "Released"}{" "}
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      className="navMediaOptions"
                      onClick={this.props.sortLength}
                    >
                      {this.props.navtitle === "Books" ? "Pages" : "Time"}
                    </NavDropdown.Item>
                    <NavDropdown.Item
                      className="navMediaOptions"
                      onClick={this.props.resetSort}
                    >
                      Reset Sort
                    </NavDropdown.Item>
                  </div>
                ) : null}
              </NavDropdown>
            </Navbar.Collapse>
          )}
        </div>
      </Navbar>
    );
  }
}
