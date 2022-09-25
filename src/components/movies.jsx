import React, { Component } from "react";
import { getMovies, deleteMovie, getVideos } from "../services/movieService";
import Pagination from "./common/pagination";
import { Paginate } from "../utils/paginate";
import ListGroup from "./common/listGroup";
import { getGenres } from "../services/genreService";
import MoviesTable from "./moviesTable";
import SearchBar from "./common/searchBar";
import { saveMovie } from "../services/movieService";
import _ from "lodash";
import { toast } from "react-toastify";
class Movie extends Component {
  state = {
    movies: [],
    vidoes: [],
    genre: [],
    pageSize: 4,
    currentPage: 1,
    currentGenre: "",
    searchItem: "",
    sortColumn: { path: "title", order: "asc" },
  };
  async componentDidMount() {
    const { data: genres } = await getGenres();
    const genre = [{ name: "All Genre", _id: "" }, ...genres];
    const currentGenre = { name: "All Genre", _id: "" };
    const { data: videos } = await getVideos();
    this.setState({ movies: await getMovies(), videos, genre, currentGenre });
  }
  handleItemSelect = (genre) => {
    this.setState({ currentGenre: genre, currentPage: 1, searchItem: "" });
  };
  handleDelete = async (id) => {
    const originalMovies = this.state.movies;
    const movies = originalMovies.filter((m) => m._id !== id);
    this.setState({ movies });
    try {
      await deleteMovie(id);
    } catch (ex) {
      if (ex.response && ex.response.status === 404) {
        toast.error("This movies is already deleted!");
      }
      this.setState({ movies: originalMovies });
    }
  };
  handleClick = (movie) => {
    const movies = [...this.state.movies];
    const index = movies.indexOf(movie);
    movies[index] = { ...movies[index] };
    if (movies[index].like) {
      movies[index].numberInStock--;
    } else {
      movies[index].numberInStock++;
    }
    movies[index].like = !movies[index].like;
    saveMovie(movies[index]);
    this.setState({ movies });
  };
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  };
  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };
  handleNewMovie = () => {
    this.props.history.push("/movies/new");
  };
  handleSearch = (searchItem) => {
    this.setState({
      searchItem,
      currentGenre: "",
      currentPage: 1,
    });
  };
  getPagedData = () => {
    const {
      pageSize,
      currentPage,
      movies: allMovies,
      sortColumn,
      currentGenre,
      searchItem,
    } = this.state;
    let filtered = allMovies;
    if (searchItem) {
      filtered = filtered.filter(
        (m) => m.title.toLowerCase().indexOf(searchItem.toLowerCase()) === 0
      );
    } else {
      filtered =
        currentGenre && currentGenre._id
          ? allMovies.filter((mov) => mov.genre._id === currentGenre._id)
          : allMovies;
    }
    const { length: count } = filtered;
    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);
    const movies = Paginate(sorted, currentPage, pageSize);
    return { data: movies, totalCount: count };
  };

  render() {
    const { pageSize, currentPage, currentGenre, sortColumn, genre } =
      this.state;
    const { data: movies, totalCount } = this.getPagedData();
    return (
      <div className="row">
        <div className="col-2">
          <ListGroup
            itemSelected={currentGenre}
            onItemSelect={this.handleItemSelect}
            items={genre}
          />
        </div>
        <div className="col">
          {
            <button
              style={{ marginBottom: 20 }}
              onClick={this.handleNewMovie}
              className="btn  btn-primary"
            >
              <i className="fa fa-upload mr-1" aria-hidden="true"></i>
              Upload
            </button>
          }
          <p>Showing {totalCount} movies in database</p>
          <SearchBar
            onChange={this.handleSearch}
            value={this.state.searchItem}
          />
          <MoviesTable
            movies={movies}
            sortColumn={sortColumn}
            onDelete={this.handleDelete}
            onLike={this.handleClick}
            onSort={this.handleSort}
          />
          <Pagination
            itemsCount={totalCount}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
      </div>
    );
  }
}
export default Movie;
