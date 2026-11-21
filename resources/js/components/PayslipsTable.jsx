import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    MenuItem,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    CloudUpload as UploadIcon,
    Visibility as ViewIcon,
} from '@mui/icons-material';
import {
    JALALI_MONTHS,
    currentJalaliPeriod,
    formatJalaliDateTime,
    formatJalaliPeriod,
    toPersianDigits,
} from '../jalali';

const MAX_FILE_SIZE = 20 * 1024 * 1024;

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

function ErrorAlert({ messages, sx }) {
    if (!messages.length) {
        return null;
    }

    return (
        <Alert severity="error" sx={sx}>
            {messages.length === 1 ? (
                messages[0]
            ) : (
                <Box component="ul" sx={{ m: 0, pr: 2 }}>
                    {messages.map((message, index) => (
                        <li key={`${message}-${index}`}>{message}</li>
                    ))}
                </Box>
            )}
        </Alert>
    );
}

function Statistics({ upload }) {
    return (
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            <Chip size="small" label={`ثبت‌شده: ${toPersianDigits(upload.imported_rows)}`} />
            <Chip
                size="small"
                color={upload.linked_rows > 0 ? 'success' : 'default'}
                variant="outlined"
                label={`متصل: ${toPersianDigits(upload.linked_rows)}`}
            />
            <Chip
                size="small"
                color={upload.unlinked_rows > 0 ? 'warning' : 'default'}
                variant="outlined"
                label={`بدون کاربر: ${toPersianDigits(upload.unlinked_rows)}`}
            />
            <Chip
                size="small"
                color={upload.skipped_rows > 0 ? 'error' : 'default'}
                variant="outlined"
                label={`ردشده: ${toPersianDigits(upload.skipped_rows)}`}
            />
        </Stack>
    );
}

export default function PayslipsTable() {
    const navigate = useNavigate();

    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState([]);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState(() => currentJalaliPeriod());
    const [file, setFile] = useState(null);
    const [confirmReplace, setConfirmReplace] = useState(false);
    const [formError, setFormError] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);

        try {
            const response = await axios.get('/api/payslips/uploads');
            setUploads(response.data.data ?? []);
            setError([]);
        } catch (err) {
            setError(apiErrors(err, 'بارگذاری دوره‌های فیش حقوقی ناموفق بود.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const existingUpload = useMemo(
        () => uploads.find(
            (upload) => upload.year === Number(form.year) && upload.month === Number(form.month),
        ),
        [uploads, form.year, form.month],
    );

    const yearOptions = useMemo(() => {
        const currentYear = currentJalaliPeriod().year;
        const years = new Set([
            currentYear - 2,
            currentYear - 1,
            currentYear,
            currentYear + 1,
            currentYear + 2,
            ...uploads.map((upload) => upload.year),
        ]);

        return [...years].sort((a, b) => b - a);
    }, [uploads]);

    const openDialog = () => {
        setForm(currentJalaliPeriod());
        setFile(null);
        setConfirmReplace(false);
        setFormError([]);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        if (!uploading) {
            setDialogOpen(false);
        }
    };

    const changePeriod = (key, value) => {
        setForm((current) => ({ ...current, [key]: Number(value) }));
        setConfirmReplace(false);
        setFormError([]);
    };

    const submit = async (event) => {
        event.preventDefault();

        if (!file) {
            setFormError(['فایل اکسل را انتخاب کنید.']);
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setFormError(['حجم فایل نباید بیشتر از ۲۰ مگابایت باشد.']);
            return;
        }

        if (existingUpload && !confirmReplace) {
            setFormError(['برای جایگزینی دورهٔ موجود، تأیید جایگزینی را علامت بزنید.']);
            return;
        }

        const payload = new FormData();
        payload.append('file', file);
        payload.append('year', String(form.year));
        payload.append('month', String(form.month));

        setUploading(true);
        setFormError([]);
        setResult(null);

        try {
            const response = await axios.post('/api/payslips/uploads', payload);

            setResult(response.data);
            setDialogOpen(false);
            await load();
        } catch (err) {
            setFormError(apiErrors(err, 'آپلود فایل فیش حقوقی ناموفق بود.'));
        } finally {
            setUploading(false);
        }
    };

    const toggleStatus = async (upload) => {
        setUpdatingId(upload.id);
        setError([]);

        try {
            await axios.patch(`/api/payslips/uploads/${upload.id}/status`, {
                is_active: !upload.is_active,
            });

            await load();
        } catch (err) {
            setError(apiErrors(err, 'تغییر وضعیت دوره ناموفق بود.'));
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <Card>
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 2,
                        mb: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h6">فیش‌های حقوقی</Typography>
                        <Typography variant="caption" color="text.secondary">
                            هر دوره حداکثر یک فایل دارد؛ آپلود مجدد همان دوره، فایل قبلی را جایگزین می‌کند.
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<UploadIcon />}
                        onClick={openDialog}
                    >
                        آپلود فیش حقوقی
                    </Button>
                </Box>

                <ErrorAlert messages={error} sx={{ mb: 2 }} />

                {result && (
                    <Alert
                        severity={result.summary?.skipped_rows > 0 ? 'warning' : 'success'}
                        sx={{ mb: 2 }}
                    >
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            {result.message}
                        </Typography>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                            <Chip size="small" label={`کل ردیف‌ها: ${toPersianDigits(result.summary?.total_rows ?? 0)}`} />
                            <Chip size="small" label={`ثبت‌شده: ${toPersianDigits(result.summary?.imported_rows ?? 0)}`} />
                            <Chip size="small" color="success" label={`متصل: ${toPersianDigits(result.summary?.linked_rows ?? 0)}`} />
                            <Chip size="small" color="warning" label={`بدون کاربر: ${toPersianDigits(result.summary?.unlinked_rows ?? 0)}`} />
                            <Chip size="small" color="error" label={`ردشده: ${toPersianDigits(result.summary?.skipped_rows ?? 0)}`} />
                        </Stack>

                        {result.warnings?.length > 0 && (
                            <Box component="ul" sx={{ m: 0, mt: 1.5, pr: 2 }}>
                                {result.warnings.map((warning, index) => (
                                    <li key={`${warning.row}-${index}`}>
                                        ردیف {toPersianDigits(warning.row)}: {warning.message}
                                    </li>
                                ))}
                            </Box>
                        )}

                        {result.data?.id && (
                            <Button
                                size="small"
                                sx={{ mt: 1 }}
                                onClick={() => navigate(`/payslips/${result.data.id}`)}
                            >
                                مشاهدهٔ دوره
                            </Button>
                        )}
                    </Alert>
                )}

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>دوره</TableCell>
                                <TableCell>وضعیت</TableCell>
                                <TableCell>آمار ردیف‌ها</TableCell>
                                <TableCell>آپلودکننده</TableCell>
                                <TableCell>تاریخ آپلود</TableCell>
                                <TableCell>فایل</TableCell>
                                <TableCell>عملیات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <CircularProgress size={24} sx={{ my: 3 }} />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                uploads.map((upload) => (
                                    <TableRow key={upload.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={700}>
                                                {formatJalaliPeriod(upload.year, upload.month)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Chip
                                                    size="small"
                                                    color={upload.is_active ? 'success' : 'default'}
                                                    variant={upload.is_active ? 'filled' : 'outlined'}
                                                    label={upload.is_active ? 'فعال' : 'غیرفعال'}
                                                />
                                                <Tooltip title={upload.is_active ? 'غیرفعال کردن دوره' : 'فعال کردن دوره'}>
                                                    <span>
                                                        <Switch
                                                            size="small"
                                                            checked={Boolean(upload.is_active)}
                                                            onChange={() => toggleStatus(upload)}
                                                            disabled={updatingId === upload.id}
                                                        />
                                                    </span>
                                                </Tooltip>
                                                {updatingId === upload.id && <CircularProgress size={16} />}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Statistics upload={upload} />
                                        </TableCell>
                                        <TableCell>{upload.uploaded_by_name || '—'}</TableCell>
                                        <TableCell>{formatJalaliDateTime(upload.uploaded_at) || '—'}</TableCell>
                                        <TableCell
                                            sx={{
                                                maxWidth: 220,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {upload.original_file_name || '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                startIcon={<ViewIcon />}
                                                onClick={() => navigate(`/payslips/${upload.id}`)}
                                            >
                                                مشاهده
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            {!loading && uploads.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        هنوز فیش حقوقی‌ای آپلود نشده است.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>

            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                fullWidth
                maxWidth="sm"
                slotProps={{ paper: { component: 'form', onSubmit: submit } }}
            >
                <DialogTitle>آپلود فیش حقوقی</DialogTitle>
                <DialogContent>
                    <ErrorAlert messages={formError} sx={{ mb: 2 }} />

                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            select
                            fullWidth
                            label="سال شمسی"
                            value={form.year}
                            onChange={(event) => changePeriod('year', event.target.value)}
                            disabled={uploading}
                        >
                            {yearOptions.map((year) => (
                                <MenuItem key={year} value={year}>
                                    {toPersianDigits(year)}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            fullWidth
                            label="ماه شمسی"
                            value={form.month}
                            onChange={(event) => changePeriod('month', event.target.value)}
                            disabled={uploading}
                        >
                            {JALALI_MONTHS.map((month, index) => (
                                <MenuItem key={month} value={index + 1}>
                                    {month}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box>
                            <Button
                                component="label"
                                variant="outlined"
                                startIcon={<UploadIcon />}
                                disabled={uploading}
                            >
                                انتخاب فایل اکسل
                                <input
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    hidden
                                    onChange={(event) => {
                                        setFile(event.target.files?.[0] ?? null);
                                        setFormError([]);
                                    }}
                                />
                            </Button>
                            <Typography
                                variant="body2"
                                color={file ? 'text.primary' : 'text.secondary'}
                                sx={{ mt: 1 }}
                            >
                                {file
                                    ? `${file.name} (${toPersianDigits((file.size / 1024 / 1024).toFixed(1))} مگابایت)`
                                    : 'فرمت‌های مجاز: XLSX، XLS و CSV — حداکثر ۲۰ مگابایت'}
                            </Typography>
                        </Box>

                        {existingUpload && (
                            <>
                                <Alert severity="warning">
                                    برای {formatJalaliPeriod(form.year, form.month)} قبلاً فایلی ثبت شده است.
                                    با ادامه، رکورد قبلی و همهٔ ردیف‌های فیش آن حذف و فایل جدید به‌صورت
                                    غیرفعال ثبت می‌شود.
                                </Alert>
                                <FormControlLabel
                                    control={(
                                        <Checkbox
                                            checked={confirmReplace}
                                            onChange={(event) => setConfirmReplace(event.target.checked)}
                                            disabled={uploading}
                                        />
                                    )}
                                    label="با جایگزینی دورهٔ موجود موافقم"
                                />
                            </>
                        )}

                        <Alert severity="info">
                            فقط ستون «کد پرسنلی» الزامی است. اگر ستونی در فایل نباشد خالی ذخیره می‌شود
                            و ستون‌های اضافی نادیده گرفته می‌شوند.
                        </Alert>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} disabled={uploading}>
                        انصراف
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={!file || uploading || (Boolean(existingUpload) && !confirmReplace)}
                        startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <UploadIcon />}
                    >
                        {uploading ? 'در حال پردازش…' : 'آپلود و ثبت'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
