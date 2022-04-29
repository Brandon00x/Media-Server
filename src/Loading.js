import React, { Component } from "react";
import "./Loading.scss";

export default class Loading extends Component {
  render() {
    return (
      <div>
        <div className="e-loadholder">
          <div className="m-loader">
            <span className="e-text">Loading</span>
          </div>
        </div>
        <div id="particleCanvas-Blue"></div>
        <div id="particleCanvas-White"></div>
      </div>
    );
  }
}
