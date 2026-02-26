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
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleSignup} className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-gray-900">Create account</h1>
        <p className="mt-1 text-sm text-gray-500">Start chatting in seconds.</p>

        <div className="mt-5 space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition-all duration-200 ease-in-out focus:border-indigo-600"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition-all duration-200 ease-in-out focus:border-indigo-600"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition-all duration-200 ease-in-out focus:border-indigo-600"
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition-all duration-200 ease-in-out focus:border-indigo-600"
          />
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 ease-in-out hover:bg-indigo-700 disabled:opacity-60"
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
