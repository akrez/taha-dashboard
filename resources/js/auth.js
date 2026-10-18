import axios from 'axios';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const PERMISSIONS_KEY = 'auth_permissions';
const ROLES_KEY = 'auth_roles';
const SUPER_ADMIN_KEY = 'auth_is_super_admin';

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
    const raw = localStorage.getItem(USER_KEY);

    try {
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function getPermissions() {
    const raw = localStorage.getItem(PERMISSIONS_KEY);

    try {
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function getRoles() {
    const raw = localStorage.getItem(ROLES_KEY);

    try {
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function hasRole(role) {
    return getRoles().includes(role);
}

export function isSuperAdmin() {
    return localStorage.getItem(SUPER_ADMIN_KEY) === 'true';
}

/**
 * Super admins are granted every ability, so they pass any permission check.
 */
export function can(permission) {
    return isSuperAdmin() || getPermissions().includes(permission);
}

export function setAuth({
    token,
    user,
    permissions = [],
    roles = [],
    isSuperAdmin = false,
}) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions));
    localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
    localStorage.setItem(SUPER_ADMIN_KEY, String(Boolean(isSuperAdmin)));
}

export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PERMISSIONS_KEY);
    localStorage.removeItem(ROLES_KEY);
    localStorage.removeItem(SUPER_ADMIN_KEY);
}

export function isAuthenticated() {
    return Boolean(getToken());
}

export function redirectToLogin() {
    clearAuth();

    const { pathname, search } = window.location;

    if (pathname !== '/login') {
        const redirect = encodeURIComponent(pathname + search);
        window.location.href = `/login?redirect=${redirect}`;
    }
}

export async function logout() {
    try {
        await axios.post('/api/logout');
    } catch {
        // Even if the request fails, drop the local session.
    } finally {
        clearAuth();
        window.location.href = '/login';
    }
}

/**
 * Attach the bearer token to every request and bounce to the login
 * page whenever the API reports the token is no longer valid.
 */
export function setupAxios() {
    axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    axios.interceptors.request.use((config) => {
        const token = getToken();

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    });

    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                redirectToLogin();
            }

            return Promise.reject(error);
        },
    );
}
