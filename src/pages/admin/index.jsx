import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
    Box,
    Heading,
    Text,
    Alert,
    AlertIcon,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Select,
    HStack,
    Button,
    Input,
    InputGroup,
    InputLeftElement,
    InputRightElement,
    IconButton,
    Icon,
    Spinner,
    Spacer,
    Badge,
    VStack,
    FormControl,
    FormLabel,
    FormErrorMessage,
    FormHelperText,
} from "@chakra-ui/react";
import { FiSearch, FiEye, FiEyeOff, FiChevronUp, FiChevronDown } from "react-icons/fi";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminApi, api } from "../../lib/api";
import { useAuth } from "../../providers/AuthProvider.jsx";
import { Styled } from "./styled";

const fmt = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
});

// strong password: ≥8 chars, 1 upper, 1 lower, 1 number, 1 special
const STRONG_PWD_RX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// create-user schema (with strength check)
const createSchema = z.object({
    name: z.string().min(2, "Min 2 characters").max(60),
    email: z.string().email("Enter a valid email"),
    password: z
        .string()
        .min(8, "Min 8 characters")
        .regex(
            STRONG_PWD_RX,
            "Use upper & lower case letters, a number, and a special character"
        ),
    role: z.enum(["user", "admin"]),
});

// edit-user schema (only name/email)
const editSchema = z.object({
    name: z.string().min(2, "Min 2 characters").max(60),
    email: z.string().email("Enter a valid email"),
});

const Admin = () => {
    const { user } = useAuth();

    // list state
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [rows, setRows] = useState([]);
    const [meta, setMeta] = useState({ total: 0, pages: 1 });
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);

    // per-row draft + save state (role inline)
    const [draftRole, setDraftRole] = useState({});
    const [savingId, setSavingId] = useState(null);
    const [saveError, setSaveError] = useState(null);

    // ------- LOCAL SORT (frontend only) -------
    // sort.key: 'name' | 'email' | 'role' | 'createdAt' | 'updatedAt' | null
    // sort.dir: 'asc' | 'desc'
    const [sort, setSort] = useState({ key: null, dir: "asc" });

    const toggleSort = (key) =>
        setSort((s) =>
            s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }
        );

    const cmp = (a, b, key) => {
        const va = a?.[key];
        const vb = b?.[key];
        if (key === "createdAt" || key === "updatedAt") {
            const ta = va ? new Date(va).getTime() : 0;
            const tb = vb ? new Date(vb).getTime() : 0;
            return ta - tb;
        }
        return String(va ?? "").localeCompare(String(vb ?? ""), undefined, { sensitivity: "base" });
    };

    const displayRows = useMemo(() => {
        if (!sort.key) return rows;
        const arr = [...rows].sort((a, b) => cmp(a, b, sort.key));
        return sort.dir === "asc" ? arr : arr.reverse();
    }, [rows, sort]);
    // ------------------------------------------

    // create-user modal state
    const [createOpen, setCreateOpen] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const {
        register: regCreate,
        handleSubmit: handleCreateSubmit,
        reset: resetCreate,
        formState: { errors: createErrors, isSubmitting: creating },
    } = useForm({
        resolver: zodResolver(createSchema),
        defaultValues: { name: "", email: "", password: "", role: "user" },
    });
    const [createError, setCreateError] = useState(null);

    const openCreate = () => {
        setCreateError(null);
        resetCreate({ name: "", email: "", password: "", role: "user" });
        setShowPwd(false);
        setCreateOpen(true);
    };
    const closeCreate = () => setCreateOpen(false);

    // edit-user modal state
    const [editOpen, setEditOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const {
        register: regEdit,
        handleSubmit: handleEditSubmit,
        reset: resetEdit,
        formState: { errors: editErrors, isSubmitting: editing },
    } = useForm({
        resolver: zodResolver(editSchema),
        defaultValues: { name: "", email: "" },
    });
    const [editError, setEditError] = useState(null);

    const openEdit = (row) => {
        setEditError(null);
        setEditingId(row.id);
        resetEdit({ name: row.name, email: row.email });
        setEditOpen(true);
    };
    const closeEdit = () => {
        setEditOpen(false);
        setEditingId(null);
    };

    // close modals on Esc
    useEffect(() => {
        if (!createOpen && !editOpen) return;
        const onKey = (e) => e.key === "Escape" && (createOpen ? closeCreate() : closeEdit());
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [createOpen, editOpen]);

    // list loader
    const load = useCallback(
        async (opts = {}) => {
            const usePage = opts.page ?? page;
            const useQ = opts.q ?? q;
            setLoading(true);
            setLoadError(null);
            try {
                const res = await adminApi.listUsers({ page: usePage, limit, q: useQ });
                setRows(res.users || []);
                setMeta(res.meta || { total: 0, pages: 1 });
            } catch (err) {
                setLoadError(err?.message || "Failed to load users");
            } finally {
                setLoading(false);
            }
        },
        [page, q, limit]
    );

    useEffect(() => {
        const t = setTimeout(() => load(), 250);
        return () => clearTimeout(t);
    }, [page, q, load]);

    const onChangeRole = (id, value) => {
        setSaveError(null);
        const r = rows.find((x) => x.id === id);
        if (!r) return;
        if (r.role === value) {
            setDraftRole((d) => {
                const copy = { ...d };
                delete copy[id];
                return copy;
            });
        } else {
            setDraftRole((d) => ({ ...d, [id]: value }));
        }
    };

    const onResetRow = (id) => {
        setSaveError(null);
        setDraftRole((d) => {
            const copy = { ...d };
            delete copy[id];
            return copy;
        });
    };

    const onSaveRow = async (id) => {
        const role = draftRole[id];
        if (!role) return;
        setSavingId(id);
        setSaveError(null);
        try {
            const res = await adminApi.updateUser(id, { role });
            setRows((prev) =>
                prev.map((r) =>
                    r.id === id ? { ...r, role: res.user.role, updatedAt: res.user.updatedAt } : r
                )
            );
            setDraftRole((d) => {
                const copy = { ...d };
                delete copy[id];
                return copy;
            });
        } catch (err) {
            setSaveError(err?.message || "Failed to save");
        } finally {
            setSavingId(null);
        }
    };

    // create-user submit
    const onCreate = async (values) => {
        setCreateError(null);
        try {
            await api.post("/api/admin/users", values);
            closeCreate();
            setPage(1);
            await load({ page: 1 });
        } catch (err) {
            setCreateError(err?.message || "Failed to create user");
        }
    };

    // edit-user submit
    const onEdit = async (values) => {
        if (!editingId) return;
        setEditError(null);
        try {
            const res = await adminApi.updateUser(editingId, values);
            setRows((prev) =>
                prev.map((r) =>
                    r.id === editingId
                        ? { ...r, name: res.user.name, email: res.user.email, updatedAt: res.user.updatedAt }
                        : r
                )
            );
            closeEdit();
        } catch (err) {
            setEditError(err?.message || "Failed to update user");
        }
    };

    // header cell with arrow
    const SortHeader = ({ k, label, isNumeric = false }) => {
        const active = sort.key === k;
        const arrow = !active ? null : sort.dir === "asc" ? <FiChevronUp /> : <FiChevronDown />;
        return (
            <Th
                onClick={() => toggleSort(k)}
                cursor="pointer"
                userSelect="none"
                whiteSpace="nowrap"
                color={active ? "blue.600" : undefined}
                isNumeric={isNumeric}
            >
                <HStack spacing={1} justify={isNumeric ? "flex-end" : "flex-start"}>
                    <span>{label}</span>
                    {arrow}
                </HStack>
            </Th>
        );
    };

    return (
        <Styled.Wrapper>
            <Box>
                <HStack justify="space-between" align="center" mb={2}>
                    <Heading size="lg">Admin - Users</Heading>
                    <Button colorScheme="blue" onClick={openCreate}>Add user</Button>
                </HStack>
                <Text color="gray.600" mb={4}>
                    Signed in as <b>{user?.name}</b> ({user?.email}) - role: <b>{user?.role}</b>
                </Text>

                {loadError && (
                    <Alert status="error" mb={4}>
                        <AlertIcon />
                        {loadError}
                    </Alert>
                )}
                {saveError && (
                    <Alert status="error" mb={4}>
                        <AlertIcon />
                        {saveError}
                    </Alert>
                )}

                <HStack mb={3} align="center">
                    <InputGroup maxW="360px">
                        <InputLeftElement pointerEvents="none">
                            <Icon as={FiSearch} />
                        </InputLeftElement>
                        <Input
                            placeholder="Search name or email"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </InputGroup>
                    <Spacer />
                    <Text fontSize="sm" color="gray.600">
                        {meta.total} users • Page {page} of {meta.pages}
                    </Text>
                </HStack>

                <Box borderWidth="1px" borderRadius="md" overflow="hidden">
                    <Table size="sm">
                        <Thead bg="gray.50" _dark={{ bg: "gray.700" }}>
                            <Tr>
                                {/* Keep <Th> siblings on one line to avoid <tr> whitespace warning */}
                                <SortHeader k="name" label="Name" /><SortHeader k="email" label="Email" /><SortHeader k="role" label="Role" /><SortHeader k="createdAt" label="Created" /><SortHeader k="updatedAt" label="Updated" /><Th isNumeric>Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {displayRows.map((r) => {
                                const draft = draftRole[r.id];
                                const current = draft ?? r.role;
                                const dirty = typeof draft !== "undefined";
                                return (
                                    <Tr key={r.id} style={{ opacity: savingId === r.id ? 0.6 : 1 }}>
                                        <Td>{r.name}</Td>
                                        <Td>{r.email}</Td>
                                        <Td>
                                            <HStack>
                                                <Select
                                                    size="sm"
                                                    value={current}
                                                    onChange={(e) => onChangeRole(r.id, e.target.value)}
                                                    maxW="140px"
                                                >
                                                    <option value="user">user</option>
                                                    <option value="admin">admin</option>
                                                </Select>
                                                {!dirty && (
                                                    <Badge colorScheme={r.role === "admin" ? "purple" : "gray"}>
                                                        {r.role}
                                                    </Badge>
                                                )}
                                            </HStack>
                                        </Td>
                                        <Td>{r.createdAt ? fmt.format(new Date(r.createdAt)) : "-"}</Td>
                                        <Td>{r.updatedAt ? fmt.format(new Date(r.updatedAt)) : "-"}</Td>
                                        <Td isNumeric>
                                            <HStack justify="flex-end" spacing={2}>
                                                <Button
                                                    size="xs"
                                                    variant="outline"
                                                    onClick={() => onResetRow(r.id)}
                                                    isDisabled={!dirty || savingId === r.id}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    size="xs"
                                                    colorScheme="blue"
                                                    onClick={() => onSaveRow(r.id)}
                                                    isDisabled={!dirty}
                                                    isLoading={savingId === r.id}
                                                >
                                                    Save
                                                </Button>
                                                <Button size="xs" variant="ghost" onClick={() => openEdit(r)}>
                                                    Edit
                                                </Button>
                                            </HStack>
                                        </Td>
                                    </Tr>
                                );
                            })}
                        </Tbody>
                    </Table>

                    {loading && (
                        <HStack justify="center" py={6}>
                            <Spinner />
                            <Text>Loading…</Text>
                        </HStack>
                    )}

                    {!loading && displayRows.length === 0 && (
                        <Box py={8} textAlign="center">
                            <Text color="gray.500">No users found.</Text>
                        </Box>
                    )}
                </Box>

                <HStack mt={4} justify="space-between">
                    <Button size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} isDisabled={page <= 1}>
                        Prev
                    </Button>
                    <HStack>
                        <Text fontSize="sm">Page {page} / {meta.pages}</Text>
                    </HStack>
                    <Button size="sm" onClick={() => setPage((p) => Math.min(meta.pages, p + 1))} isDisabled={page >= meta.pages}>
                        Next
                    </Button>
                </HStack>
            </Box>

            {/* Add user modal */}
            {createOpen && (
                <Box
                    position="fixed"
                    inset="0"
                    bg="blackAlpha.600"
                    zIndex="1000"
                    onClick={closeCreate}
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
                        maxW="md"
                        w="100%"
                        p={5}
                    >
                        <Heading size="md" mb={3}>Add user</Heading>

                        {createError && (
                            <Alert status="error" mb={3}>
                                <AlertIcon />
                                {createError}
                            </Alert>
                        )}

                        <Box as="form" onSubmit={handleCreateSubmit(onCreate)}>
                            <VStack align="stretch" spacing={3}>
                                <FormControl isInvalid={!!createErrors.name}>
                                    <FormLabel>Name</FormLabel>
                                    <Input placeholder="Full name" autoFocus {...regCreate("name")} />
                                    <FormErrorMessage>{createErrors.name?.message}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={!!createErrors.email}>
                                    <FormLabel>Email</FormLabel>
                                    <Input type="email" placeholder="user@example.com" {...regCreate("email")} />
                                    <FormErrorMessage>{createErrors.email?.message}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={!!createErrors.password}>
                                    <FormLabel>Password</FormLabel>
                                    <InputGroup>
                                        <Input
                                            type={showPwd ? "text" : "password"}
                                            placeholder="strong password (min 8)"
                                            {...regCreate("password")}
                                        />
                                        <InputRightElement>
                                            <IconButton
                                                aria-label={showPwd ? "Hide password" : "Show password"}
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setShowPwd((s) => !s)}
                                                icon={showPwd ? <FiEyeOff /> : <FiEye />}
                                            />
                                        </InputRightElement>
                                    </InputGroup>
                                    {!createErrors.password && (
                                        <FormHelperText>
                                            Use upper & lower case letters, a number, and a special character.
                                        </FormHelperText>
                                    )}
                                    <FormErrorMessage>{createErrors.password?.message}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={!!createErrors.role}>
                                    <FormLabel>Role</FormLabel>
                                    <Select maxW="200px" {...regCreate("role")}>
                                        <option value="user">user</option>
                                        <option value="admin">admin</option>
                                    </Select>
                                    <FormErrorMessage>{createErrors.role?.message}</FormErrorMessage>
                                </FormControl>

                                <HStack justify="flex-end" spacing={3} pt={2}>
                                    <Button variant="outline" onClick={closeCreate} isDisabled={creating}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" colorScheme="blue" isLoading={creating} loadingText="Creating...">
                                        Create user
                                    </Button>
                                </HStack>
                            </VStack>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* Edit user modal */}
            {editOpen && (
                <Box
                    position="fixed"
                    inset="0"
                    bg="blackAlpha.600"
                    zIndex="1000"
                    onClick={closeEdit}
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
                        maxW="md"
                        w="100%"
                        p={5}
                    >
                        <Heading size="md" mb={3}>Edit user</Heading>

                        {editError && (
                            <Alert status="error" mb={3}>
                                <AlertIcon />
                                {editError}
                            </Alert>
                        )}

                        <Box as="form" onSubmit={handleEditSubmit(onEdit)}>
                            <VStack align="stretch" spacing={3}>
                                <FormControl isInvalid={!!editErrors.name}>
                                    <FormLabel>Name</FormLabel>
                                    <Input
                                        placeholder="Full name"
                                        autoFocus
                                        {...regEdit("name", { onChange: () => setEditError(null) })}
                                    />
                                    <FormErrorMessage>{editErrors.name?.message}</FormErrorMessage>
                                </FormControl>

                                <FormControl isInvalid={!!editErrors.email}>
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        type="email"
                                        placeholder="user@example.com"
                                        {...regEdit("email", { onChange: () => setEditError(null) })}
                                    />
                                    <FormErrorMessage>{editErrors.email?.message}</FormErrorMessage>
                                </FormControl>

                                <HStack justify="flex-end" spacing={3} pt={2}>
                                    <Button variant="outline" onClick={closeEdit} isDisabled={editing}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" colorScheme="blue" isLoading={editing} loadingText="Saving...">
                                        Save changes
                                    </Button>
                                </HStack>
                            </VStack>
                        </Box>
                    </Box>
                </Box>
            )}
        </Styled.Wrapper>
    );
};

export default Admin;
