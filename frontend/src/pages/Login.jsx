import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", formData);
      login(response.data);
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Unable to login. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth">
      <div className="auth__card">
        <h2>Welcome Back</h2>
        <p>Sign in to access the predictive policing dashboard.</p>
        <form onSubmit={handleSubmit} className="auth__form">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {error && <p className="auth__error">{error}</p>}

          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="auth__switch">
          New to the platform? <Link to="/signup">Create an account</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
