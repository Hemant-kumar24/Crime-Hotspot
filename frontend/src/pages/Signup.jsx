import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
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
      const response = await api.post("/auth/register", formData);
      login(response.data);
      navigate("/dashboard");
    } catch (err) {
      const message = err.response?.data?.message || "Unable to sign up. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth">
      <div className="auth__card">
        <h2>Create Your Account</h2>
        <p>Join the team and start exploring predictive policing insights.</p>
        <form onSubmit={handleSubmit} className="auth__form">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Jane Doe"
            value={formData.name}
            onChange={handleChange}
            required
          />

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
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />

          {error && <p className="auth__error">{error}</p>}

          <button type="submit" className="btn btn--primary" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth__switch">
          Already onboard? <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  );
};

export default Signup;
