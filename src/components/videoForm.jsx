import React, { Component } from "react";
import axios from "axios";
axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-type": "application/json",
  },
});
class VideoForm extends Component {
  state = {
    video: {},
  };
  handleSubmit = async (event) => {
    event.preventDefault();
    let formData = new FormData();
    formData.append("file", this.state.video);
    axios.post("/video", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    this.props.history.push("/");
  };
  handleChange = (event) => {
    this.setState({ video: event.target.files[0] });
  };
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="file" onChange={this.handleChange} />
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default VideoForm;
