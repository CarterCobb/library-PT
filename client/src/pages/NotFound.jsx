import React, { Component } from "react";

export default class NotFound extends Component {
  render() {
    return (
      <div>
        <h1>404 - Not found</h1>
        <p>The page you are looking for does not exist</p>
        <p>
          Please return <a href="/">home</a>.
        </p>
      </div>
    );
  }
}
