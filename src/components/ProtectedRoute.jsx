import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";
import { useAuth } from "../providers/AuthProvider.jsx";

/**
 * Gate for private pages.
 * - waits for auth to load
 * - if not logged in → redirect to /login (keeps "from" in state)
 * - optional roles check (not used yet)
 */
const ProtectedRoute = ({ children, roles }) => {
    const location = useLocation();
    const { ready, user } = useAuth();

    // first load → show a small spinner
    if (!ready) {
        return (
            <Center py={16}>
                <Spinner thickness="3px" />
            </Center>
        );
    }

    // not logged in
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // optional role check
    if (roles && Array.isArray(roles) && !roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
