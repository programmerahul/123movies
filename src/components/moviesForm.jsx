import React from "react";
import { saveMovie, getMovie } from "../services/movieService";
import Form from "./common/form";
import Joi from "joi-browser";
import { getGenres } from "../services/genreService";
import axios from "axios";
axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-type": "application/json",
  },
});
class MoviesForm extends Form {
  state = {
    data: { title: "", numberInStock: "", dailyRentalRate: "" },
    genreId: "",
    video: {},
    errors: {},
    genres: [],
  };
  async componentDidMount() {
    const { data: genres } = await getGenres();
    this.setState({ genres });
    const { _id } = this.props.match.params;

    if (_id !== "new") {
      let movie = {};
      try {
        const { data } = await getMovie(_id);
        movie = data;
      } catch (ex) {
        if (ex.response && ex.response.status === 404) {
          this.props.history.replace("/notFound");
        }
        return;
      }
      const data = {
        title: movie.title,
        numberInStock: movie.numberInStock,
        dailyRentalRate: movie.dailyRentalRate,
      };
      const genreId = movie.genre._id;
      this.setState({ data, genreId });
    }
  }

  doSubmit = async () => {
    const { data, genreId } = this.state;
    const movie = { ...data };
    movie.genreId = genreId;
    const { _id } = this.props.match.params;
    if (_id !== "new") movie._id = _id;
    this.props.history.push("/movies");
    let formData = new FormData();
    formData.append("file", this.state.video);
    const res = await axios.post("/video", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    movie.filename = res.data.file.filename;
    saveMovie(movie);
  };
  schema = {
    title: Joi.string().min(5).required().label("Title"),
    numberInStock: Joi.number()
      .min(0)
      .max(100)
      .required()
      .label("Number in Stock"),
    dailyRentalRate: Joi.number().min(0).max(10).required().label("Rate"),
  };
  handleSelectChange = ({ currentTarget: input }) => {
    this.setState({ genreId: input.value });
  };
  handleFileChange = (event) => {
    if (event && event.target && event.target.files)
      this.setState({ video: event.target.files[0] });
  };
  render() {
    return (
      <div>
        <h1>Movies Form</h1>
        <form onSubmit={this.handleSubmit}>
          {this.renderInput("title", "Title")}
          {this.renderSelect(
            this.state.genreId,
            "Genre",
            this.handleSelectChange,
            this.state.genres
          )}
          {this.renderInput("numberInStock", "Number in Stock")}
          {this.renderInput("dailyRentalRate", "Rate")}
          <input type="file" onChange={this.handleFileChange} />
          {this.renderButton("Save")}
        </form>
      </div>
    );
  }
}
export default MoviesForm;
