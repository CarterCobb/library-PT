import React, { Component } from "react";

export default class NotAuthorized extends Component {
  render() {
    return (
      <div>
        <h1>Not Authorized</h1>
        <p>You are not authorized to view this page or resource.</p>
        <p>
          Please return <a href="/">home</a>.
        </p>
      </div>
    );
  }
}
