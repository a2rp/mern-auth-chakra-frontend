// Small fetch helper for this app.
// - Base URL from VITE_API_URL
// - Always sends cookies (credentials: 'include')
// - Normalizes errors so UI code stays clean

const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

async function request(path, { method = "GET", body, headers = {} } = {}) {
    const isForm = body instanceof FormData;

    const res = await fetch(`${BASE}${path}`, {
        method,
        credentials: "include",
        headers: {
            Accept: "application/json",
            ...(isForm ? {} : { "Content-Type": "application/json" }),
            ...headers,
        },
        body: isForm ? body : body ? JSON.stringify(body) : undefined,
    });

    let data = null;
    const text = await res.text();
    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = { message: text };
        }
    }

    if (!res.ok) {
        const err = new Error(
            data?.message || `Request failed (${res.status})`
        );
        err.status = res.status;
        err.data = data;
        throw err;
    }

    return data;
}

export const api = {
    get: (p) => request(p),
    post: (p, b) => request(p, { method: "POST", body: b }),
    put: (p, b) => request(p, { method: "PUT", body: b }),
    del: (p) => request(p, { method: "DELETE" }),
};

// auth endpoints
export const authApi = {
    register: (payload) => api.post("/api/auth/register", payload),
    login: (payload) => api.post("/api/auth/login", payload),
    logout: () => api.post("/api/auth/logout"),
    me: () => api.get("/api/auth/me"),
};

// user/profile endpoints
export const usersApi = {
    getMe: () => api.get("/api/users/me"),
    updateMe: (payload) => api.put("/api/users/me", payload), // { name?, email? }
    changePassword: (payload) => api.put("/api/users/me/password", payload), // { currentPassword, newPassword }
};

// admin endpoints
export const adminApi = {
    listUsers: ({ page = 1, limit = 10, q = "" } = {}) => {
        const params = new URLSearchParams();
        params.set("page", String(page));
        params.set("limit", String(limit));
        if (q) params.set("q", q);
        return api.get(`/api/admin/users?${params.toString()}`);
    },
    updateUser: (id, payload) => api.put(`/api/admin/users/${id}`, payload), // { name?, email?, role? }
    // (we call api.post('/api/admin/users', ...) directly in the page for create)
};
