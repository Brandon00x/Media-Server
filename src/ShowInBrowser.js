import React, { Component } from "react";
import "./showInBrowser.css";

export default class ShowInBrowser extends Component {
  render() {
    return (
      <div className="showInBrowser">{this.props.showInBrowserObject}</div>
    );
  }
}
