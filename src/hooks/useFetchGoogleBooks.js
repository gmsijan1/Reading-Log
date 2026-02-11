import { useState, useEffect } from "react";
import axios from "axios";

export const useFetchGoogleBooks = (query) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setBooks([]);
      return;
    }

    const fetchBooks = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
            query,
          )}&maxResults=20`,
        );

        const items = res.data.items || [];

        const normalized = items.map((b) => ({
          id: b.id,
          title: b.volumeInfo.title,
          author: (b.volumeInfo.authors || ["Unknown"]).join(", "),
          genre: (b.volumeInfo.categories || ["Unknown"])[0],
          thumbnail: b.volumeInfo.imageLinks?.thumbnail || "",
        }));

        setBooks(normalized);
      } catch (err) {
        setError(err.message || "Failed to fetch books");
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchBooks, 300); // debounce
    return () => clearTimeout(timeout);
  }, [query]);

  return { books, loading, error };
};
