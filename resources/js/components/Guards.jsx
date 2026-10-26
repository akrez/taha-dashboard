import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { can, isAuthenticated, isSuperAdmin } from '../auth';

/**
 * Bounce anonymous visitors to the Laravel-served login screen, remembering
 * where they were headed so the login page can send them back afterwards.
 */
export function RequireAuth({ children }) {
    const location = useLocation();
    const authenticated = isAuthenticated();

    useEffect(() => {
        if (!authenticated) {
            const redirect = location.pathname + location.search;
            window.location.replace(`/?login=1&redirect=${encodeURIComponent(redirect)}`);
        }
    }, [authenticated, location.pathname, location.search]);

    if (!authenticated) {
        return null;
    }

    return children;
}

export function RequireSuperAdmin({ children }) {
    if (!isSuperAdmin()) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export function RequirePermission({ permission, children }) {
    if (!can(permission)) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export function RequireAnyPermission({ permissions, children }) {
    if (!permissions.some((permission) => can(permission))) {
        return <Navigate to="/" replace />;
    }

    return children;
}
