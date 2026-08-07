import { Link } from "react-router-dom";
import "../App.css";

export default function Register() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>

        <form>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" placeholder="Enter name" />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="Enter email" />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Enter password" />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input type="password" placeholder="Confirm password" />
          </div>

          <button className="btn">Register</button>
        </form>

        <p>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}