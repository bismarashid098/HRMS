import { createContext, useState, useEffect, useRef } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

const getStoredUser = () => {
    try {
        const stored = localStorage.getItem("user");
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(getStoredUser);
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [loading, setLoading] = useState(true);
    const skipVerifyRef = useRef(false);

    const logout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setToken("");
    };

    useEffect(() => {
        const verifyUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            // Login already returns fresh user data — skip redundant verify
            if (skipVerifyRef.current) {
                skipVerifyRef.current = false;
                setLoading(false);
                return;
            }
            try {
                const { data } = await api.get("/auth/verify");
                setUser(data);
                localStorage.setItem("user", JSON.stringify(data));
            } catch {
                logout();
            } finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, [token]);

    const login = (userData, authToken) => {
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", authToken);
        setUser(userData);
        skipVerifyRef.current = true; // token change will trigger useEffect — skip it
        setToken(authToken);
    };

    const updateUserProfile = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!user,
                user,
                login,
                logout,
                updateUserProfile,
                loading
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
