import React, { Component } from "react";
import NavBar from "./NavBar";
import { Link } from "react-router-dom";
import "./home.css";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navtitle: "Media Server",
    };
  }

  render() {
    return (
      <div className="homeContainer">
        <NavBar {...this.state} />
        <div className="homePage">
          <Link className="homeIcon" to="/books">
            <h1 className="homeTitle">Books</h1>
            <i className="fa-solid fa-book fa-10x"></i>
          </Link>
          <Link className="homeIcon" to="movies">
            <h1 className="homeTitle">Movies</h1>
            <i className="fa-solid fa-film fa-10x"></i>
          </Link>
          <Link className="homeIcon" to="/tv">
            <h1 className="homeTitle">TV Shows</h1>
            <i className="fa-solid fa-tv fa-10x"></i>
          </Link>
          <Link className="homeIcon" to="/music">
            <h1 className="homeTitle">Music</h1>
            <i className="fa-solid fa-music fa-10x"></i>
          </Link>
          <Link className="homeIcon" to="/photos">
            <h1 className="homeTitle">Photos</h1>
            <i className="fa-solid fa-photo-film fa-10x"></i>
          </Link>
          <Link className="homeIcon" to="/settings">
            <h1 className="homeTitle">Settings</h1>
            <i className="fa fa-cog fa-10x"></i>
          </Link>
        </div>
      </div>
    );
  }
}
