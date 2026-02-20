import { useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext"; // Import Context
import "../../style/login.css";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext); // Use login from context
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { data } = await api.post("/auth/login", { email, password });
            login(data, data.token); // Update context
            navigate("/dashboard");
        } catch (e) {
            setError(
                e?.response?.data?.message || "Login failed. Please check credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-left-inner">
                    <div className="login-box">
                        <h1 className="login-logo-text">WorkSphere HRMS</h1>

                        <form onSubmit={handleLogin}>
                            <input
                                className="login-input"
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <input
                                className="login-input"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            {error && (
                                <p className="login-error-text">{error}</p>
                            )}

                            <button
                                className="login-btn"
                                type="submit"
                                disabled={loading || !email || !password}
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </form>

                        <p className="note">Authorized access only</p>
                    </div>
                </div>
            </div>

            <div className="login-right">
                <div className="login-hero">
                    <p className="login-hero-subtitle">Welcome to</p>
                    <h2 className="login-hero-title">WorkSphere</h2>
                    <p className="login-hero-subtext">
                        A smart HRMS solution for factories, offices &amp; enterprises
                    </p>
                    <div className="login-hero-glow" />
                </div>
            </div>
        </div>
    );
};

export default Login;
