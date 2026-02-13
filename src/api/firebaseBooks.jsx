import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

const booksRef = collection(db, "books");

// READ all books
export const getBooks = async () => {
  const snapshot = await getDocs(booksRef);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
};

// CREATE (auth required)
export const createBook = async (book, auth) => {
  if (!auth.currentUser) throw new Error("Not authenticated");

  const now = new Date().toISOString();
  const ref = await addDoc(booksRef, {
    title: book.title,
    author: book.author,
    genre: book.genre,
    status: book.status,
    summary: book.summary || "",
    image: book.image || "",
    userId: auth.currentUser.uid,
    createdAt: now,
    updatedAt: now,
  });

  // Return the book with the actual Firestore document ID
  return {
    id: ref.id,
    title: book.title,
    author: book.author,
    genre: book.genre,
    status: book.status,
    summary: book.summary || "",
    image: book.image || "",
    userId: auth.currentUser.uid,
    createdAt: now,
    updatedAt: now,
  };
};

// UPDATE (auth required)
export const updateBook = async (id, updates, auth) => {
  if (!auth.currentUser) throw new Error("Not authenticated");

  const ref = doc(db, "books", id); // Firestore doc reference
  await updateDoc(ref, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

// DELETE (auth required)
export const deleteBook = async (id, auth) => {
  if (!auth.currentUser) throw new Error("Not authenticated");

  const ref = doc(db, "books", id);
  await deleteDoc(ref);
};
