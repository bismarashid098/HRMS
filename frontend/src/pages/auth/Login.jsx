
import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect, useRef } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

const StarCanvas = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let animationId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resize();
        window.addEventListener("resize", resize);

        const stars = Array.from({ length: 220 }, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: Math.random() * 1.5 + 0.3,
            alpha: Math.random(),
            speed: Math.random() * 0.3 + 0.05,
            drift: (Math.random() - 0.5) * 0.2,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            stars.forEach((s) => {
                s.y -= s.speed;
                s.x += s.drift;

                if (s.y < 0) {
                    s.y = canvas.height;
                    s.x = Math.random() * canvas.width;
                }

                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
                ctx.fill();
            });

            animationId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 0,
            }}
        />
    );
};

const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [forgotOpen, setForgotOpen] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotSuccess, setForgotSuccess] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            const { data } = await api.post("/auth/login", {
                email,
                password,
            });

            login(data, data.token);
            navigate("/dashboard");
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Login failed. Please check credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();

        setTimeout(() => {
            setForgotSuccess(true);
        }, 1200);
    };

    const styles = {
        root: {
            minHeight: "100vh",
            overflow: "hidden",
            position: "relative",
            background:
                "radial-gradient(circle at top left, #18213b 0%, transparent 40%), radial-gradient(circle at bottom right, #0f172a 0%, transparent 40%), #020617",
            color: "white",
            fontFamily: "Inter, sans-serif",
        },

        blob1: {
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "#10b981",
            filter: "blur(120px)",
            top: -80,
            left: -80,
            opacity: 0.2,
        },

        blob2: {
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "#06b6d4",
            filter: "blur(120px)",
            bottom: -80,
            right: -80,
            opacity: 0.2,
        },

        container: {
            position: "relative",
            zIndex: 2,
            display: "grid",
            gridTemplateColumns: window.innerWidth < 950 ? "1fr" : "1fr 1fr",
            minHeight: "100vh",
        },

        left: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 30,
        },

        card: {
            width: "100%",
            maxWidth: 460,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
            borderRadius: 30,
            padding: 40,
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
            animation: "fadeUp 0.7s ease",
        },

        logo: {
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 28,
        },

        logoIcon: {
            width: 46,
            height: 46,
            borderRadius: 14,
            background: "linear-gradient(135deg,#10b981,#06b6d4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: 20,
        },

        title: {
            fontSize: 42,
            fontWeight: 800,
            marginBottom: 10,
        },

        subtitle: {
            color: "rgba(255,255,255,0.7)",
            marginBottom: 30,
            lineHeight: 1.6,
        },

        form: {
            display: "flex",
            flexDirection: "column",
            gap: 22,
        },

        field: {
            display: "flex",
            flexDirection: "column",
            gap: 10,
        },

        input: {
            height: 56,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.06)",
            padding: "0 18px",
            color: "white",
            fontSize: 15,
            outline: "none",
        },

        passWrap: {
            position: "relative",
        },

        eyeBtn: {
            position: "absolute",
            right: 16,
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            color: "white",
            cursor: "pointer",
            fontSize: 18,
        },

        options: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 14,
        },

        forgotBtn: {
            border: "none",
            background: "transparent",
            color: "#10b981",
            cursor: "pointer",
            fontWeight: 600,
        },

        button: {
            height: 58,
            border: "none",
            borderRadius: 18,
            background: "linear-gradient(135deg,#10b981,#06b6d4)",
            color: "white",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
        },

        error: {
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.2)",
            padding: 14,
            borderRadius: 14,
            color: "#fca5a5",
        },

        right: {
            display: window.innerWidth < 950 ? "none" : "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 60,
        },

        brandTitle: {
            fontSize: 68,
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 24,
        },

        featureGrid: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            marginTop: 40,
        },

        featureCard: {
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 22,
            padding: 24,
            backdropFilter: "blur(10px)",
        },

        modalOverlay: {
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
        },

        modal: {
            width: "100%",
            maxWidth: 420,
            background: "#0f172a",
            borderRadius: 28,
            padding: 40,
            border: "1px solid rgba(255,255,255,0.08)",
        },
    };

    return (
        <>
            <style>
                {`
                    @keyframes fadeUp {
                        from {
                            opacity: 0;
                            transform: translateY(30px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}
            </style>

            <div style={styles.root}>
                <StarCanvas />

                <div style={styles.blob1}></div>
                <div style={styles.blob2}></div>

                {forgotOpen && (
                    <div
                        style={styles.modalOverlay}
                        onClick={() => setForgotOpen(false)}
                    >
                        <div
                            style={styles.modal}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {!forgotSuccess ? (
                                <>
                                    <h2 style={{ marginBottom: 10 }}>
                                        Forgot Password
                                    </h2>

                                    <p
                                        style={{
                                            color: "rgba(255,255,255,0.7)",
                                            marginBottom: 24,
                                        }}
                                    >
                                        Enter your email to receive reset link.
                                    </p>

                                    <form onSubmit={handleForgotPassword}>
                                        <input
                                            type="email"
                                            placeholder="Enter email"
                                            value={forgotEmail}
                                            onChange={(e) =>
                                                setForgotEmail(e.target.value)
                                            }
                                            style={{
                                                ...styles.input,
                                                width: "100%",
                                                marginBottom: 20,
                                            }}
                                            required
                                        />

                                        <button
                                            type="submit"
                                            style={{
                                                ...styles.button,
                                                width: "100%",
                                            }}
                                        >
                                            Send Reset Link
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div style={{ textAlign: "center" }}>
                                    <div
                                        style={{
                                            fontSize: 54,
                                            marginBottom: 20,
                                        }}
                                    >
                                        ✅
                                    </div>

                                    <h2>Email Sent</h2>

                                    <p
                                        style={{
                                            color: "rgba(255,255,255,0.7)",
                                            marginTop: 12,
                                        }}
                                    >
                                        Please check your inbox.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div style={styles.container}>
                    <div style={styles.left}>
                        <div style={styles.card}>
                            <div style={styles.logo}>
                                <div style={styles.logoIcon}>W</div>

                                <h2>WorkSphere</h2>
                            </div>

                            <h1 style={styles.title}>Welcome Back</h1>

                            <p style={styles.subtitle}>
                                Sign in to continue managing your workforce.
                            </p>

                            <form
                                onSubmit={handleLogin}
                                style={styles.form}
                            >
                                <div style={styles.field}>
                                    <label>Email Address</label>

                                    <input
                                        type="email"
                                        placeholder="you@company.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        style={styles.input}
                                        required
                                    />
                                </div>

                                <div style={styles.field}>
                                    <label>Password</label>

                                    <div style={styles.passWrap}>
                                        <input
                                            type={showPass ? "text" : "password"}
                                            placeholder="Enter password"
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
                                            style={{
                                                ...styles.input,
                                                width: "100%",
                                            }}
                                            required
                                        />

                                        <button
                                            type="button"
                                            style={styles.eyeBtn}
                                            onClick={() =>
                                                setShowPass(!showPass)
                                            }
                                        >
                                            {showPass ? "🙈" : "👁️"}
                                        </button>
                                    </div>
                                </div>

                                <div style={styles.options}>
                                    <label>
                                        <input type="checkbox" /> Remember me
                                    </label>

                                    <button
                                        type="button"
                                        style={styles.forgotBtn}
                                        onClick={() => setForgotOpen(true)}
                                    >
                                        Forgot Password?
                                    </button>
                                </div>

                                {error && (
                                    <div style={styles.error}>{error}</div>
                                )}

                                <button
                                    type="submit"
                                    style={styles.button}
                                    disabled={loading}
                                >
                                    {loading ? "Signing In..." : "Sign In"}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div style={styles.right}>
                        <h1 style={styles.brandTitle}>
                            Manage your
                            <br />
                            workforce smarter.
                        </h1>

                        <p
                            style={{
                                color: "rgba(255,255,255,0.7)",
                                lineHeight: 1.8,
                                maxWidth: 600,
                            }}
                        >
                            Powerful all-in-one HRMS solution for attendance,
                            payroll, employee management and analytics.
                        </p>

                        <div style={styles.featureGrid}>
                            {[
                                "👥 Employee Management",
                                "📅 Attendance Tracking",
                                "💰 Payroll System",
                                "📊 Analytics & Reports",
                            ].map((item) => (
                                <div key={item} style={styles.featureCard}>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;