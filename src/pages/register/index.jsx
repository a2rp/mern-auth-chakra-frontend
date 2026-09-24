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
    FormHelperText,
    Button,
    Alert,
    AlertIcon,
    Link,
    Text,
    IconButton,
} from "@chakra-ui/react";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../providers/AuthProvider.jsx";
import { Styled } from "./styled";

// strong password: ≥8 chars, 1 upper, 1 lower, 1 number, 1 special
const STRONG_PWD_RX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// schema + confirm password match + strength
const schema = z
    .object({
        name: z.string().min(2, "Min 2 characters").max(60),
        email: z.string().email("Enter a valid email"),
        password: z
            .string()
            .min(8, "Min 8 characters")
            .regex(
                STRONG_PWD_RX,
                "Use upper & lower case letters, a number, and a special character"
            ),
        confirmPassword: z.string().min(8, "Min 8 characters"),
    })
    .refine((v) => v.password === v.confirmPassword, {
        path: ["confirmPassword"],
        message: "Passwords do not match",
    });

const Register = () => {
    const navigate = useNavigate();
    const { register: doRegister, loading, error, setError } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
    });

    // clear any previous auth error when this page opens
    useEffect(() => {
        setError(null);
    }, [setError]);

    // eye toggles
    const [showPwd, setShowPwd] = useState(false);
    const [showCPwd, setShowCPwd] = useState(false);

    async function onSubmit(values) {
        setError(null);
        const { name, email, password } = values; // send only what backend needs
        try {
            await doRegister({ name, email, password }); // httpOnly cookie set by server
            navigate("/dashboard");
        } catch { return; }
    }

    return (
        <Styled.Wrapper>
            <Box>
                <Heading size="lg" mb={4}>
                    Create account
                </Heading>

                {error ? (
                    <Alert status="error" mb={4}>
                        <AlertIcon />
                        {error}
                    </Alert>
                ) : null}

                <Box as="form" onSubmit={handleSubmit(onSubmit)}>
                    <VStack align="stretch" spacing={4}>
                        <FormControl isInvalid={!!errors.name}>
                            <FormLabel>Name</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <FiUser />
                                </InputLeftElement>
                                <Input
                                    placeholder="Your full name"
                                    {...register("name", { onChange: () => error && setError(null) })}
                                />
                            </InputGroup>
                            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.email}>
                            <FormLabel>Email</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <FiMail />
                                </InputLeftElement>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
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
                                    placeholder="strong password (min 8)"
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
                            {!errors.password && (
                                <FormHelperText>
                                    Use upper & lower case letters, a number, and a special character.
                                </FormHelperText>
                            )}
                            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.confirmPassword}>
                            <FormLabel>Confirm password</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <FiLock />
                                </InputLeftElement>
                                <Input
                                    type={showCPwd ? "text" : "password"}
                                    placeholder="re-enter password"
                                    {...register("confirmPassword", { onChange: () => error && setError(null) })}
                                />
                                <InputRightElement pointerEvents="auto">
                                    <IconButton
                                        aria-label={showCPwd ? "Hide confirm password" : "Show confirm password"}
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setShowCPwd((s) => !s)}
                                        icon={showCPwd ? <FiEyeOff /> : <FiEye />}
                                    />
                                </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
                        </FormControl>

                        <Button
                            type="submit"
                            colorScheme="blue"
                            isLoading={loading || isSubmitting}
                            loadingText="Creating..."
                        >
                            Create account
                        </Button>

                        <Text fontSize="sm">
                            Already have an account?{" "}
                            <Link as={RouterLink} to="/login" color="blue.500" onClick={() => setError(null)}>
                                Sign in
                            </Link>
                        </Text>
                    </VStack>
                </Box>
            </Box>
        </Styled.Wrapper>
    );
};

export default Register;
