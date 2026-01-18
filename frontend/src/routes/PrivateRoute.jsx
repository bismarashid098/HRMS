import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return null;

    return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
