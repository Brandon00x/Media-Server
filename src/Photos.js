import React, { Component } from "react";
import "./media.css";
import Template from "./template";

export default class Tv extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navtitle: "Photos",
    };
  }

  render() {
    return <Template {...this.state} />;
  }
}
