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
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { can, getUser, hasRole, isSuperAdmin, logout } from '../auth';
import Footer from './Footer';

const navItems = [
    { key: 'dashboard', label: 'صفحه نخست پروژه طاها', path: '/', icon: <HomeIndexIcon /> },
    { key: 'visits', label: 'بازدیدها', path: '/visits', icon: <VisibilityIcon />, permission: 'VisitIndex' },
    { key: 'slides', label: 'اسلایدها', path: '/slides', icon: <SlideshowIcon />, permission: 'Slide' },
    { key: 'links', label: 'لینک‌ها', path: '/links', icon: <LinkIcon />, permission: 'Link' },
    { key: 'users', label: 'کاربران', path: '/users', icon: <UsersIcon />, permissions: ['UserManager', 'UserIndex'] },
    { key: 'roles', label: 'نقش‌ها', path: '/roles', icon: <RolesIcon />, superAdmin: true },
];

export default function HomeIndex() {
    const location = useLocation();
    const [user] = useState(() => getUser());
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [homeData, setHomeData] = useState(null);
    const [homeLoading, setHomeLoading] = useState(true);

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
                                <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3}>
                                    {today.jalali}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" lineHeight={1.3}>
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
                                    minWidth: { xs: 40, sm: 64 },
                                    px: { xs: 0.75, sm: 1.5 },
                                    gap: 1,
                                    '&.active': {
                                        bgcolor: (theme) => alpha(theme.palette.common.white, 0.18),
                                    },
                                    '& .MuiButton-startIcon': {
                                        m: 0,
                                    },
                                }}
                            >
                                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                                    {item.label}
                                </Box>
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                        {user ? (
                            <>
                                <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    {fullName}
                                </Typography>
                                <IconButton onClick={handleMenuOpen} size="small" sx={{ p: 0 }}>
                                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'secondary.main' }}>
                                        {fullName.charAt(0)}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    anchorEl={menuAnchor}
                                    open={Boolean(menuAnchor)}
                                    onClose={handleMenuClose}
                                >
                                    <MenuItem disabled>{fullName}</MenuItem>
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
                            <Button color="inherit" component="a" href="/login" startIcon={<LoginIcon />}>
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
                <Footer visits={visits} authenticated={Boolean(user)} />
            </Box>
        </Box>
    );
}
