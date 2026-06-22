import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";

const BUBBLES = [
  { size: 80,  left: "5%",  dur: 12,   delay: 0,    color: "rgba(16,185,129,0.18)",  border: "rgba(16,185,129,0.35)"  },
  { size: 50,  left: "15%", dur: 9,    delay: 2,    color: "rgba(59,130,246,0.14)",  border: "rgba(59,130,246,0.28)"  },
  { size: 120, left: "25%", dur: 15,   delay: 4,    color: "rgba(139,92,246,0.1)",   border: "rgba(139,92,246,0.22)"  },
  { size: 40,  left: "35%", dur: 8,    delay: 1,    color: "rgba(16,185,129,0.14)",  border: "rgba(16,185,129,0.3)"   },
  { size: 90,  left: "45%", dur: 13,   delay: 6,    color: "rgba(6,182,212,0.12)",   border: "rgba(6,182,212,0.25)"   },
  { size: 60,  left: "55%", dur: 10,   delay: 3,    color: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.24)"  },
  { size: 100, left: "65%", dur: 16,   delay: 7,    color: "rgba(16,185,129,0.1)",   border: "rgba(16,185,129,0.22)"  },
  { size: 45,  left: "75%", dur: 11,   delay: 2.5,  color: "rgba(139,92,246,0.14)",  border: "rgba(139,92,246,0.28)"  },
  { size: 70,  left: "82%", dur: 14,   delay: 5,    color: "rgba(6,182,212,0.14)",   border: "rgba(6,182,212,0.28)"   },
  { size: 35,  left: "90%", dur: 7,    delay: 1.5,  color: "rgba(16,185,129,0.18)",  border: "rgba(16,185,129,0.35)"  },
  { size: 55,  left: "10%", dur: 11,   delay: 8,    color: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.24)"  },
  { size: 85,  left: "70%", dur: 18,   delay: 9,    color: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.18)"  },
  { size: 30,  left: "48%", dur: 7.5,  delay: 3.5,  color: "rgba(16,185,129,0.2)",   border: "rgba(16,185,129,0.38)"  },
  { size: 65,  left: "30%", dur: 19,   delay: 11,   color: "rgba(6,182,212,0.1)",    border: "rgba(6,182,212,0.22)"   },
  { size: 75,  left: "88%", dur: 12.5, delay: 0.5,  color: "rgba(59,130,246,0.1)",   border: "rgba(59,130,246,0.22)"  },
];

const FEATURES = [
  { icon: "👥", title: "Employee Management",  desc: "Complete profiles & records" },
  { icon: "📅", title: "Attendance Tracking",  desc: "Real-time punch in/out"       },
  { icon: "💰", title: "Payroll System",        desc: "Automated salary processing" },
  { icon: "📊", title: "Analytics & Reports",  desc: "Insights & data export"      },
];

const STATS = [
  { value: "Real-time", label: "Data Sync"   },
  { value: "2 Roles",   label: "Access Ctrl" },
  { value: "Secure",    label: "JWT Auth"    },
];

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [showPass,     setShowPass]     = useState(false);
  const [forgotOpen,   setForgotOpen]   = useState(false);
  const [forgotEmail,  setForgotEmail]  = useState("");
  const [forgotSent,   setForgotSent]   = useState(false);
  const [isMobile,     setIsMobile]     = useState(window.innerWidth < 960);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 960);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data, data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = (e) => {
    e.preventDefault();
    setTimeout(() => setForgotSent(true), 1000);
  };

  return (
    <>
      <style>{`
        @keyframes bubbleRise {
          0%   { transform: translateY(110vh) scale(0.8); opacity: 0; }
          6%   { opacity: 1; }
          92%  { opacity: 0.75; }
          100% { transform: translateY(-20vh) scale(1.15); opacity: 0; }
        }
        @keyframes loginFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .login-input {
          width: 100%;
          height: 52px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.04);
          padding: 0 48px 0 18px;
          color: #e2e8f0;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
          font-family: inherit;
        }
        .login-input::placeholder { color: rgba(148,163,184,0.6); }
        .login-input:focus {
          border-color: rgba(16,185,129,0.7) !important;
          background: rgba(16,185,129,0.05) !important;
          box-shadow: 0 0 0 3px rgba(16,185,129,0.12) !important;
        }
        .login-input:-webkit-autofill,
        .login-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #0a1f35 inset !important;
          -webkit-text-fill-color: #e2e8f0 !important;
        }
        .login-btn {
          width: 100%;
          height: 54px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(16,185,129,0.35);
          transition: opacity 0.2s, transform 0.2s, box-shadow 0.2s;
          font-family: inherit;
          position: relative;
          overflow: hidden;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(16,185,129,0.45);
        }
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .login-check { accent-color: #10b981; }
        .feat-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px;
          padding: 18px;
          transition: background 0.2s;
        }
        .feat-card:hover { background: rgba(255,255,255,0.08); }
      `}</style>

      {/* ROOT */}
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#020c1b 0%,#061828 45%,#082035 75%,#030e1c 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "Inter, system-ui, sans-serif",
      }}>

        {/* ── BUBBLES ── */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
          {BUBBLES.map((b, i) => (
            <div key={i} style={{
              position: "absolute",
              width:  b.size,
              height: b.size,
              left:   b.left,
              bottom: "-120px",
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 35%, ${b.color} 0%, transparent 65%)`,
              border: `1px solid ${b.border}`,
              animation: `bubbleRise ${b.dur}s ease-in ${b.delay}s infinite`,
              backdropFilter: "blur(2px)",
            }} />
          ))}
        </div>

        {/* ── GRID ── */}
        <div style={{
          position: "relative",
          zIndex: 2,
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          minHeight: "100vh",
        }}>

          {/* ══ LEFT: LOGIN CARD ══ */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
            <div style={{
              width: "100%",
              maxWidth: 460,
              background: "rgba(8,18,32,0.92)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 24,
              padding: 40,
              boxShadow: "0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
              animation: "loginFadeUp 0.7s ease",
            }}>

              {/* Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <div style={{
                  width: 46, height: 46, borderRadius: 14,
                  background: "linear-gradient(135deg,#10b981,#059669)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: "900", fontSize: 20, color: "white",
                  boxShadow: "0 4px 16px rgba(16,185,129,0.4)",
                }}>W</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", letterSpacing: "-0.02em" }}>WorkSphere</div>
                  <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>HRMS Platform</div>
                </div>
              </div>

              {/* Title */}
              <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f0f4ff", marginBottom: 8, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                Welcome Back
              </h1>
              <p style={{ color: "#64748b", marginBottom: 32, lineHeight: 1.65, fontSize: 14 }}>
                Sign in to continue managing your workforce.
              </p>

              {/* Form */}
              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                {/* Email */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.02em" }}>Email Address</label>
                  <input
                    type="email" placeholder="you@company.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="login-input" required
                    style={{ paddingLeft: 18 }}
                  />
                </div>

                {/* Password */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.02em" }}>Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="Enter password"
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      className="login-input" required
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{
                      position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                      background: "transparent", border: "none", color: "#64748b",
                      cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center",
                      padding: 0,
                    }}>
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Options */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#64748b" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <input type="checkbox" className="login-check" />
                    <span>Remember me</span>
                  </label>
                  <button type="button" onClick={() => setForgotOpen(true)}
                    style={{ border: "none", background: "transparent", color: "#10b981", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>
                    Forgot Password?
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
                    padding: "12px 16px", borderRadius: 12, color: "#f87171", fontSize: 13,
                  }}>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? "Signing In…" : "Sign In →"}
                </button>
              </form>
            </div>
          </div>

          {/* ══ RIGHT: BRAND PANEL ══ */}
          {!isMobile && (
            <div style={{
              display: "flex", flexDirection: "column", justifyContent: "center",
              padding: "60px 56px",
              background: "linear-gradient(135deg,rgba(16,185,129,0.06) 0%,rgba(59,130,246,0.04) 100%)",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              color: "white",
            }}>

              {/* Brand logo row */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 36 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: "linear-gradient(135deg,#10b981,#059669)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: "900", fontSize: 24, color: "white",
                  boxShadow: "0 8px 24px rgba(16,185,129,0.4)",
                }}>W</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#e2e8f0", letterSpacing: "-0.03em" }}>WorkSphere</div>
                  <div style={{ fontSize: 11, color: "#10b981", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>HRMS Platform</div>
                </div>
              </div>

              <h1 style={{ fontSize: 46, fontWeight: 800, lineHeight: 1.15, marginBottom: 20, color: "#f0f4ff", letterSpacing: "-0.03em" }}>
                Manage your<br />
                <span style={{ color: "#10b981" }}>workforce</span> smarter.
              </h1>

              <p style={{ color: "rgba(148,163,184,0.85)", lineHeight: 1.75, maxWidth: 440, fontSize: 15, marginBottom: 40 }}>
                All-in-one HRMS solution — attendance, payroll, leave management, and deep analytics in one platform.
              </p>

              {/* Feature Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 40 }}>
                {FEATURES.map((f) => (
                  <div key={f.title} className="feat-card">
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{f.title}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{f.desc}</div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 20 }}>
                {STATS.map((s) => (
                  <div key={s.label} style={{
                    flex: 1, textAlign: "center",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 14, padding: "14px 10px",
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#10b981", marginBottom: 4 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: "0.06em" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── FORGOT PASSWORD MODAL ── */}
        {forgotOpen && (
          <div onClick={() => { setForgotOpen(false); setForgotSent(false); setForgotEmail(""); }}
            style={{
              position: "fixed", inset: 0, background: "rgba(2,12,27,0.75)",
              backdropFilter: "blur(6px)", display: "flex", alignItems: "center",
              justifyContent: "center", zIndex: 9999,
            }}>
            <div onClick={(e) => e.stopPropagation()} style={{
              width: "100%", maxWidth: 420,
              background: "rgba(8,18,32,0.95)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 24, padding: 40,
              boxShadow: "0 30px 80px rgba(0,0,0,0.7)",
            }}>
              {!forgotSent ? (
                <>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>Forgot Password</h2>
                  <p style={{ color: "#64748b", marginBottom: 24, fontSize: 14 }}>Enter your email to receive a reset link.</p>
                  <form onSubmit={handleForgot}>
                    <input
                      type="email" placeholder="Enter your email"
                      value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                      className="login-input" required
                      style={{ marginBottom: 20, paddingLeft: 18 }}
                    />
                    <button type="submit" className="login-btn">Send Reset Link</button>
                  </form>
                </>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 52, marginBottom: 18 }}>✅</div>
                  <h2 style={{ color: "#e2e8f0", marginBottom: 10 }}>Email Sent</h2>
                  <p style={{ color: "#64748b", fontSize: 14 }}>Please check your inbox for the reset link.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Login;
