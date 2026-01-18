import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 🔹 On app load (refresh survive)
    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (token && role) {
            setUser({
                token,
                role, // accounts | manager (future)
            });
        }

        setLoading(false);
    }, []);

    // 🔹 LOGIN (Accounts default)
    const login = (token, role = "accounts") => {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        setUser({
            token,
            role,
        });

        navigate("/");
    };

    // 🔹 LOGOUT
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        setUser(null);
        navigate("/login");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                loading,
                isAccounts: user?.role === "accounts",
                isManager: user?.role === "manager",
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
