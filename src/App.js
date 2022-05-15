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
import axios from "axios";
import Loading from "./Loading";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: null,
      isLoading: true,
      serverUnreachable: false,
    };
    this.getServerAddress = this.getServerAddress.bind(this);
    this.saveAddress = this.saveAddress.bind(this);
  }

  async componentDidMount() {
    await this.getServerAddress();
  }

  // TODO: Fix Change Server Address
  async getServerAddress() {
    // Change Local Server Addres
    await axios.get(`http://192.168.0.100:3020/props`).then(
      (res) => {
        this.address = res.data.address;
        this.setState({
          address: this.address,
          serverUnreachable: false,
          isLoading: false,
        });
      },
      (err) => {
        console.warn("Unable to connect to server.");
        this.setState({
          serverUnreachable: true,
          isLoading: false,
        });
      }
    );
  }

  saveAddress(e) {
    console.log(e.target.value);
    this.setState({
      address: e.target.value,
    });
  }

  render() {
    return this.state.serverUnreachable ? (
      <div style={{ color: "white" }}>
        <h3>Unable to connect to server.</h3>
        <div style={{ color: "white" }}>
          <h4>Please Enter Server Address/Port:</h4>
          <p>Default Port: 3020</p>
          <p>Address: LAN Address of Node Server.</p>
          <p>Example Format: http://192.168.0.100:3020 </p>
          <span>
            <input
              onChange={this.saveAddress}
              style={{ width: "300px", marginRight: "10px" }}
              placeholder="EX: http://192.168.0.100:3020/"
            />
            <button onClick={this.getServerAddress}>Save</button>
          </span>
        </div>
      </div>
    ) : this.state.isLoading ? (
      <Loading />
    ) : (
      <div>
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
      </div>
    );
  }
}
