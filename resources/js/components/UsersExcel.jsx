import { useState } from 'react';
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
    Stack,
    Typography,
} from '@mui/material';
import {
    Download as DownloadIcon,
    UploadFile as UploadIcon,
} from '@mui/icons-material';
import { can } from '../auth';

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

function responseFileName(headers) {
    const disposition = headers['content-disposition'] ?? '';
    const utfName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
    const plainName = disposition.match(/filename="?([^";]+)"?/i)?.[1];

    return utfName
        ? decodeURIComponent(utfName)
        : plainName ?? `users-${new Date().toISOString().slice(0, 10)}.xlsx`;
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

export default function UsersExcel() {
    const canImport = can('UserManager');
    const canExport = can('UserIndex');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [deactivateMissing, setDeactivateMissing] = useState(false);
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [error, setError] = useState([]);
    const [formError, setFormError] = useState([]);
    const [result, setResult] = useState(null);

    const openDialog = () => {
        setFile(null);
        setDeactivateMissing(false);
        setFormError([]);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        if (!importing) {
            setDialogOpen(false);
        }
    };

    const exportUsers = async () => {
        setExporting(true);
        setError([]);

        try {
            const response = await axios.get('/api/users/export', { responseType: 'blob' });
            const url = URL.createObjectURL(response.data);
            const link = document.createElement('a');

            link.href = url;
            link.download = responseFileName(response.headers);
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            setError(apiErrors(err, 'دریافت خروجی کاربران ناموفق بود.'));
        } finally {
            setExporting(false);
        }
    };

    const importUsers = async (event) => {
        event.preventDefault();

        if (!file) {
            setFormError(['فایل اکسل را انتخاب کنید.']);
            return;
        }

        const payload = new FormData();
        payload.append('file', file);
        payload.append('deactivate_missing', deactivateMissing ? '1' : '0');

        setImporting(true);
        setFormError([]);

        try {
            const response = await axios.post('/api/users/import', payload);

            setResult(response.data.data);
            setError([]);
            setDialogOpen(false);
        } catch (err) {
            setFormError(apiErrors(err, 'ورود اطلاعات کاربران ناموفق بود.'));
        } finally {
            setImporting(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">کاربران</Typography>
                    <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                        {canExport && (
                            <Button
                                variant="outlined"
                                startIcon={exporting ? <CircularProgress size={18} /> : <DownloadIcon />}
                                onClick={exportUsers}
                                disabled={exporting}
                            >
                                خروجی Excel
                            </Button>
                        )}
                        {canImport && (
                            <Button
                                variant="contained"
                                startIcon={<UploadIcon />}
                                onClick={openDialog}
                            >
                                ورود فایل
                            </Button>
                        )}
                    </Stack>
                </Box>

                <ErrorAlert messages={error} sx={{ mb: 2 }} />

                {result && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            فایل کاربران با موفقیت پردازش شد.
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            <Chip size="small" label={`کل ردیف‌ها: ${result.total_rows}`} />
                            <Chip size="small" label={`ایجادشده: ${result.created_users}`} />
                            <Chip size="small" label={`به‌روزشده: ${result.updated_users}`} />
                            <Chip size="small" label={`غیرفعال‌شده: ${result.deactivated_users}`} />
                        </Box>
                    </Alert>
                )}

                <Alert severity="info">
                    <Typography variant="body2" component="div">
                        <Box component="ul" sx={{ my: 0, pr: 2 }}>
                            <li>برای دریافت قالب استاندارد، ابتدا از دکمه «خروجی Excel» استفاده کنید.</li>
                            <li>کد ملی الزامی است و ارقام فارسی آن هنگام ورود به انگلیسی تبدیل می‌شوند.</li>
                            <li>رمز خالی برای کاربران موجود بدون تغییر می‌ماند و برای کاربران جدید برابر کد ملی خواهد بود.</li>
                            <li>روابط سازمانی جدید به‌صورت خودکار ایجاد می‌شوند.</li>
                        </Box>
                    </Typography>
                </Alert>
            </CardContent>

            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                fullWidth
                maxWidth="sm"
                slotProps={{ paper: { component: 'form', onSubmit: importUsers } }}
            >
                <DialogTitle>ورود فایل کاربران</DialogTitle>
                <DialogContent>
                    <ErrorAlert messages={formError} sx={{ mb: 2 }} />

                    <Button
                        component="label"
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        disabled={importing}
                    >
                        انتخاب فایل
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

                    <Typography variant="body2" color={file ? 'text.primary' : 'text.secondary'} sx={{ mt: 1 }}>
                        {file ? file.name : 'فرمت‌های مجاز: XLSX، XLS و CSV'}
                    </Typography>

                    <FormControlLabel
                        control={(
                            <Checkbox
                                checked={deactivateMissing}
                                onChange={(event) => setDeactivateMissing(event.target.checked)}
                                disabled={importing}
                            />
                        )}
                        label="کاربرانی که در فایل حضور ندارند غیرفعال شوند"
                    />

                    {deactivateMissing && (
                        <Alert severity="warning" sx={{ mt: 1 }}>
                            تمام کاربران خارج از فایل، به‌جز سوپرادمین‌ها، غیرفعال خواهند شد.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} disabled={importing}>
                        انصراف
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={!file || importing}
                        startIcon={importing ? <CircularProgress size={18} color="inherit" /> : <UploadIcon />}
                    >
                        {importing ? 'در حال پردازش…' : 'ورود فایل'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
