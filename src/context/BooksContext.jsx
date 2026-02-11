import { createContext, useContext, useEffect, useState, useMemo } from "react";
import * as BookService from "../api/api";

const BooksContext = createContext();
export const useBooks = () => useContext(BooksContext);

export function BooksProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await BookService.getBooks();

      const normalized = res.data.map((b) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        genre: b.genre,
        status: b.status,
        summary: b.summary || "",
        image: b.image || "",
        createdAt: b.createdAt || new Date().toISOString(),
        updatedAt: b.updatedAt || new Date().toISOString(),
      }));

      setBooks(normalized);
    } catch (err) {
      setError(err.message || "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  const addBook = async (book) => {
    // Check if book already exists
    const exists = books.some(
      (b) =>
        b.title === book.title &&
        b.author === book.author &&
        b.genre === book.genre,
    );

    if (exists) {
      alert(`"${book.title}" is already in your list!`);
      return; // stop adding
    }

    // Create payload for new book
    const timestamp = new Date().toISOString();
    const payload = {
      ...book,
      id: Date.now().toString(), // unique ID for watch later
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    try {
      const res = await BookService.createBook(payload);
      setBooks((prev) => [...prev, res.data]);
    } catch (err) {
      setError(err.message || "Failed to add book");
      // fallback for local copy, only if you want offline storage
      setBooks((prev) => [...prev, payload]);
    }
  };

  const editBook = async (id, updated) => {
    const timestamp = new Date().toISOString();

    try {
      // Only update the fields provided
      setBooks((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, ...updated, updatedAt: timestamp } : b,
        ),
      );

      // Optional API call to sync
      await BookService.updateBook(id, { ...updated, updatedAt: timestamp });
    } catch (err) {
      setError(err.message || "Failed to update book");
    }
  };

  const removeBook = async (id) => {
    try {
      await BookService.deleteBook(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete book");
    }
  };

  const value = useMemo(
    () => ({
      books,
      loading,
      error,
      addBook,
      editBook,
      removeBook,
    }),
    [books, loading, error],
  );

  return (
    <BooksContext.Provider value={value}>{children}</BooksContext.Provider>
  );
}
