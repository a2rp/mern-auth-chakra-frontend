import { useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { Box, Button, Container, Flex, Heading, HStack, IconButton, Text, VStack } from "@chakra-ui/react";
import { FaCode, FaCodepen, FaCoffee, FaFacebook, FaGithub, FaHeart, FaLinkedin, FaMailBulk, FaPatreon, FaYoutube } from "react-icons/fa";
import { FiArrowUp, FiBookOpen, FiHome, FiLogIn, FiMenu, FiShield, FiUserPlus, FiX } from "react-icons/fi";
import Register from "./pages/register";
import Login from "./pages/login";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Dashboard from "./pages/dashboard";
import Admin from "./pages/admin";
import Profile from "./pages/profile";
import { useAuth } from "./providers/AuthProvider.jsx";
import Home from "./pages/home/index.jsx";
import styled from "styled-components";

const footerLinks = [
    { label: "Portfolio", href: "https://www.ashishranjan.net/", icon: <FaCode /> },
    { label: "GitHub", href: "https://github.com/a2rp", icon: <FaGithub /> },
    { label: "CodePen", href: "https://codepen.io/ash1198", icon: <FaCodepen /> },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/aashishranjan", icon: <FaLinkedin /> },
    { label: "Facebook", href: "https://www.facebook.com/theash.ashish/", icon: <FaFacebook /> },
    { label: "YouTube", href: "https://www.youtube.com/@ashishranjan-ashz?sub_confirmation=1", icon: <FaYoutube /> },
    { label: "Email", href: "mailto:ash.ranjan09@gmail.com", icon: <FaMailBulk /> },
    { label: "Support", href: "https://a2rp-donation-page.netlify.app/", icon: <FaHeart /> },
    { label: "Buy Me a Coffee", href: "https://buymeacoffee.com/a2rp", icon: <FaCoffee /> },
    { label: "Patreon", href: "https://patreon.com/a2rp", icon: <FaPatreon /> },
];

const navLinks = [
    { to: "/", label: "Home", icon: <FiHome /> },
    { to: "/dashboard", label: "Dashboard", icon: <FiBookOpen />, auth: true },
];

function App() {
    const [showTopButton, setShowTopButton] = useState(false);
    useEffect(() => {
        const handleScroll = () => setShowTopButton(window.scrollY > 260);
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <Styled.Wrapper>
            <Header />
            <Box as="main" pt={{ base: 20, md: 24 }} pb={12}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><Admin /></ProtectedRoute>} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Box>
            <Footer />
            <IconButton aria-label="Go to top" icon={<FiArrowUp />} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} position="fixed" bottom={5} right={5} colorScheme="blue" borderRadius="full" opacity={showTopButton ? 1 : 0} pointerEvents={showTopButton ? "auto" : "none"} transform={showTopButton ? "translateY(0)" : "translateY(10px)"} transition="border-color 180ms ease, box-shadow 180ms ease, opacity 180ms ease, transform 180ms ease, text-shadow 180ms ease" zIndex={20} />
        </Styled.Wrapper>
    );
}

function Header() {
    const navigate = useNavigate();
    const { user, logout, loading } = useAuth();
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    useEffect(() => {
        if (!confirmOpen) return undefined;
        const onKey = (event) => event.key === "Escape" && setConfirmOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [confirmOpen]);
    const closeMenu = () => setMenuOpen(false);

    return (
        <>
            <Box as="header" position="fixed" top="0" left="0" right="0" zIndex="sticky" bg="gray.900" color="white" borderBottomWidth="1px" borderColor="gray.700" boxShadow="sm">
                <Container maxW="container.xl" py={3}>
                    <Flex align="center" justify="space-between" gap={4}>
                        <Link href="#top" display="inline-flex" alignItems="center" gap={3} onClick={closeMenu}>
                            <Box as="img" src={`${import.meta.env.BASE_URL}logo.png`} alt="Ashish Ranjan logo" boxSize="40px" borderRadius="md" bg="white" p={1} />
                            <Box display={{ base: "none", sm: "block" }}><Text fontSize="xs" color="blue.200" textTransform="uppercase" letterSpacing="0.12em">Cookie auth workspace</Text><Heading size="sm">MERN Auth</Heading></Box>
                        </Link>
                        <IconButton display={{ base: "inline-flex", md: "none" }} aria-label={menuOpen ? "Close menu" : "Open menu"} icon={menuOpen ? <FiX /> : <FiMenu />} variant="outline" color="white" borderColor="gray.600" onClick={() => setMenuOpen((open) => !open)} />
                        <Flex position={{ base: "absolute", md: "static" }} top={{ base: "72px", md: "auto" }} left={{ base: 0, md: "auto" }} right={{ base: 0, md: "auto" }} display={{ base: menuOpen ? "flex" : "none", md: "flex" }} direction={{ base: "column", md: "row" }} align={{ base: "stretch", md: "center" }} gap={3} bg={{ base: "gray.900", md: "transparent" }} borderBottomWidth={{ base: "1px", md: 0 }} borderColor="gray.700" p={{ base: 4, md: 0 }} flex={1} justify="flex-end">
                            <Flex as="nav" align={{ base: "stretch", md: "center" }} direction={{ base: "column", md: "row" }} gap={1} aria-label="Main navigation">
                                {navLinks.map(({ to, label, icon, auth }) => (auth && !user ? null : <Nav to={to} key={to} icon={icon} onClick={closeMenu}>{label}</Nav>))}
                                {user?.role === "admin" && <Nav to="/admin" icon={<FiShield />} onClick={closeMenu}>Admin</Nav>}
                            </Flex>
                            {!user ? <Flex gap={1} direction={{ base: "column", md: "row" }}><Nav to="/register" icon={<FiUserPlus />} onClick={closeMenu}>Register</Nav><Nav to="/login" icon={<FiLogIn />} onClick={closeMenu}>Login</Nav></Flex> : <Flex align="center" gap={2} direction={{ base: "column", md: "row" }}><Text fontSize="sm">Hi, <b>{user.name}</b></Text><Button size="sm" variant="outline" color="white" borderColor="gray.600" onClick={() => { navigate("/profile"); closeMenu(); }}>Profile</Button><Button size="sm" colorScheme="red" onClick={() => setConfirmOpen(true)}>Logout</Button></Flex>}
                        </Flex>
                    </Flex>
                </Container>
            </Box>
            {confirmOpen && <Box position="fixed" inset="0" bg="blackAlpha.600" zIndex="modal" onClick={() => setConfirmOpen(false)} display="flex" alignItems="center" justifyContent="center" px={4}><Box role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()} bg="white" _dark={{ bg: "gray.800" }} borderRadius="lg" boxShadow="lg" maxW="sm" w="100%" p={5}><VStack align="stretch" spacing={4}><Heading size="md">Log out?</Heading><Text>You will be signed out of your account.</Text><HStack justify="flex-end" spacing={3}><Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button><Button colorScheme="red" isLoading={loading} onClick={async () => { await logout(); setConfirmOpen(false); navigate("/"); }}>Yes, logout</Button></HStack></VStack></Box></Box>}
        </>
    );
}

function Nav({ to, children, icon, onClick }) {
    return <NavLink to={to} onClick={onClick} style={({ isActive }) => ({ alignItems: "center", border: `1px solid ${isActive ? "#6b93d1" : "transparent"}`, borderRadius: 8, color: "inherit", display: "inline-flex", gap: 6, padding: "8px 10px", textDecoration: "none", textShadow: isActive ? "0 1px 8px rgba(255, 255, 255, 0.2)" : "none" })}>{icon}{children}</NavLink>;
}

function Footer() {
    return <Box as="footer" borderTopWidth="1px" borderColor="gray.200" py={8} px={4}><Container maxW="container.xl"><Text fontSize="xs" color="blue.600" fontWeight="bold" letterSpacing="0.14em" textTransform="uppercase">A practical authentication workspace</Text><Text color="gray.600" mt={2}>Protected routes, cookie sessions, profiles and admin tools in one frontend.</Text><Flex gap={2} flexWrap="wrap" mt={5}>{footerLinks.map(({ label, href, icon }) => <IconButton key={label} as="a" href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} icon={icon} variant="outline" size="sm" borderRadius="md" />)}</Flex><Text borderTopWidth="1px" borderColor="gray.200" mt={6} pt={4} color="gray.500" fontSize="sm">Copyright © {new Date().getFullYear()} <Link href="https://www.ashishranjan.net" target="_blank" rel="noopener noreferrer" color="blue.600" fontWeight="bold">Ashish Ranjan</Link></Text></Container></Box>;
}

function NotFound() { return <Container maxW="container.md"><Heading size="lg" mb={3}>Page not found</Heading><Text color="gray.600">Check the URL and choose a link from the header.</Text></Container>; }

export default App;

const Styled = { Wrapper: styled.div`min-height: 100vh; max-width: 1440px; margin: 0 auto;` };