import { useBooks } from "../context/BooksContext";
import { useState, useEffect } from "react";
import "../styles/app.css";
import LoginForm from "./LoginForm";

export default function Explore() {
  const { addBook, books: watchLaterBooks, user } = useBooks();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "https://www.googleapis.com/books/v1/volumes?q=programming&maxResults=40",
        );
        const data = await res.json();
        setBooks(data.items || []);
      } catch (err) {
        setError(err.message || "Failed to fetch books");
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handleAdd = (book) => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    const payload = {
      title: book.volumeInfo.title,
      author: (book.volumeInfo.authors || []).join(", "),
      genre: book.volumeInfo.categories?.[0] || "Unknown",
      status: "watchlist",
      image: book.volumeInfo.imageLinks?.thumbnail || "",
    };

    const exists = watchLaterBooks.some(
      (b) =>
        b.title === payload.title &&
        b.author === payload.author &&
        b.genre === payload.genre,
    );

    if (exists) {
      alert(`"${payload.title}" is already in Watch Later`);
      return; // stops here, alert only once
    }

    addBook(payload);
    alert(`Added "${payload.title}" to Watch Later`);
  };

  if (loading) return <p>Loading books...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!books.length) return <p>No books found.</p>;

  return (
    <div className="explore-container">
      {showLoginModal && <LoginForm onClose={() => setShowLoginModal(false)} />}
      <h2>Explore Books</h2>
      <div className="explore-grid">
        {books.map((book) => {
          const payload = {
            title: book.volumeInfo.title,
            author: (book.volumeInfo.authors || []).join(", "),
            genre: book.volumeInfo.categories?.[0] || "Unknown",
          };
          const exists = watchLaterBooks.some(
            (b) =>
              b.title === payload.title &&
              b.author === payload.author &&
              b.genre === payload.genre,
          );

          return (
            <div key={book.id} className="book-card">
              <div className="book-image-wrapper">
                {book.volumeInfo.imageLinks?.thumbnail ? (
                  <img
                    src={book.volumeInfo.imageLinks.thumbnail}
                    alt={book.volumeInfo.title}
                  />
                ) : (
                  <div className="placeholder-image">No Image</div>
                )}
              </div>

              <div className="book-content">
                <h3 className="book-title">{book.volumeInfo.title}</h3>
                <p className="book-author">
                  {book.volumeInfo.authors?.join(", ") || "Unknown"}
                </p>
                <button
                  className="add-btn"
                  onClick={() => handleAdd(book)}
                  disabled={exists}
                >
                  {exists ? "Added" : "Add to Watch Later"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
