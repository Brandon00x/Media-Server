import React, { Component } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Books from "./Books";
import Movies from "./Movies";
import Tv from "./TVShows";
import Music from "./Music";
import Photos from "./Photos";
import Settings from "./Settings";

export default class App extends Component {
  render() {
    return (
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/photos" element={<Photos />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/books" element={<Books />} />
            <Route path="/music" element={<Music />} />
            <Route path="/tv" element={<Tv />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </BrowserRouter>
      </div>
    );
  }
}
