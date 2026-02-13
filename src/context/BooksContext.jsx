import { createContext, useContext, useEffect, useState, useMemo } from "react";
import * as BookService from "../api/firebaseBooks";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

const BooksContext = createContext();
export const useBooks = () => useContext(BooksContext);

export function BooksProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const auth = getAuth();
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    loadBooks();

    // Persist user
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  // --- CRUD ---
  const loadBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await BookService.getBooks();

      // Normalize books
      const normalized = data.map((b) => ({
        id: b.id,
        title: b.title || "",
        author: b.author || "",
        genre: b.genre || "Fiction",
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

  const addBook = async (book) => {
    if (!user) throw new Error("Not authenticated");
    try {
      const saved = await BookService.createBook(book, auth);
      setBooks((prev) => [...prev, saved]);
    } catch (err) {
      setError(err.message || "Failed to add book");
      throw err;
    }
  };

  const editBook = async (id, updates) => {
    if (!user) throw new Error("Not authenticated");
    setBooks((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, ...updates, updatedAt: new Date().toISOString() }
          : b,
      ),
    );
    try {
      await BookService.updateBook(id, updates, auth);
    } catch (err) {
      setError(err.message || "Failed to update book");
    }
  };

  const removeBook = async (id) => {
    if (!user) throw new Error("Not authenticated");
    setBooks((prev) => prev.filter((b) => b.id !== id));
    try {
      await BookService.deleteBook(id, auth);
    } catch (err) {
      setError(err.message || "Failed to delete book");
    }
  };

  // --- AUTH ---
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    setUser(result.user);
  };

  const loginWithEmail = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    setUser(result.user);
  };

  const registerWithEmail = async (email, password) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    setUser(result.user);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      books,
      loading,
      error,
      addBook,
      editBook,
      removeBook,
      user,
      setUser,
      loginWithGoogle,
      loginWithEmail,
      registerWithEmail,
      logout,
    }),
    [books, loading, error, user],
  );

  return (
    <BooksContext.Provider value={value}>{children}</BooksContext.Provider>
  );
}
