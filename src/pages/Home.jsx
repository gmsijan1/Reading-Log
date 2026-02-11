import { useBooks } from "../context/BooksContext";
import InputForm from "../components/InputForm";
import Explore from "./Explore"; // new
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import "../styles/app.css";

export default function Home() {
  const { books, loading, error, editBook, removeBook } = useBooks();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "watchlist";

  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const genres = useMemo(
    () => [
      "All",
      ...Array.from(new Set(books.map((b) => b.genre).filter(Boolean))),
    ],
    [books],
  );

  const filteredBooks = useMemo(() => {
    return books
      .filter((b) => b.status === activeTab)
      .filter((b) => b.title?.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(
        (b) => genreFilter === "All" || (b.genre && b.genre === genreFilter),
      );
  }, [books, activeTab, searchQuery, genreFilter]);

  const renderBookItem = (book) => {
    const editableSummary = activeTab === "in-progress" || activeTab === "done";

    const handleDelete = () => {
      if (window.confirm("Are you sure you want to delete this book?")) {
        removeBook(book.id);
      }
    };

    return (
      <li key={book.id} className="book-item">
        <div className="book-main">
          <strong className="book-title">{book.title}</strong>
          {activeTab !== "done" && (
            <select
              className="status-dropdown"
              value={book.status}
              onChange={(e) => editBook(book.id, { status: e.target.value })}
            >
              <option value="watchlist">Watch Later</option>
              <option value="in-progress">Current</option>
              <option value="done">Completed</option>
            </select>
          )}
          {editableSummary && (
            <button
              className="edit-summary-btn"
              onClick={() => navigate(`/summary/${book.id}`)}
            >
              Edit Summary
            </button>
          )}
          <button className="delete-btn" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </li>
    );
  };

  const renderTabContent = () => {
    if (loading) return <p>Loading books...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (!filteredBooks.length) return <p>No books match your filters.</p>;

    return filteredBooks.map(renderBookItem);
  };

  return (
    <div className="home-container">
      <h2 className="page-title">Reading Log</h2>

      <InputForm />

      {/* Search + Genre Filter (not used in Explore) */}
      {activeTab !== "explore" && (
        <div className="filters">
          <input
            className="search-input"
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="genre-filter"
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
          >
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "watchlist" ? "tab active" : "tab"}
          onClick={() => handleTabChange("watchlist")}
        >
          Watch Later
        </button>
        <button
          className={activeTab === "in-progress" ? "tab active" : "tab"}
          onClick={() => handleTabChange("in-progress")}
        >
          Current
        </button>
        <button
          className={activeTab === "done" ? "tab active" : "tab"}
          onClick={() => handleTabChange("done")}
        >
          Completed
        </button>
        <button
          className={activeTab === "explore" ? "tab active" : "tab"}
          onClick={() => handleTabChange("explore")}
        >
          Explore
        </button>
      </div>

      {/* Book List / Explore */}
      {activeTab === "explore" ? (
        <Explore />
      ) : (
        <ul className="book-list">{renderTabContent()}</ul>
      )}
    </div>
  );
}
