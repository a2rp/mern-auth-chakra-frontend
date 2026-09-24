import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Heading,
    Text,
    HStack,
    Button,
    Alert,
    AlertIcon,
} from "@chakra-ui/react";
import { useAuth } from "../../providers/AuthProvider.jsx";
import { Styled } from "./styled"; // ← add this import

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, error, setError, logout } = useAuth();

    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => { setError?.(null); }, [setError]);

    useEffect(() => {
        if (!confirmOpen) return;
        const onKey = (e) => e.key === "Escape" && setConfirmOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [confirmOpen]);

    async function confirmLogout() {
        try {
            await logout();
            setConfirmOpen(false);
            navigate("/login");
        } catch { return; }
    }

    return (
        <>
            <Styled.Wrapper>
                <Box>
                    <Heading size="lg" mb={2}>Dashboard</Heading>

                    {error && (
                        <Alert status="error" mb={4}>
                            <AlertIcon />
                            {error}
                        </Alert>
                    )}

                    <Text color="gray.600" mb={6}>
                        Signed in as <b>{user?.name}</b> ({user?.email})
                    </Text>

                    <HStack spacing={3}>
                        <Button onClick={() => navigate("/profile")} variant="outline">
                            View profile
                        </Button>
                        {user?.role === "admin" && (
                            <Button onClick={() => navigate("/admin")} variant="outline">
                                Admin area
                            </Button>
                        )}
                        <Button colorScheme="red" onClick={() => setConfirmOpen(true)}>
                            Logout
                        </Button>
                    </HStack>
                </Box>
            </Styled.Wrapper>

            {confirmOpen && (
                <Box
                    position="fixed"
                    inset="0"
                    bg="blackAlpha.600"
                    zIndex="1000"
                    onClick={() => setConfirmOpen(false)}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    px={4}
                >
                    <Box
                        role="dialog"
                        aria-modal="true"
                        onClick={(e) => e.stopPropagation()}
                        bg="white"
                        _dark={{ bg: "gray.800" }}
                        borderRadius="md"
                        boxShadow="lg"
                        maxW="sm"
                        w="100%"
                        p={5}
                    >
                        <Heading size="md" mb={2}>Log out?</Heading>
                        <Text color="gray.600" mb={5}>
                            You’ll need to sign in again to access your dashboard.
                        </Text>
                        <HStack justify="flex-end" spacing={3}>
                            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
                            <Button colorScheme="red" onClick={confirmLogout}>Logout</Button>
                        </HStack>
                    </Box>
                </Box>
            )}
        </>
    );
};

export default Dashboard;
