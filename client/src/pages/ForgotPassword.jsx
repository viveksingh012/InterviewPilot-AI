import { Link } from "react-router-dom";
import "../App.css"
export default function ForgotPassword() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>

        <form>
          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="Enter registered email" />
          </div>

          <button className="btn">Send Reset Link</button>
        </form>

        <p>
          <Link to="/">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}