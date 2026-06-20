
import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

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
            background: "linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 40%, #F8FAFC 100%)",
            color: "#0F172A",
            fontFamily: "Inter, system-ui, sans-serif",
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
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: 24,
            padding: 40,
            boxShadow: "0 10px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
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
            background: "linear-gradient(135deg, #0891B2, #0EA5E9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: 20,
            color: "white",
        },

        logoText: {
            fontSize: 20,
            fontWeight: 700,
            color: "#0F172A",
        },

        title: {
            fontSize: 36,
            fontWeight: 800,
            marginBottom: 10,
            color: "#0F172A",
        },

        subtitle: {
            color: "#64748B",
            marginBottom: 30,
            lineHeight: 1.6,
            fontSize: 15,
        },

        form: {
            display: "flex",
            flexDirection: "column",
            gap: 20,
        },

        field: {
            display: "flex",
            flexDirection: "column",
            gap: 8,
        },

        label: {
            fontSize: 14,
            fontWeight: 600,
            color: "#334155",
        },

        input: {
            height: 52,
            borderRadius: 12,
            border: "1px solid #E2E8F0",
            background: "#F8FAFC",
            padding: "0 18px",
            color: "#0F172A",
            fontSize: 15,
            outline: "none",
            transition: "border-color 0.2s",
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
            color: "#64748B",
            cursor: "pointer",
            fontSize: 18,
        },

        options: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 14,
            color: "#334155",
        },

        forgotBtn: {
            border: "none",
            background: "transparent",
            color: "#0891B2",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 14,
        },

        button: {
            height: 54,
            border: "none",
            borderRadius: 14,
            background: "linear-gradient(135deg, #0891B2, #0EA5E9)",
            color: "white",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(8,145,178,0.3)",
            transition: "opacity 0.2s",
        },

        error: {
            background: "#FEE2E2",
            border: "1px solid #FECACA",
            padding: 14,
            borderRadius: 12,
            color: "#DC2626",
            fontSize: 14,
        },

        right: {
            display: window.innerWidth < 950 ? "none" : "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: 60,
            background: "linear-gradient(135deg, #0891B2, #0EA5E9)",
            color: "white",
        },

        brandTitle: {
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 24,
            color: "white",
        },

        brandSubtitle: {
            color: "rgba(255,255,255,0.85)",
            lineHeight: 1.8,
            maxWidth: 480,
            fontSize: 16,
        },

        featureGrid: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginTop: 40,
        },

        featureCard: {
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 18,
            padding: 20,
            color: "white",
            fontSize: 14,
            fontWeight: 500,
        },

        modalOverlay: {
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
        },

        modal: {
            width: "100%",
            maxWidth: 420,
            background: "white",
            borderRadius: 24,
            padding: 40,
            border: "1px solid #E2E8F0",
            boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
        },

        modalTitle: {
            fontSize: 22,
            fontWeight: 700,
            color: "#0F172A",
            marginBottom: 8,
        },

        modalSub: {
            color: "#64748B",
            marginBottom: 24,
            fontSize: 14,
        },
    };

    return (
        <>
            <style>
                {`
                    @keyframes fadeUp {
                        from {
                            opacity: 0;
                            transform: translateY(24px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    input:focus {
                        border-color: #0891B2 !important;
                        box-shadow: 0 0 0 3px rgba(8,145,178,0.1);
                    }
                `}
            </style>

            <div style={styles.root}>
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
                                    <h2 style={styles.modalTitle}>
                                        Forgot Password
                                    </h2>

                                    <p style={styles.modalSub}>
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
                                                boxSizing: "border-box",
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

                                    <h2 style={{ color: "#0F172A" }}>Email Sent</h2>

                                    <p
                                        style={{
                                            color: "#64748B",
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
                                <span style={styles.logoText}>WorkSphere</span>
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
                                    <label style={styles.label}>Email Address</label>

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
                                    <label style={styles.label}>Password</label>

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
                                                boxSizing: "border-box",
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
                                    <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
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

                        <p style={styles.brandSubtitle}>
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
