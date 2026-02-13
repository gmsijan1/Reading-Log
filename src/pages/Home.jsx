import { useBooks } from "../context/BooksContext";
import InputForm from "../components/InputForm";
import Explore from "./Explore";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import LoginForm from "../pages/LoginForm";
import "../styles/app.css";

export default function Home() {
  const { books, loading, error, editBook, removeBook, user, logout } =
    useBooks();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "watchlist";

  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const genres = useMemo(() => {
    const allGenres = books.map((b) => b.genre).filter(Boolean);
    return ["All", ...Array.from(new Set(allGenres)).sort()];
  }, [books]);

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
      if (!user) return alert("Please login to delete books");
      if (window.confirm("Are you sure you want to delete this book?")) {
        removeBook(book.id);
      }
    };

    const handleStatusChange = (e) => {
      if (!user) return alert("Please login to change status");
      editBook(book.id, { status: e.target.value });
    };

    const handleEditSummary = () => {
      if (!user) return alert("Please login to edit summary");
      navigate(`/summary/${book.id}`);
    };

    return (
      <li key={book.id} className="book-item">
        <div className="book-main">
          <strong className="book-title">{book.title}</strong>

          {activeTab !== "done" && (
            <select
              className="status-dropdown"
              value={book.status}
              onChange={handleStatusChange}
            >
              <option value="watchlist">Watch Later</option>
              <option value="in-progress">Current</option>
              <option value="done">Completed</option>
            </select>
          )}

          {editableSummary && (
            <button className="edit-summary-btn" onClick={handleEditSummary}>
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
    if (!filteredBooks.length) {
      const hasActiveFilters =
        searchQuery.trim() !== "" || genreFilter !== "All";
      return (
        <p>
          {hasActiveFilters
            ? "No books match your filters."
            : "No books in this tab yet."}
        </p>
      );
    }

    return filteredBooks.map(renderBookItem);
  };

  return (
    <div className="home-container">
      <div className="home-header">
        <h2 className="page-title">Reading Log</h2>

        {user ? (
          <div className="profile-section">
            <button
              className="login-btn"
              title={user.email}
              onClick={() => setShowProfileDropdown((prev) => !prev)}
            >
              {user.email[0].toUpperCase()}
            </button>
            {showProfileDropdown && (
              <div className="profile-dropdown">
                <p>{user.email}</p>
                <button
                  className="logout-btn"
                  onClick={() => {
                    logout();
                    setShowProfileDropdown(false);
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className="login-btn" onClick={() => setShowLoginModal(true)}>
            Sign In
          </button>
        )}
      </div>

      {/* LOGIN MODAL */}
      {showLoginModal && <LoginForm onClose={() => setShowLoginModal(false)} />}

      {/* CREATE */}
      <InputForm />

      {!user && (
        <p style={{ color: "#888" }}>
          Public view. Login to add, edit, or delete books.
        </p>
      )}

      {/* Filters */}
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

      {/* Content */}
      {activeTab === "explore" ? (
        <Explore />
      ) : (
        <ul className="book-list">{renderTabContent()}</ul>
      )}
    </div>
  );
}
