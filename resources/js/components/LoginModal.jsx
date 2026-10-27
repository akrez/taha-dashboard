import { useState } from 'react';
import axios from 'axios';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import {
    BadgeOutlined,
    Close as CloseIcon,
    LockOutlined,
    Login as LoginIcon,
    Visibility,
    VisibilityOff,
} from '@mui/icons-material';
import { setAuth } from '../auth';

export default function LoginModal({ open, onClose, onSuccess }) {
    const [nationalCode, setNationalCode] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        if (loading) return;
        setError('');
        setNationalCode('');
        setPassword('');
        setShowPassword(false);
        onClose();
    };

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

            setError('');
            setLoading(false);

            if (onSuccess) {
                onSuccess(data.user);
            } else {
                handleClose();
            }
        } catch (err) {
            const errors = err.response?.data?.errors;
            const message =
                errors?.national_code?.[0] ??
                errors?.password?.[0] ??
                err.response?.data?.message ??
                'ورود ناموفق بود. لطفاً کد ملی و رمز عبور را بررسی فرمایید.';

            setError(message);
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="xs"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                    },
                },
            }}
        >
            {/* Header with Blue-Black Theme */}
            <DialogTitle
                sx={{
                    background: 'linear-gradient(135deg, #050814 0%, #0c162f 50%, #0d1935 100%)',
                    color: '#ffffff',
                    p: 2.5,
                    position: 'relative',
                    textAlign: 'center',
                    borderBottom: '1px solid rgba(59, 130, 246, 0.25)',
                }}
            >
                <IconButton
                    aria-label="بستن"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 12,
                        top: 12,
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': {
                            color: '#ffffff',
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                        },
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        bgcolor: 'rgba(59, 130, 246, 0.15)',
                        border: '1px solid rgba(59, 130, 246, 0.35)',
                        color: '#60a5fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 1.5,
                    }}
                >
                    <LoginIcon fontSize="medium" />
                </Box>

                <Typography variant="h6" fontWeight={700} sx={{ color: '#ffffff', fontSize: '1.15rem' }}>
                    ورود به سامانه
                </Typography>
                <Typography
                    variant="caption"
                    sx={{ color: '#93c5fd', display: 'block', mt: 0.5, fontSize: '0.8rem' }}
                >
                    مهندسین مشاور طرح آفرینان هزاره امید (طاها)
                </Typography>
            </DialogTitle>

            <DialogContent sx={{ p: 3, pt: 3 }}>
                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <Stack spacing={2.5}>
                        {error && (
                            <Alert severity="error" sx={{ borderRadius: 2 }}>
                                {error}
                            </Alert>
                        )}

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
                                            <BadgeOutlined fontSize="small" color="primary" />
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
                                            <LockOutlined fontSize="small" color="primary" />
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
                            sx={{
                                mt: 1,
                                py: 1.25,
                                fontSize: '1rem',
                                fontWeight: 700,
                                borderRadius: 2,
                                background: 'linear-gradient(90deg, #0a1128 0%, #1d4ed8 100%)',
                                boxShadow: '0 4px 14px rgba(29, 78, 216, 0.35)',
                                '&:hover': {
                                    background: 'linear-gradient(90deg, #0c1635 0%, #2563eb 100%)',
                                    boxShadow: '0 6px 18px rgba(37, 99, 235, 0.45)',
                                },
                            }}
                        >
                            {loading ? 'در حال بررسی...' : 'ورود'}
                        </Button>
                    </Stack>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
