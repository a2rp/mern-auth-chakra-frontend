import React, { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Box,
    Heading,
    VStack,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    FormErrorMessage,
    Button,
    Alert,
    AlertIcon,
    Link,
    Text,
    IconButton,
} from "@chakra-ui/react";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../providers/AuthProvider.jsx";
import { Styled } from "./styled";

// simple schema
const schema = z.object({
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Min 8 characters"),
});

const Login = () => {
    const navigate = useNavigate();
    const { login: doLogin, loading, error, setError } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: "", password: "" },
    });

    // clear any previous auth error when this page opens
    useEffect(() => {
        setError(null);
        // optional: also reset fields when arriving here
        // reset({ email: "", password: "" });
    }, [setError, reset]);

    const [showPwd, setShowPwd] = useState(false);

    async function onSubmit(values) {
        setError(null);
        try {
            await doLogin(values); // server sets httpOnly cookie
            navigate("/dashboard");
        } catch {
            /* error message already handled by context */
        }
    }

    return (
        <Styled.Wrapper>
            <Box>
                <Heading size="lg" mb={4}>
                    Sign in
                </Heading>

                {error ? (
                    <Alert status="error" mb={4}>
                        <AlertIcon />
                        {error}
                    </Alert>
                ) : null}

                <Box as="form" onSubmit={handleSubmit(onSubmit)}>
                    <VStack align="stretch" spacing={4}>
                        <FormControl isInvalid={!!errors.email}>
                            <FormLabel>Email</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <FiMail />
                                </InputLeftElement>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    // clear the global error as soon as user edits
                                    {...register("email", { onChange: () => error && setError(null) })}
                                />
                            </InputGroup>
                            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.password}>
                            <FormLabel>Password</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <FiLock />
                                </InputLeftElement>
                                <Input
                                    type={showPwd ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...register("password", { onChange: () => error && setError(null) })}
                                />
                                <InputRightElement pointerEvents="auto">
                                    <IconButton
                                        aria-label={showPwd ? "Hide password" : "Show password"}
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setShowPwd((s) => !s)}
                                        icon={showPwd ? <FiEyeOff /> : <FiEye />}
                                    />
                                </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
                        </FormControl>

                        <Button
                            type="submit"
                            colorScheme="blue"
                            isLoading={loading || isSubmitting}
                            loadingText="Signing in..."
                        >
                            Sign in
                        </Button>

                        <Text fontSize="sm">
                            New here?{" "}
                            <Link as={RouterLink} to="/register" color="blue.500" onClick={() => setError(null)}>
                                Create an account
                            </Link>
                        </Text>
                    </VStack>
                </Box>
            </Box>
        </Styled.Wrapper>
    );
};

export default Login;
