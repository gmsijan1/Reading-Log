import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BooksProvider } from "./context/BooksContext";
import Home from "./pages/Home";
import Summary from "./pages/Summary";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <BooksProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/summary/:id" element={<Summary />} />
          </Routes>
        </BrowserRouter>
      </BooksProvider>
    </ErrorBoundary>
  );
}
