import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import { setAuthSession } from "../auth/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await API.post("/api/auth/login", { email, password });
      setAuthSession(response.data);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-shell flex min-h-screen items-center justify-center p-4">
      <form onSubmit={handleLogin} className="premium-auth-card w-full max-w-sm rounded-3xl p-7">
        <h1 className="premium-title text-2xl font-semibold text-gray-900">CipherChat</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to continue.</p>

        <div className="mt-5 space-y-3">
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
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="premium-button mt-4 w-full rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-700">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;

