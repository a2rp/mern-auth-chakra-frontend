// App shell + routes (Profile is protected)
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Flex,
    HStack,
    Heading,
    Spacer,
    Text,
    Button,
    VStack,
} from "@chakra-ui/react";

import Register from "./pages/register";
import Login from "./pages/login";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Dashboard from "./pages/dashboard";
import Admin from "./pages/admin";
import Profile from "./pages/profile"; // <-- new
import { useAuth } from "./providers/AuthProvider.jsx";
import React from "react";
import Home from "./pages/home/index.jsx";
import styled from "styled-components";

function App() {
    return (
        <Styled.Wrapper>
            <Box minH="100dvh" bg="chakra-body-bg">
                <Header />
                {/* <Container maxW="container.md" py={8} style={{ border: "0px solid #00f" }}> */}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />

                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* new: profile route (auth required) */}
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute roles={["admin"]}>
                                <Admin />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<NotFound />} />
                </Routes>
                {/* </Container> */}
            </Box>
        </Styled.Wrapper >
    );
}

function Header() {
    const navigate = useNavigate();
    const { user, logout, loading } = useAuth();

    const [confirmOpen, setConfirmOpen] = React.useState(false);

    React.useEffect(() => {
        if (!confirmOpen) return;
        const onKey = (e) => e.key === "Escape" && setConfirmOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [confirmOpen]);

    return (
        <>
            <Box
                borderBottomWidth="1px"
                borderColor="gray.300"
                position="sticky"
                top="0"
                zIndex="10"
                bg="chakra-body-bg"
            >
                <Container maxW="container.md" py={3}>
                    <Flex align="center" gap={4}>
                        {/* <Heading size="md">
                            <Link to="/">MERN Auth + Chakra UI</Link>
                        </Heading> */}

                        <HStack as="nav" spacing={4}>
                            <Nav to="/">Home</Nav>
                            {user && <Nav to="/dashboard">Dashboard</Nav>}
                            {user?.role === "admin" && <Nav to="/admin">Admin</Nav>}
                        </HStack>

                        <Spacer />

                        {!user ? (
                            <HStack spacing={3}>
                                <Nav to="/register">Register</Nav>
                                <Nav to="/login">Login</Nav>
                            </HStack>
                        ) : (
                            <HStack spacing={3}>
                                <Text fontSize="sm">
                                    Hi, <b>{user.name}</b>
                                </Text>
                                <Button size="sm" variant="outline" onClick={() => navigate("/profile")}>
                                    Profile
                                </Button>
                                <Button size="sm" colorScheme="red" onClick={() => setConfirmOpen(true)}>
                                    Logout
                                </Button>
                            </HStack>
                        )}
                    </Flex>
                </Container>
            </Box>

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
                        <VStack align="stretch" spacing={4}>
                            <Heading size="md">Log out?</Heading>
                            <Text>You'll be signed out of your account.</Text>

                            <HStack justify="flex-end" spacing={3}>
                                <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    colorScheme="red"
                                    isLoading={loading}
                                    onClick={async () => {
                                        await logout();
                                        setConfirmOpen(false);
                                        navigate("/");
                                    }}
                                >
                                    Yes, logout
                                </Button>
                            </HStack>
                        </VStack>
                    </Box>
                </Box>
            )}
        </>
    );
}

function Nav({ to, children }) {
    return (
        <NavLink
            to={to}
            style={({ isActive }) => ({
                padding: "4px 8px",
                borderRadius: 6,
                textDecoration: "none",
                color: "inherit",
                border: isActive ? "1px solid currentColor" : "1px solid transparent",
            })}
        >
            {children}
        </NavLink>
    );
}

function NotFound() {
    return (
        <Box>
            <Heading size="lg" mb={3}>
                Not found
            </Heading>
            <Text>Check the URL.</Text>
        </Box>
    );
}

export default App;

const Styled = {
    Wrapper: styled.div`
        /* border: 1px solid #f00; */
        max-width: 1440px;
        display: flex;
        justify-content: center;
        margin: 0 auto;
    `,
};

