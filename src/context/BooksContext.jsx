import { createContext, useContext, useEffect, useState, useMemo } from "react";
import * as BookService from "../api/firebaseBooks";

const BooksContext = createContext();
export const useBooks = () => useContext(BooksContext);

export function BooksProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBooks();
  }, []);

  // LOAD BOOKS
  const loadBooks = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await BookService.getBooks();

      // NORMALIZE DATA: ensure every book has all required fields
      const normalized = (data || []).map((b) => ({
        id: b.id || Date.now().toString(),
        title: b.title || "Untitled",
        author: b.author || "Unknown",
        genre: b.genre || "Uncategorized",
        status: b.status || "watchlist",
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

  // ADD BOOK
  const addBook = async (book) => {
    const timestamp = new Date().toISOString();
    const payload = {
      ...book,
      id: Date.now().toString(),
      createdAt: timestamp,
      updatedAt: timestamp,
      status: book.status || "watchlist",
      summary: book.summary || "",
      image: book.image || "",
    };

    try {
      const saved = await BookService.createBook(payload);
      setBooks((prev) => [...prev, saved]);
    } catch (err) {
      setError(err.message || "Failed to add book");
      setBooks((prev) => [...prev, payload]); // fallback
    }
  };

  // EDIT BOOK
  const editBook = async (id, updates) => {
    const updatedAt = new Date().toISOString();
    const payload = { ...updates, updatedAt };

    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...payload } : b)),
    );

    try {
      await BookService.updateBook(id, payload);
    } catch (err) {
      setError(err.message || "Failed to update book");
    }
  };

  // DELETE BOOK
  const removeBook = async (id) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));

    try {
      await BookService.deleteBook(id);
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
