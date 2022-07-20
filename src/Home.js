import React, { Component } from "react";
import NavBar from "./NavBar";
import { Link } from "react-router-dom";
import "./home.css";
import Template from "./template";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.books = { navtitle: "Books", numRows: 1 };
    this.movies = { navtitle: "Movies", numRows: 1 };
    this.tvShows = { navtitle: "TV Shows", numRows: 1 };
    this.music = { navtitle: "Music", numRows: 1 };

    this.state = {
      navtitle: "Home",
    };
  }

  render() {
    return (
      <div className="homeContainer">
        <div className="homePage">
          <Link
            className="homePageMediaRow"
            to="/books"
            style={{ marginTop: "10vh" }}
          >
            <div className="homeRowTitle">
              <div className="homeRowType">Books</div>
              <i className="fa-solid fa-book"></i>
            </div>

            <div className="homeTemplateRow">
              <Template {...this.books} />
            </div>
          </Link>

          <Link className="homePageMediaRow" to="movies">
            <div className="homeRowTitle">
              <div className="homeRowType">Movies</div>
              <i className="fa-solid fa-film"></i>
            </div>

            <div className="homeTemplateRow">
              <Template {...this.movies} />
            </div>
          </Link>

          <Link className="homePageMediaRow" to="/tv">
            <div className="homeRowTitle">
              <div className="homeRowType">TV Shows</div>
              <i className="fa-solid fa-tv"></i>
            </div>

            <div className="homeTemplateRow">
              <Template {...this.tvShows} />
            </div>
          </Link>

          <Link className="homePageMediaRow" to="/music">
            <div className="homeRowTitle" style={{ marginRight: "5.5vw" }}>
              <div className="homeRowType">Music</div>
              <i className="fa-solid fa-music"></i>
            </div>

            <div className="homeTemplateRow">
              <Template {...this.music} />
            </div>
          </Link>
        </div>
        <NavBar {...this.state} />
      </div>
    );
  }
}
