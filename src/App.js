import React, { Component } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Books from "./Books";
import Movies from "./Movies";
import Tv from "./TVShows";
import Music from "./Music";
import Photos from "./Photos";
import Settings from "./Settings";
import MediaNotFound from "./MediaNotFound";

export default class App extends Component {
  render() {
    return (
      <BrowserRouter {...this.state}>
        <Routes {...this.state}>
          <Route path="/" element={<Home />} />
          <Route path="/photos" element={<Photos {...this.state} />} />
          <Route path="/movies" element={<Movies {...this.state} />} />
          <Route path="/books" element={<Books {...this.state} />} />
          <Route path="/music" element={<Music {...this.state} />} />
          <Route path="/tv" element={<Tv {...this.state} />} />
          <Route path="/settings" element={<Settings {...this.state} />} />
          <Route path="/missingmedia" element={<MediaNotFound />} />
        </Routes>
      </BrowserRouter>
    );
  }
}
