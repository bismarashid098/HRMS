import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect, useRef } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import "../../style/login.css";

const StarCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // Create stars
        const STAR_COUNT = 180;
        const stars = Array.from({ length: STAR_COUNT }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * 1.4 + 0.3,
            alpha: Math.random() * 0.7 + 0.2,
            speed: Math.random() * 0.25 + 0.05,
            drift: (Math.random() - 0.5) * 0.12,
            twinkleSpeed: Math.random() * 0.012 + 0.004,
            twinkleDir: Math.random() > 0.5 ? 1 : -1,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach((s) => {
                // Twinkle
                s.alpha += s.twinkleSpeed * s.twinkleDir;
                if (s.alpha >= 0.95 || s.alpha <= 0.1) s.twinkleDir *= -1;

                // Move upward + slight horizontal drift
                s.y -= s.speed;
                s.x += s.drift;

                // Wrap around
                if (s.y < -2) { s.y = canvas.height + 2; s.x = Math.random() * canvas.width; }
                if (s.x < -2) s.x = canvas.width + 2;
                if (s.x > canvas.width + 2) s.x = -2;

                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
                ctx.fill();
            });
            animId = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="lp-stars" />;
};

const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPass, setShowPass] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { data } = await api.post("/auth/login", { email, password });
            login(data, data.token);
            navigate("/dashboard");
        } catch (e) {
            setError(e?.response?.data?.message || "Login failed. Please check credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lp-root">
            {/* Star field */}
            <StarCanvas />

            {/* Animated background blobs */}
            <div className="lp-blob lp-blob1" />
            <div className="lp-blob lp-blob2" />
            <div className="lp-blob lp-blob3" />

            <div className="lp-container">
                {/* ── LEFT: Login Card ── */}
                <div className="lp-left">
                    <div className="lp-card">
                        {/* Logo */}
                        <div className="lp-logo">
                            <div className="lp-logo-icon">
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#10b981"/>
                                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#10b981" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </div>
                            <span className="lp-logo-text">WorkSphere</span>
                        </div>

                        <h2 className="lp-title">Welcome back</h2>
                        <p className="lp-subtitle">Sign in to your HRMS dashboard</p>

                        <form onSubmit={handleLogin} className="lp-form">
                            {/* Email */}
                            <div className="lp-field">
                                <label className="lp-label">Email address</label>
                                <div className="lp-input-wrap">
                                    <span className="lp-input-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                            <polyline points="22,6 12,13 2,6"/>
                                        </svg>
                                    </span>
                                    <input
                                        className="lp-input"
                                        type="email"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="lp-field">
                                <label className="lp-label">Password</label>
                                <div className="lp-input-wrap">
                                    <span className="lp-input-icon">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                        </svg>
                                    </span>
                                    <input
                                        className="lp-input lp-input-pass"
                                        type={showPass ? "text" : "password"}
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        className="lp-eye-btn"
                                        onClick={() => setShowPass(!showPass)}
                                        tabIndex={-1}
                                    >
                                        {showPass ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                                                <line x1="1" y1="1" x2="23" y2="23"/>
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                <circle cx="12" cy="12" r="3"/>
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="lp-error">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="12" y1="8" x2="12" y2="12"/>
                                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                                    </svg>
                                    {error}
                                </div>
                            )}

                            <button
                                className="lp-btn"
                                type="submit"
                                disabled={loading || !email || !password}
                            >
                                {loading ? (
                                    <span className="lp-spinner" />
                                ) : (
                                    <>
                                        Sign In
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="5" y1="12" x2="19" y2="12"/>
                                            <polyline points="12 5 19 12 12 19"/>
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="lp-note">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                            </svg>
                            Authorized personnel only
                        </p>
                    </div>
                </div>

                {/* ── RIGHT: Branding Panel ── */}
                <div className="lp-right">
                    <div className="lp-brand">
                        <div className="lp-brand-badge">HRMS Platform</div>
                        <h1 className="lp-brand-title">
                            Manage your<br />
                            <span className="lp-brand-accent">workforce</span><br />
                            smarter.
                        </h1>
                        <p className="lp-brand-desc">
                            All-in-one solution for attendance, payroll, leaves &amp; employee management.
                        </p>

                        <div className="lp-features">
                            {[
                                { icon: "👥", label: "Employee Management" },
                                { icon: "📅", label: "Attendance Tracking" },
                                { icon: "💰", label: "Payroll & Advances" },
                                { icon: "📊", label: "Analytics & Reports" },
                            ].map((f) => (
                                <div className="lp-feature-chip" key={f.label}>
                                    <span>{f.icon}</span>
                                    <span>{f.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="lp-stats">
                            {[
                                { val: "99.9%", lbl: "Uptime" },
                                { val: "2 Roles", lbl: "Admin & Manager" },
                                { val: "Real-time", lbl: "Attendance" },
                            ].map((s) => (
                                <div className="lp-stat" key={s.lbl}>
                                    <span className="lp-stat-val">{s.val}</span>
                                    <span className="lp-stat-lbl">{s.lbl}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
