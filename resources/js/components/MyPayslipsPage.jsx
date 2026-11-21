import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import { ReceiptLong as ReceiptIcon } from '@mui/icons-material';
import { formatJalaliDateTime, formatJalaliPeriod, toPersianDigits } from '../jalali';
import { formatPayslipValue } from '../payslipFields';
import PayslipDetailsDialog from './PayslipDetailsDialog';

const NET_PAY_FIELD = { money: true };

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
            const response = await axios.get('/api/my-payslips');
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
            const response = await axios.get(`/api/my-payslips/${item.id}`);
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
                        فیش‌های حقوقی منتشرشدهٔ شما به تفکیک دوره.
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
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                                        <Typography variant="subtitle1" fontWeight={700}>
                                            {formatJalaliPeriod(item.year, item.month)}
                                        </Typography>
                                        <Chip size="small" color="success" variant="outlined" label="منتشرشده" />
                                    </Stack>

                                    <Divider sx={{ my: 1.25 }} />

                                    <Typography variant="caption" color="text.secondary">
                                        خالص پرداختی
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        sx={{ fontVariantNumeric: 'tabular-nums', mt: 0.25 }}
                                    >
                                        {item.net_pay === '' || item.net_pay === null
                                            ? '—'
                                            : formatPayslipValue(NET_PAY_FIELD, item.net_pay)}
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        justifyContent="space-between"
                                        gap={1}
                                        sx={{ mt: 1.5 }}
                                    >
                                        <Typography variant="caption" color="text.secondary">
                                            {formatJalaliDateTime(item.uploaded_at) || '—'}
                                        </Typography>
                                        <Button size="small">مشاهدهٔ فیش</Button>
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
