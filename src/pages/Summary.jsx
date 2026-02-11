import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBooks } from "../context/BooksContext";
import "../styles/app.css";

export default function SummaryPage() {
  const { books, editBook } = useBooks();
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!books.length) return;
    const found = books.find((b) => String(b.id) === String(id));
    if (found) {
      setBook(found);
      setSummary(found.summary || "");
    }
  }, [books, id]);

  if (!books.length) return <p>Loading books...</p>;
  if (!book) return <p>Book not found</p>;

  const isDirty = summary !== (book.summary || "");

  const saveSummary = async () => {
    if (!isDirty) return;
    setLoading(true);
    setError(null);

    const prevSummary = book.summary;

    setBook({ ...book, summary });
    try {
      await editBook(book.id, { ...book, summary });
      navigate(-1);
    } catch (e) {
      setBook({ ...book, summary: prevSummary });
      setSummary(prevSummary);
      setError("Failed to save. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="summary-page">
      <h2 className="summary-page-title">Edit Summary: {book.title}</h2>
      <span className="book-genre">({book.genre})</span>
      <textarea
        className="summary-textarea"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="Type your summary here..."
      />
      <div className="summary-buttons">
        <button className="save-summary-btn" onClick={saveSummary}>
          Save
        </button>
        <button className="cancel-btn" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
