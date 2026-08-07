import { Link } from "react-router-dom";
import "../App.css";
import { login } from "../services/AuthServices";

export default function Login() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>

        <form>
          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="Enter email" />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Enter password" />
          </div>

          <div className="row">
            <label className="remember">
              <input type="checkbox" />
              Remember Me
            </label>

            <Link to="/forgot-password" className="link">
              Forgot Password?
            </Link>
          </div>

          <button className="btn">Login</button>
        </form>

        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}