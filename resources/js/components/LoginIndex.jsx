import { useState } from 'react';
import axios from 'axios';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    BadgeOutlined,
    LockOutlined,
    Login as LoginIcon,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import { setAuth } from '../auth';

export default function LoginIndex() {
    const [nationalCode, setNationalCode] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await axios.post('/api/login', {
                national_code: nationalCode,
                password,
            });

            setAuth({
                token: data.token,
                user: data.user,
                permissions: data.permissions,
                roles: data.roles,
                isSuperAdmin: data.is_super_admin,
            });

            // Return to the page the visitor was heading to before the login
            // detour (same-origin relative paths only).
            const redirect = new URLSearchParams(window.location.search).get('redirect');
            const target = redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : '/';

            window.location.href = target;
        } catch (err) {
            const errors = err.response?.data?.errors;
            const message =
                errors?.national_code?.[0] ??
                errors?.password?.[0] ??
                err.response?.data?.message ??
                'ورود ناموفق بود. لطفاً دوباره تلاش کنید.';

            setError(message);
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                p: 2,
            }}
        >
            <Card sx={{ width: '100%', maxWidth: 420, boxShadow: 4 }}>
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                    <Stack spacing={1} alignItems="center" sx={{ mb: 4 }}>
                        <Typography variant="h5" fontWeight={700} color="primary.main">
                            مهندسین مشاور طرح آفرینان هزاره امید (طاها)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            برای ادامه وارد حساب کاربری خود شوید
                        </Typography>
                    </Stack>

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Stack spacing={2.5}>
                            {error && <Alert severity="error">{error}</Alert>}

                            <TextField
                                label="کد ملی"
                                value={nationalCode}
                                onChange={(e) => setNationalCode(e.target.value)}
                                fullWidth
                                autoFocus
                                autoComplete="username"
                                slotProps={{
                                    htmlInput: {
                                        inputMode: 'numeric',
                                        maxLength: 10,
                                        dir: 'ltr',
                                        style: { textAlign: 'left' },
                                    },
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <BadgeOutlined fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <TextField
                                label="رمز عبور"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                fullWidth
                                autoComplete="current-password"
                                slotProps={{
                                    htmlInput: { dir: 'ltr', style: { textAlign: 'left' } },
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IconButton
                                                    aria-label="تغییر نمایش رمز عبور"
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                    edge="start"
                                                    size="small"
                                                >
                                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <LockOutlined fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LoginIcon />}
                                sx={{ mt: 1, py: 1.2 }}
                            >
                                ورود
                            </Button>
                        </Stack>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
