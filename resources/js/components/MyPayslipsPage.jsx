import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
    Alert,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import { ReceiptLong as ReceiptIcon } from '@mui/icons-material';
import { formatJalaliPeriod, toPersianDigits } from '../jalali';
import PayslipDetailsDialog from './PayslipDetailsDialog';

function apiErrors(error, fallback = 'خطایی رخ داد.') {
    const errors = error.response?.data?.errors;

    if (errors) {
        const messages = Object.values(errors).flat().filter(Boolean);

        if (messages.length) {
            return messages;
        }
    }

    return [error.response?.data?.message ?? fallback];
}

function InfoRow({ label, value }) {
    const text = value === null || value === undefined || value === '' ? '—' : toPersianDigits(value);

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 2,
                py: 0.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-of-type': { borderBottom: 0 },
            }}
        >
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                {label}
            </Typography>
            <Typography
                variant="body2"
                fontWeight={600}
                sx={{ wordBreak: 'break-word', textAlign: 'left' }}
            >
                {text}
            </Typography>
        </Box>
    );
}

export default function MyPayslipsPage() {
    const [payslips, setPayslips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState([]);

    const [detailOpen, setDetailOpen] = useState(false);
    const [detailPayslip, setDetailPayslip] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailErrors, setDetailErrors] = useState([]);
    const [detailPeriod, setDetailPeriod] = useState('');

    const load = useCallback(async () => {
        setLoading(true);

        try {
            const response = await axios.get('/api/payslips/mine');
            setPayslips(response.data.data ?? []);
            setError([]);
        } catch (err) {
            setError(apiErrors(err, 'بارگذاری فیش‌های حقوقی ناموفق بود.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const openPayslip = async (item) => {
        setDetailOpen(true);
        setDetailPayslip(null);
        setDetailErrors([]);
        setDetailLoading(true);
        setDetailPeriod(formatJalaliPeriod(item.year, item.month));

        try {
            const response = await axios.get(`/api/payslips/mine/${item.id}`);
            setDetailPayslip(response.data.data);
        } catch (err) {
            setDetailErrors(apiErrors(err, 'دریافت فیش حقوقی ناموفق بود.'));
        } finally {
            setDetailLoading(false);
        }
    };

    const closePayslip = () => {
        if (!detailLoading) {
            setDetailOpen(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="h6">فیش حقوقی من</Typography>
                    <Typography variant="caption" color="text.secondary">
                        فیش‌های حقوقی شما به تفکیک دوره. برای مشاهده روی هر کارت کلیک کنید.
                    </Typography>
                </Box>

                {error.length > 0 && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error.length === 1 ? (
                            error[0]
                        ) : (
                            <Box component="ul" sx={{ m: 0, pr: 2 }}>
                                {error.map((message, index) => (
                                    <li key={`${message}-${index}`}>{message}</li>
                                ))}
                            </Box>
                        )}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : payslips.length === 0 ? (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1,
                            py: 6,
                            color: 'text.secondary',
                            textAlign: 'center',
                        }}
                    >
                        <ReceiptIcon fontSize="large" />
                        <Typography variant="body1">
                            هنوز فیش حقوقی‌ای برای شما منتشر نشده است.
                        </Typography>
                        <Typography variant="caption">
                            پس از انتشار فیش توسط واحد منابع انسانی، اینجا نمایش داده می‌شود.
                        </Typography>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: 'grid',
                            gap: 1.5,
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, minmax(0, 1fr))',
                                md: 'repeat(3, minmax(0, 1fr))',
                            },
                        }}
                    >
                        {payslips.map((item) => (
                            <Card
                                key={item.id}
                                variant="outlined"
                                sx={{
                                    cursor: 'pointer',
                                    transition: 'border-color 120ms ease, box-shadow 120ms ease',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        boxShadow: 2,
                                    },
                                }}
                                onClick={() => openPayslip(item)}
                            >
                                <CardContent>
                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                        <ReceiptIcon fontSize="small" color="action" />
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            {formatJalaliPeriod(item.year, item.month)}
                                        </Typography>
                                    </Stack>

                                    <Divider sx={{ my: 1.25 }} />

                                    <Stack spacing={0.75}>
                                        <InfoRow label="سمت" value={item.position} />
                                        <InfoRow label="گروه" value={item.group} />
                                        <InfoRow label="محل خدمت" value={item.workplace} />
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                )}
            </CardContent>

            <PayslipDetailsDialog
                open={detailOpen}
                onClose={closePayslip}
                payslip={detailPayslip}
                loading={detailLoading}
                errors={detailErrors}
                periodLabel={detailPeriod}
                title="فیش حقوقی من"
                showLinkStatus={false}
            />
        </Card>
    );
}
