import { useState, useEffect } from "react";
import { useBooks } from "../context/BooksContext";
import "../styles/app.css";

export default function InputForm({
  editBookId = null,
  existingData = null,
  onFinish,
  showPopup,
}) {
  const { addBook, editBook, books, user } = useBooks(); // user added

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("Fiction");
  const [status, setStatus] = useState("watchlist");
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    if (existingData) {
      setTitle(existingData.title || "");
      setAuthor(existingData.author || "");
      setGenre(existingData.genre || "Fiction");
      setStatus(existingData.status || "watchlist");
    }
  }, [existingData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showPopup?.("Please login to add or edit books");
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedAuthor = author.trim();

    if (!trimmedTitle) {
      showPopup?.("Title is required");
      return;
    }
    if (trimmedTitle.length > 100) {
      showPopup?.("Title too long (max 100 chars)");
      return;
    }
    if (trimmedAuthor.length > 100) {
      showPopup?.("Author name too long (max 100 chars)");
      return;
    }

    const isDuplicate = books.some(
      (b) =>
        b.title.trim().toLowerCase() === trimmedTitle.toLowerCase() &&
        b.id !== editBookId,
    );
    if (isDuplicate) {
      showPopup?.("A book with this title already exists");
      return;
    }
    const timestamp = new Date().toISOString();
    const bookData = {
      title: trimmedTitle,
      author: trimmedAuthor,
      genre,
      status,
      summary: existingData?.summary || "",
      createdAt: existingData?.createdAt || timestamp,
      updatedAt: timestamp,
    };

    if (editBookId) {
      await editBook(editBookId, bookData);
      showPopup?.("Book updated successfully");
    } else {
      await addBook(bookData);
      showPopup?.("Book added successfully");
    }

    setTitle("");
    setAuthor("");
    setGenre("Fiction");
    setStatus("watchlist");

    if (onFinish) onFinish();
  };

  return (
    <div className="input-form-container">
      <form onSubmit={handleSubmit} className="input-form">
        <div className="form-group">
          <label>
            <strong>Title:</strong>
          </label>
          <input
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Book Title"
          />
        </div>

        <div className="form-group">
          <label>
            <strong>Author:</strong>
          </label>
          <input
            className="form-input"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author Name"
          />
        </div>

        <div className="form-group">
          <label>
            <strong>Genre:</strong>
          </label>
          <select
            className="form-select"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
          >
            <option value="Fiction">Fiction</option>
            <option value="Non-Fiction">Non-Fiction</option>
            <option value="Biography">Biography</option>
            <option value="Self-Help">Self-Help</option>
            <option value="Science">Science</option>
            <option value="Fantasy">Fantasy</option>
          </select>
        </div>

        <div className="form-group">
          <label>
            <strong>Status:</strong>
          </label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="watchlist">Watch Later</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="form-group form-actions">
          <button
            type="button"
            className="pdf-btn"
            onClick={() => setShowPdfModal(true)}
            title="PDF upload coming soon"
          >
            📎 PDF
          </button>
        </div>

        <button type="submit" className="add-btn primary-action">
          {editBookId ? "✓ Save Book" : "+ Add Book"}
        </button>
      </form>

      {showPdfModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close-btn"
              onClick={() => setShowPdfModal(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <p>PDF upload is not available yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}
