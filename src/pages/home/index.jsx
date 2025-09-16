import React from "react";
import {
    Box,
    Heading,
    Text,
    List,
    ListItem,
    ListIcon,
    Badge,
    Code,
    HStack,
    Button,
    Divider,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import {
    FiCheckCircle,
    FiLock,
    FiUser,
    FiSettings,
    FiShield,
} from "react-icons/fi";
import { Styled } from "./styled";

const Home = () => {
    return (
        <Styled.Wrapper>
            <Box>
                <Heading size="lg" mb={2}>
                    MERN Auth + Chakra UI
                </Heading>
                <Text color="gray.600" mb={6}>
                    Quick overview of how the app works.
                </Text>

                <div style={{ display: "flex", gap: "100px" }}>
                    <div style={{ width: "100%" }}>
                        <Heading size="md" mb={2}>
                            Auth flow
                        </Heading>
                        <List spacing={2} mb={6}>
                            <ListItem>
                                <ListIcon as={FiCheckCircle} color="green.500" />
                                Register/Login sets an <Badge>HttpOnly</Badge> cookie (no
                                localStorage).
                            </ListItem>
                            <ListItem>
                                <ListIcon as={FiCheckCircle} color="green.500" />
                                Frontend always sends <Code>credentials: "include"</Code> and asks{" "}
                                <Code>/api/auth/me</Code> who you are.
                            </ListItem>
                            <ListItem>
                                <ListIcon as={FiCheckCircle} color="green.500" />
                                Protected pages (Dashboard, Profile, Admin) go through{" "}
                                <Code>&lt;ProtectedRoute /&gt;</Code>.
                            </ListItem>
                            <ListItem>
                                <ListIcon as={FiCheckCircle} color="green.500" />
                                Logout clears the cookie; on Dashboard there’s a confirm dialog.
                            </ListItem>
                        </List>
                    </div>

                    <div style={{ width: "100%" }}>
                        <Heading size="md" mb={2}>
                            Profile
                        </Heading>
                        <List spacing={2} mb={6}>
                            <ListItem>
                                <ListIcon as={FiUser} color="blue.500" />
                                View name, email, role, and timestamps.
                            </ListItem>
                            <ListItem>
                                <ListIcon as={FiUser} color="blue.500" />
                                Edit name/email with validation and server-side unique email check.
                            </ListItem>
                            <ListItem>
                                <ListIcon as={FiLock} color="blue.500" />
                                Change password with strength rules: min 8, upper + lower + number +
                                special; can’t reuse current password.
                            </ListItem>
                        </List>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "100px" }}>
                    <div style={{ width: "100%" }}>
                        <Heading size="md" mb={2}>
                            Admin
                        </Heading>
                        <List spacing={2} mb={6}>
                            <ListItem>
                                <ListIcon as={FiSettings} color="purple.500" />
                                Users table with search, pagination, and header click sorting.
                            </ListItem>
                            <ListItem>
                                <ListIcon as={FiSettings} color="purple.500" />
                                Inline role change (Save/Cancel) + “Edit user” modal (name/email).
                            </ListItem>
                            <ListItem>
                                <ListIcon as={FiSettings} color="purple.500" />
                                “Add user” modal (temporary password). Server enforces strong
                                passwords and unique email.
                            </ListItem>
                        </List>
                    </div>

                    <div style={{ width: "100%" }}>
                        <Heading size="md" mb={2}>
                            Security notes
                        </Heading>
                        <List spacing={2} mb={6}>
                            <ListItem>
                                <ListIcon as={FiShield} color="teal.500" />
                                JWT in <Badge>HttpOnly</Badge> cookie with CORS for the frontend
                                origin.
                            </ListItem>
                            <ListItem>
                                <ListIcon as={FiShield} color="teal.500" />
                                No tokens in storage; app state comes from <Code>/auth/me</Code>.
                            </ListItem>
                            <ListItem>
                                <ListIcon as={FiShield} color="teal.500" />
                                Passwords hashed with bcrypt; strength validated on server + client.
                            </ListItem>
                        </List>
                    </div>
                </div>

                <Divider my={4} />

                <HStack spacing={3}>
                    <Button as={RouterLink} to="/register" colorScheme="blue">
                        Create account
                    </Button>
                    <Button as={RouterLink} to="/login" variant="outline">
                        Sign in
                    </Button>
                    <Button as={RouterLink} to="/dashboard" variant="ghost">
                        Dashboard
                    </Button>
                    <Button as={RouterLink} to="/admin" variant="ghost">
                        Admin
                    </Button>
                </HStack>
            </Box>
        </Styled.Wrapper>
    );
};

export default Home;
