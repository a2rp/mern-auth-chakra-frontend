import React, { useEffect, useState } from "react";
import {
    Box,
    Heading,
    Text,
    VStack,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    IconButton,
    FormErrorMessage,
    FormHelperText,
    Button,
    Alert,
    AlertIcon,
    HStack,
    Divider,
} from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { usersApi } from "../../lib/api";
import { useAuth } from "../../providers/AuthProvider.jsx";
import { Styled } from "./styled";
import { FiLock, FiEye, FiEyeOff } from "react-icons/fi";

// date formatter
const fmt = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
});

// profile schema
const profileSchema = z.object({
    name: z.string().min(2, "Min 2 characters").max(60),
    email: z.string().email("Enter a valid email"),
});

// strong password: ≥8 chars, 1 upper, 1 lower, 1 number, 1 special
const STRONG_PWD_RX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// change-password schema (mirrors backend)
const pwdSchema = z
    .object({
        currentPassword: z.string().min(8, "Min 8 characters"),
        newPassword: z
            .string()
            .min(8, "Min 8 characters")
            .regex(
                STRONG_PWD_RX,
                "Use upper & lower case letters, a number, and a special character"
            ),
        confirmNew: z.string().min(8, "Min 8 characters"),
    })
    .refine((v) => v.newPassword === v.confirmNew, {
        path: ["confirmNew"],
        message: "Passwords do not match",
    })
    .refine((v) => v.currentPassword !== v.newPassword, {
        path: ["newPassword"],
        message: "New password must be different",
    });

const Profile = () => {
    const { user, setUser } = useAuth();

    // profile form state
    const [saveError, setSaveError] = useState(null);
    const [savedAt, setSavedAt] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty, isSubmitting },
    } = useForm({
        resolver: zodResolver(profileSchema),
        defaultValues: { name: user?.name || "", email: user?.email || "" },
    });

    // ensure latest profile timestamps
    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const res = await usersApi.getMe();
                if (!active) return;
                setUser(res.user);
                reset({ name: res.user.name || "", email: res.user.email || "" }, { keepDirty: false });
            } catch { }
        })();
        return () => {
            active = false;
        };
    }, [setUser, reset]);

    useEffect(() => {
        if (user) {
            reset({ name: user.name || "", email: user.email || "" }, { keepDirty: false });
        }
    }, [user, reset]);

    async function onSaveProfile(values) {
        setSaveError(null);
        setSavedAt(null);
        try {
            const res = await usersApi.updateMe(values);
            setUser(res.user);
            reset({ name: res.user.name, email: res.user.email }, { keepDirty: false });
            setSavedAt(new Date());
        } catch (err) {
            setSaveError(err?.message || "Failed to save changes");
        }
    }

    // change-password form state
    const [pwdError, setPwdError] = useState(null);
    const [pwdOkAt, setPwdOkAt] = useState(null);
    const [showCur, setShowCur] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConf, setShowConf] = useState(false);

    const {
        register: regPwd,
        handleSubmit: handlePwdSubmit,
        reset: resetPwd,
        formState: { errors: pwdErrors, isSubmitting: pwdSubmitting, isDirty: pwdDirty },
    } = useForm({
        resolver: zodResolver(pwdSchema),
        defaultValues: { currentPassword: "", newPassword: "", confirmNew: "" },
    });

    async function onChangePassword(values) {
        setPwdError(null);
        setPwdOkAt(null);
        try {
            await usersApi.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
            });
            setPwdOkAt(new Date());
            resetPwd({ currentPassword: "", newPassword: "", confirmNew: "" }, { keepDirty: false });
        } catch (err) {
            setPwdError(err?.message || "Failed to update password");
        }
    }

    return (
        <Styled.Wrapper>
            <Box>
                <Heading size="lg" mb={1}>Profile</Heading>
                <Text color="gray.600" mb={1}>Role: <b>{user?.role}</b></Text>
                <Text color="gray.500" fontSize="sm" mb={4}>
                    Created: {user?.createdAt ? fmt.format(new Date(user.createdAt)) : "-"} •{" "}
                    Last updated: {user?.updatedAt ? fmt.format(new Date(user.updatedAt)) : "-"}
                </Text>

                <Divider my={4} />

                {saveError && (
                    <Alert status="error" mb={4}>
                        <AlertIcon />
                        {saveError}
                    </Alert>
                )}
                {savedAt && (
                    <Alert status="success" mb={4}>
                        <AlertIcon />
                        Saved {fmt.format(savedAt)}.
                    </Alert>
                )}

                <Box as="form" onSubmit={handleSubmit(onSaveProfile)}>
                    <VStack align="stretch" spacing={4}>
                        <FormControl isInvalid={!!errors.name}>
                            <FormLabel>Name</FormLabel>
                            <Input
                                placeholder="Your full name"
                                {...register("name", {
                                    onChange: () => {
                                        setSaveError(null);
                                        setSavedAt(null);
                                    },
                                })}
                            />
                            <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!errors.email}>
                            <FormLabel>Email</FormLabel>
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                {...register("email", {
                                    onChange: () => {
                                        setSaveError(null);
                                        setSavedAt(null);
                                    },
                                })}
                            />
                            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
                        </FormControl>

                        <HStack spacing={3}>
                            <Button type="submit" colorScheme="blue" isLoading={isSubmitting} isDisabled={!isDirty}>
                                Save changes
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    reset({ name: user?.name || "", email: user?.email || "" }, { keepDirty: false });
                                    setSaveError(null);
                                    setSavedAt(null);
                                }}
                                isDisabled={!isDirty || isSubmitting}
                            >
                                Reset
                            </Button>
                        </HStack>
                    </VStack>
                </Box>

                <Divider my={8} />

                <Heading size="md" mb={3}>Change password</Heading>

                {pwdError && (
                    <Alert status="error" mb={4}>
                        <AlertIcon />
                        {pwdError}
                    </Alert>
                )}
                {pwdOkAt && (
                    <Alert status="success" mb={4}>
                        <AlertIcon />
                        Password updated {fmt.format(pwdOkAt)}.
                    </Alert>
                )}

                <Box as="form" onSubmit={handlePwdSubmit(onChangePassword)}>
                    <VStack align="stretch" spacing={4}>
                        <FormControl isInvalid={!!pwdErrors.currentPassword}>
                            <FormLabel>Current password</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <FiLock />
                                </InputLeftElement>
                                <Input
                                    type={showCur ? "text" : "password"}
                                    placeholder="••••••••"
                                    {...regPwd("currentPassword", {
                                        onChange: () => {
                                            setPwdError(null);
                                            setPwdOkAt(null);
                                        },
                                    })}
                                />
                                <InputRightElement>
                                    <IconButton
                                        aria-label={showCur ? "Hide" : "Show"}
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setShowCur((s) => !s)}
                                        icon={showCur ? <FiEyeOff /> : <FiEye />}
                                    />
                                </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage>{pwdErrors.currentPassword?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!pwdErrors.newPassword}>
                            <FormLabel>New password</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <FiLock />
                                </InputLeftElement>
                                <Input
                                    type={showNew ? "text" : "password"}
                                    placeholder="at least 8 chars, strong"
                                    {...regPwd("newPassword", {
                                        onChange: () => {
                                            setPwdError(null);
                                            setPwdOkAt(null);
                                        },
                                    })}
                                />
                                <InputRightElement>
                                    <IconButton
                                        aria-label={showNew ? "Hide" : "Show"}
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setShowNew((s) => !s)}
                                        icon={showNew ? <FiEyeOff /> : <FiEye />}
                                    />
                                </InputRightElement>
                            </InputGroup>
                            {!pwdErrors.newPassword && (
                                <FormHelperText>
                                    Use upper & lower case letters, a number, and a special character (min 8).
                                </FormHelperText>
                            )}
                            <FormErrorMessage>{pwdErrors.newPassword?.message}</FormErrorMessage>
                        </FormControl>

                        <FormControl isInvalid={!!pwdErrors.confirmNew}>
                            <FormLabel>Confirm new password</FormLabel>
                            <InputGroup>
                                <InputLeftElement pointerEvents="none">
                                    <FiLock />
                                </InputLeftElement>
                                <Input
                                    type={showConf ? "text" : "password"}
                                    placeholder="re-enter new password"
                                    {...regPwd("confirmNew", {
                                        onChange: () => {
                                            setPwdError(null);
                                            setPwdOkAt(null);
                                        },
                                    })}
                                />
                                <InputRightElement>
                                    <IconButton
                                        aria-label={showConf ? "Hide" : "Show"}
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setShowConf((s) => !s)}
                                        icon={showConf ? <FiEyeOff /> : <FiEye />}
                                    />
                                </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage>{pwdErrors.confirmNew?.message}</FormErrorMessage>
                        </FormControl>

                        <HStack spacing={3}>
                            <Button type="submit" colorScheme="blue" isLoading={pwdSubmitting} isDisabled={!pwdDirty}>
                                Update password
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    resetPwd({ currentPassword: "", newPassword: "", confirmNew: "" }, { keepDirty: false });
                                    setPwdError(null);
                                    setPwdOkAt(null);
                                }}
                                isDisabled={!pwdDirty || pwdSubmitting}
                            >
                                Reset
                            </Button>
                        </HStack>
                    </VStack>
                </Box>
            </Box>
        </Styled.Wrapper>
    );
};

export default Profile;
