import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Flex, Spinner, Text } from "@chakra-ui/react";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <Flex h="100vh" align="center" justify="center" direction="column" gap={3} bg="#f7f9fc">
                <Spinner size="xl" color="#065f46" thickness="3px" speed="0.65s" />
                <Text fontSize="sm" color="gray.500">Loading...</Text>
            </Flex>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
