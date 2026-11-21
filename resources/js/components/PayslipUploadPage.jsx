import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    InputAdornment,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import {
    ArrowForward as BackIcon,
    Search as SearchIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import { formatJalaliDateTime, formatJalaliPeriod, toPersianDigits } from '../jalali';
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

const emptyMeta = {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
};

export default function PayslipUploadPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [upload, setUpload] = useState(null);
    const [payslips, setPayslips] = useState([]);
    const [meta, setMeta] = useState(emptyMeta);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState([]);
    const [toggling, setToggling] = useState(false);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(20);

    const [detailOpen, setDetailOpen] = useState(false);
    const [detailPayslip, setDetailPayslip] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailErrors, setDetailErrors] = useState([]);

    const load = useCallback(async () => {
        setLoading(true);

        try {
            const params = {
                page: page + 1,
                per_page: rowsPerPage,
            };

            if (search.trim()) {
                params.search = search.trim();
            }

            const response = await axios.get(`/api/payslips/uploads/${id}`, { params });

            setUpload(response.data.upload);
            setPayslips(response.data.payslips?.data ?? []);
            setMeta(response.data.payslips ?? emptyMeta);
            setError([]);
        } catch (err) {
            setError(apiErrors(err, 'بارگذاری جزئیات دوره ناموفق بود.'));
        } finally {
            setLoading(false);
        }
    }, [id, page, rowsPerPage, search]);

    useEffect(() => {
        const timer = setTimeout(load, search.trim() ? 300 : 0);

        return () => clearTimeout(timer);
    }, [load, search]);

    const toggleStatus = async () => {
        if (!upload) {
            return;
        }

        setToggling(true);
        setError([]);

        try {
            const response = await axios.patch(`/api/payslips/uploads/${upload.id}/status`, {
                is_active: !upload.is_active,
            });

            setUpload(response.data.data);
        } catch (err) {
            setError(apiErrors(err, 'تغییر وضعیت دوره ناموفق بود.'));
        } finally {
            setToggling(false);
        }
    };

    const openPayslip = async (payslip) => {
        setDetailOpen(true);
        setDetailPayslip(null);
        setDetailErrors([]);
        setDetailLoading(true);

        try {
            const response = await axios.get(
                `/api/payslips/uploads/${id}/payslips/${payslip.id}`,
            );

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

    const periodLabel = upload ? formatJalaliPeriod(upload.year, upload.month) : '';

    return (
        <Card>
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        justifyContent: 'space-between',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 2,
                        mb: 2,
                    }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Button
                            variant="text"
                            startIcon={<BackIcon />}
                            onClick={() => navigate('/payslips')}
                        >
                            بازگشت
                        </Button>
                        <Box>
                            <Typography variant="h6">
                                فیش حقوقی {periodLabel}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                مشاهده و جستجوی ردیف‌های این دوره
                            </Typography>
                        </Box>
                    </Stack>

                    {upload && (
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                            <Chip
                                color={upload.is_active ? 'success' : 'default'}
                                variant={upload.is_active ? 'filled' : 'outlined'}
                                label={upload.is_active ? 'فعال' : 'غیرفعال'}
                            />
                            <Button
                                variant="outlined"
                                color={upload.is_active ? 'warning' : 'success'}
                                onClick={toggleStatus}
                                disabled={toggling}
                                startIcon={toggling ? <CircularProgress size={16} /> : null}
                            >
                                {upload.is_active ? 'غیرفعال کردن دوره' : 'فعال کردن دوره'}
                            </Button>
                        </Stack>
                    )}
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

                {upload && (
                    <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                            <Chip size="small" label={`کل ردیف‌ها: ${toPersianDigits(upload.total_rows)}`} />
                            <Chip size="small" label={`ثبت‌شده: ${toPersianDigits(upload.imported_rows)}`} />
                            <Chip size="small" color="success" variant="outlined" label={`متصل: ${toPersianDigits(upload.linked_rows)}`} />
                            <Chip size="small" color="warning" variant="outlined" label={`بدون کاربر: ${toPersianDigits(upload.unlinked_rows)}`} />
                            <Chip size="small" color="error" variant="outlined" label={`ردشده: ${toPersianDigits(upload.skipped_rows)}`} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                            آپلودکننده: {upload.uploaded_by_name || '—'} | تاریخ آپلود:{' '}
                            {formatJalaliDateTime(upload.uploaded_at) || '—'} | فایل:{' '}
                            {upload.original_file_name || '—'}
                        </Typography>
                    </Box>
                )}

                <Box sx={{ mb: 2, maxWidth: 420 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="جستجو بر اساس نام یا کد پرسنلی"
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(0);
                        }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" color="action" />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>نام کارمند</TableCell>
                                <TableCell>کد پرسنلی</TableCell>
                                <TableCell>وضعیت اتصال</TableCell>
                                <TableCell>عملیات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        <CircularProgress size={24} sx={{ my: 3 }} />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payslips.map((payslip, index) => (
                                    <TableRow
                                        key={payslip.id}
                                        hover
                                        sx={{ cursor: 'pointer' }}
                                        onClick={() => openPayslip(payslip)}
                                    >
                                        <TableCell>
                                            {toPersianDigits(page * rowsPerPage + index + 1)}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {payslip.display_name || payslip.employee_name || '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell dir="ltr" sx={{ textAlign: 'right' }}>
                                            {toPersianDigits(payslip.national_code)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                color={payslip.is_linked ? 'success' : 'default'}
                                                variant={payslip.is_linked ? 'filled' : 'outlined'}
                                                label={payslip.is_linked ? 'کاربر متصل' : 'بدون کاربر'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                startIcon={<ViewIcon />}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    openPayslip(payslip);
                                                }}
                                            >
                                                مشاهده فیش
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            {!loading && payslips.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5}>
                                        ردیفی برای نمایش وجود ندارد.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={meta.total ?? 0}
                    page={page}
                    onPageChange={(_event, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(event) => {
                        setRowsPerPage(Number(event.target.value));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[10, 20, 50, 100]}
                    labelRowsPerPage="تعداد در صفحه"
                    labelDisplayedRows={({ from, to, count }) => `${toPersianDigits(from)}-${toPersianDigits(to)} از ${toPersianDigits(count)}`}
                />
            </CardContent>

            <PayslipDetailsDialog
                open={detailOpen}
                onClose={closePayslip}
                payslip={detailPayslip}
                loading={detailLoading}
                errors={detailErrors}
                periodLabel={periodLabel}
            />
        </Card>
    );
}
