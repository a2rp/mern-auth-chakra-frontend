// Central place for auth state (cookie-based).
// - loads /api/auth/me once on mount
// - exposes { user, ready, loading, error, register, login, logout }

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { authApi } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);     // {id, name, email, role} | null
    const [ready, setReady] = useState(false);  // true after first /me attempt finishes
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);   // string | null

    // hit /me once on mount to restore session from httpOnly cookie
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await authApi.me(); // { ok, user }
                if (!cancelled) setUser(res.user);
            } catch (err) {
                // 401 just means "not logged in" - not an app error
                if (!cancelled && err?.status !== 401) setError(err.message || "Failed to load session");
            } finally {
                if (!cancelled) setReady(true);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const register = useCallback(async (payload) => {
        setLoading(true);
        setError(null);
        try {
            const res = await authApi.register(payload); // cookie set by server
            setUser(res.user);
            return res.user;
        } catch (err) {
            setError(err.message || "Registration failed");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (payload) => {
        setLoading(true);
        setError(null);
        try {
            const res = await authApi.login(payload); // cookie set by server
            setUser(res.user);
            return res.user;
        } catch (err) {
            setError(err.message || "Login failed");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await authApi.logout(); // clears cookie
            setUser(null);
        } catch (err) {
            setError(err.message || "Logout failed");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const value = useMemo(
        () => ({ user, ready, loading, error, register, login, logout, setUser, setError }),
        [user, ready, loading, error, register, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
    return ctx;
}
