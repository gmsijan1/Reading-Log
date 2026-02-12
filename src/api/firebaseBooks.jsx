import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

const booksRef = collection(db, "books");

// READ
export const getBooks = async () => {
  const snapshot = await getDocs(booksRef);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
};

// CREATE
export const createBook = async (book) => {
  const ref = await addDoc(booksRef, book);
  return { id: ref.id, ...book };
};

// UPDATE
export const updateBook = async (id, updates) => {
  await updateDoc(doc(db, "books", id), updates);
};

// DELETE
export const deleteBook = async (id) => {
  await deleteDoc(doc(db, "books", id));
};
