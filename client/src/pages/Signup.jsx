import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { setAuthSession } from "../auth/auth";

function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await API.post("/api/auth/signup", {
        username,
        email,
        password,
      });
      setAuthSession(response.data);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-shell flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleSignup} className="premium-auth-card w-full max-w-sm rounded-3xl p-7">
        <h1 className="premium-title text-2xl font-semibold text-gray-900">Create account</h1>
        <p className="mt-1 text-sm text-gray-500">Start chatting in seconds.</p>

        <div className="mt-5 space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="premium-input w-full rounded-xl px-3 py-2 text-sm text-gray-700 outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="premium-input w-full rounded-xl px-3 py-2 text-sm text-gray-700 outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="premium-input w-full rounded-xl px-3 py-2 text-sm text-gray-700 outline-none"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="premium-input w-full rounded-xl px-3 py-2 text-sm text-gray-700 outline-none"
          />
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="premium-button mt-4 w-full rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Already have an account?{" "}
          <Link to="/" className="font-medium text-indigo-600 hover:text-indigo-700">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;

