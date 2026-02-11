import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3001",
});

// READ
export const getBooks = () => API.get("/books");

// CREATE
export const createBook = (book) => API.post("/books", book);

// UPDATE
export const updateBook = (id, book) => API.put(`/books/${id}`, book);

// DELETE
export const deleteBook = (id) => API.delete(`/books/${id}`);
