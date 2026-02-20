import { useState } from "react";
import { useBooks } from "../context/BooksContext";
import "../styles/app.css";

export default function LoginForm({ onClose }) {
  const { loginWithGoogle, loginWithEmail, registerWithEmail } = useBooks();

  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setError(err.message || "Google login failed");
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password required");
      return;
    }

    try {
      if (tab === "login") {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || "Authentication failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="login-tabs">
          <button
            className={tab === "login" ? "active-tab" : ""}
            onClick={() => setTab("login")}
          >
            Login
          </button>
          <button
            className={tab === "register" ? "active-tab" : ""}
            onClick={() => setTab("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleEmailSubmit} className="login-form">
          {error && <p>{error}</p>}
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
            />
          </div>
          <button type="submit" className="add-btn">
            {tab === "login" ? "Login" : "Register"}
          </button>
        </form>

        <div className="divider">──────────────────────────────────</div>

        <button className="google-btn" onClick={handleGoogleLogin}>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
