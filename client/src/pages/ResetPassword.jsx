import "../App.css";

export default function ResetPassword() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>

        <form>
          <div className="input-group">
            <label>New Password</label>
            <input type="password" />
          </div>

          <div className="input-group">
            <label>Confirm Password</label>
            <input type="password" />
          </div>

          <button className="btn">Reset Password</button>
        </form>
      </div>
    </div>
  );
}