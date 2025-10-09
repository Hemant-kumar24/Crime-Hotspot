import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="navbar">
      <Link className="navbar__brand" to="/">
        Predictive Policing
      </Link>
      <nav className="navbar__links">
        {isAuthenticated ? (
          <>
            <span className="navbar__welcome">Hi, {user?.name}</span>
            <Link to="/dashboard" className="navbar__action">
              Dashboard
            </Link>
            <button type="button" className="navbar__logout" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar__action">
              Login
            </Link>
            <Link to="/signup" className="navbar__action navbar__action--primary">
              Sign Up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
