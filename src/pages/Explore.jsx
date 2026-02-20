import { useBooks } from "../context/BooksContext";
import { useState, useEffect } from "react";
import "../styles/app.css";

export default function Explore({ showPopup }) {
  const { addBook, books: watchLaterBooks, user } = useBooks();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "https://www.googleapis.com/books/v1/volumes?q=programming&maxResults=40",
        );

        if (!res.ok) {
          if (res.status === 429) {
            throw new Error(
              "Rate limit exceeded. Please wait a moment and refresh.",
            );
          }
          throw new Error(`API error: ${res.status}`);
        }

        const data = await res.json();

        if (!cancelled) {
          setBooks(data.items || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to fetch books");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchBooks();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdd = (book) => {
    if (!user) {
      showPopup?.("Please login to add books");
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
      showPopup?.(`"${payload.title}" is already in Watch Later`);
      return;
    }

    addBook(payload);
    showPopup?.(`Added "${payload.title}" to Watch Later`);
  };

  if (loading) return <p>Loading books...</p>;
  if (error)
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button className="add-btn" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  if (!books.length) return <p>No books found.</p>;

  return (
    <div className="explore-container">
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
                  disabled={user && exists}
                >
                  {user && exists ? "Added" : "Add to Watch Later"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
