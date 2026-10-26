import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    AppBar,
    Avatar,
    Box,
    Button,
    CssBaseline,
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
} from '@mui/material';
import {
    Home as HomeIndexIcon,
    Link as LinkIcon,
    Login as LoginIcon,
    LogoutOutlined,
    Security as RolesIcon,
    Slideshow as SlideshowIcon,
    People as UsersIcon,
    Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { can, getUser, hasRole, isSuperAdmin, logout } from '../auth';
import Footer from './Footer';
import LoginModal from './LoginModal';

const navItems = [
    { key: 'dashboard', label: '', path: '/', icon: <HomeIndexIcon />, title: 'صفحه اصلی' },
    { key: 'visits', label: 'بازدیدها', path: '/visits', icon: <VisibilityIcon />, permission: 'VisitIndex' },
    { key: 'slides', label: 'اسلایدها', path: '/slides', icon: <SlideshowIcon />, permission: 'Slide' },
    { key: 'links', label: 'لینک‌ها', path: '/links', icon: <LinkIcon />, permission: 'Link' },
    { key: 'users', label: 'کاربران', path: '/users', icon: <UsersIcon />, permissions: ['UserManager', 'UserIndex'] },
    { key: 'roles', label: 'نقش‌ها', path: '/roles', icon: <RolesIcon />, superAdmin: true },
];

export default function HomeIndex() {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(() => getUser());
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [loginModalOpen, setLoginModalOpen] = useState(() => {
        return new URLSearchParams(window.location.search).has('login');
    });
    const [homeData, setHomeData] = useState(null);
    const [homeLoading, setHomeLoading] = useState(true);

    // Listen for auth-required events triggered by guards or expired sessions
    useEffect(() => {
        const handleAuthRequired = () => setLoginModalOpen(true);
        window.addEventListener('auth:login_required', handleAuthRequired);
        return () => window.removeEventListener('auth:login_required', handleAuthRequired);
    }, []);

    const handleLoginClose = () => {
        setLoginModalOpen(false);
        const url = new URL(window.location.href);
        if (url.searchParams.has('login')) {
            url.searchParams.delete('login');
            window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash);
        }
    };

    const handleLoginSuccess = (newUser) => {
        setUser(newUser);
        setLoginModalOpen(false);

        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        const url = new URL(window.location.href);
        url.searchParams.delete('login');
        url.searchParams.delete('redirect');
        window.history.replaceState({}, '', url.pathname + (url.search ? url.search : '') + url.hash);

        if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
            navigate(redirect);
        }
    };

    // The whole public home payload (date, visit stats and visible slides) is
    // fetched once here and shared with the child route and the footer.
    useEffect(() => {
        axios
            .get('/api/')
            .then((res) => setHomeData(res.data))
            .catch(() => setHomeData(null))
            .finally(() => setHomeLoading(false));
    }, []);

    const today = homeData?.date ?? null;
    const visits = homeData?.visits ?? null;
    const slides = homeData?.slides ?? [];
    const links = homeData?.links ?? [];

    const handleMenuOpen = (event) => setMenuAnchor(event.currentTarget);
    const handleMenuClose = () => setMenuAnchor(null);
    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'کاربر';
    const userRoleInfo = [user?.position?.name, user?.project?.name].filter(Boolean).join(' - ');

    const visibleNavItems = navItems.filter((item) => {
        if (item.superAdmin && !isSuperAdmin()) {
            return false;
        }

        if (item.role && !hasRole(item.role)) {
            return false;
        }

        if (item.permissions && !item.permissions.some((permission) => can(permission))) {
            return false;
        }

        return !item.permission || can(item.permission);
    });

    return (
        <Box>
            <CssBaseline />
            <AppBar
                position="fixed"
            >
                <Toolbar sx={{ position: 'relative' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {today && (
                            <Box
                                sx={{
                                    display: { xs: 'none', sm: 'flex' },
                                    flexDirection: 'column',
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3} sx={{ color: '#ffffff' }}>
                                    {today.jalali}
                                </Typography>
                                <Typography variant="caption" lineHeight={1.3} sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                    {today.gregorian}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Box
                        component="nav"
                        sx={{
                            position: 'absolute',
                            left: '50%',
                            top: '50%',
                            transform: 'translate(-50%, -50%)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: { xs: 0, sm: 0.5 },
                        }}
                    >
                        {visibleNavItems.map((item) => (
                            <Button
                                key={item.key}
                                component={NavLink}
                                to={item.path}
                                end={item.path === '/'}
                                color="inherit"
                                startIcon={item.icon}
                                sx={{
                                    minWidth: item.label ? { xs: 40, sm: 64 } : 40,
                                    px: item.label ? { xs: 0.75, sm: 1.5 } : 1,
                                    gap: item.label ? 1 : 0,
                                    transition: 'all 0.2s ease',
                                    '&.active': {
                                        bgcolor: 'rgba(59, 130, 246, 0.22)',
                                        color: '#93c5fd',
                                        boxShadow: 'inset 0 -2px 0 #3b82f6',
                                    },
                                    '&:hover': {
                                        bgcolor: 'rgba(255, 255, 255, 0.1)',
                                    },
                                    '& .MuiButton-startIcon': {
                                        m: 0,
                                    },
                                }}
                            >
                                {item.label ? (
                                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                        {item.label}
                                    </Box>
                                ) : null}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                        {user ? (
                            <>
                                <Box
                                    sx={{
                                        display: { xs: 'none', sm: 'flex' },
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        textAlign: 'right',
                                        lineHeight: 1.2,
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={600} lineHeight={1.2} sx={{ color: '#ffffff' }}>
                                        {fullName}
                                    </Typography>
                                    {userRoleInfo && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: '#93c5fd',
                                                fontSize: '0.73rem',
                                                lineHeight: 1.2,
                                                fontWeight: 500,
                                            }}
                                        >
                                            {userRoleInfo}
                                        </Typography>
                                    )}
                                </Box>
                                <IconButton onClick={handleMenuOpen} size="small" sx={{ p: 0 }}>
                                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main', fontSize: '0.95rem', fontWeight: 600 }}>
                                        {fullName.charAt(0)}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    anchorEl={menuAnchor}
                                    open={Boolean(menuAnchor)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem disabled sx={{ opacity: '1 !important', py: 1 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                                            <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                                                {fullName}
                                            </Typography>
                                            {user?.position?.name && (
                                                <Typography variant="caption" color="text.secondary">
                                                    سمت: {user.position.name}
                                                </Typography>
                                            )}
                                            {user?.project?.name && (
                                                <Typography variant="caption" color="text.secondary">
                                                    پروژه: {user.project.name}
                                                </Typography>
                                            )}
                                        </Box>
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={handleLogout}>
                                        <ListItemIcon>
                                            <LogoutOutlined fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText>خروج</ListItemText>
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Button
                                color="inherit"
                                onClick={() => setLoginModalOpen(true)}
                                startIcon={<LoginIcon />}
                                sx={{
                                    borderRadius: '6px',
                                    px: 1.5,
                                    py: 0.5,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: 'rgba(59, 130, 246, 0.2)',
                                        color: '#93c5fd',
                                    },
                                }}
                            >
                                ورود
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                }}
            >
                <Toolbar />
                <Box
                    sx={{
                        flexGrow: 1,
                        p: location.pathname === '/' ? 0 : { xs: 2, sm: 3 },
                    }}
                >
                    <Outlet context={{ visits, slides, links, loading: homeLoading }} />
                </Box>
                <Footer
                    visits={visits}
                    authenticated={Boolean(user)}
                    onOpenLogin={() => setLoginModalOpen(true)}
                />
            </Box>

            <LoginModal
                open={loginModalOpen}
                onClose={handleLoginClose}
                onSuccess={handleLoginSuccess}
            />
        </Box>
    );
}
