import React, { Component } from "react";
import "./media.css";
import Template from "./template";

export default class Tv extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navtitle: "TV Shows",
      address: this.props.address,
    };
  }

  render() {
    return <Template {...this.state} />;
  }
}
