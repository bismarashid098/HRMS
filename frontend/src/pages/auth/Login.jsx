import "../../style/login.css";

const Login = () => {
  return (
    <div className="login-page">
      {/* LEFT */}
      <div className="login-left">
        <div className="login-box">
          <h1>WorkSphere HRMS</h1>

          <div className="login-row">
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button className="login-btn">Login</button>
          </div>

          <p className="note">Authorized access only</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="login-right">
        <div>
          <h1>Welcome to<br />WorkSphere</h1>
          <p>
            A smart HRMS solution for factories,<br />
            offices & enterprises
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
