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
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    IconButton,
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
    Add as AddIcon,
    Business as BusinessIcon,
    Edit as EditIcon,
} from '@mui/icons-material';

const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

/**
 * Keep only digits, converting Persian/Arabic digits to English so a leading
 * zero in a phone number is preserved.
 */
function onlyDigits(value) {
    return String(value ?? '')
        .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
        .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
        .replace(/\D/g, '');
}

function apiError(error, fallback = 'خطایی رخ داد.') {
    const errors = error.response?.data?.errors;

    if (errors) {
        const first = Object.values(errors)[0];

        if (Array.isArray(first) && first.length) {
            return first[0];
        }

        if (typeof first === 'string') {
            return first;
        }
    }

    return error.response?.data?.message ?? fallback;
}

const emptyForm = {
    name: '',
    representative_name: '',
    address: '',
    phone: '',
    is_active: true,
};

export default function EmployersTable() {
    const [employers, setEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [dialog, setDialog] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const [togglingId, setTogglingId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);

        try {
            const res = await axios.get('/api/employers');

            setEmployers(res.data.data ?? []);
            setError('');
        } catch (err) {
            setError(apiError(err, 'بارگذاری کارفرمایان ناموفق بود.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const openCreate = () => {
        setForm(emptyForm);
        setFormError('');
        setDialog({ mode: 'create' });
    };

    const openEdit = (employer) => {
        setForm({
            name: employer.name ?? '',
            representative_name: employer.representative_name ?? '',
            address: employer.address ?? '',
            phone: employer.phone ?? '',
            is_active: Boolean(employer.is_active),
        });
        setFormError('');
        setDialog({ mode: 'edit', employer });
    };

    const closeDialog = () => {
        if (saving) {
            return;
        }

        setDialog(null);
    };

    const setField = (field) => (event) => {
        setForm((current) => ({ ...current, [field]: event.target.value }));
    };

    const submit = async (event) => {
        event.preventDefault();
        setFormError('');
        setSaving(true);

        try {
            if (dialog.mode === 'create') {
                await axios.post('/api/employers', form);
            } else {
                await axios.put(`/api/employers/${dialog.employer.id}`, form);
            }

            setDialog(null);
            await load();
        } catch (err) {
            setFormError(apiError(err, 'ذخیره کارفرما ناموفق بود.'));
        } finally {
            setSaving(false);
        }
    };

    /**
     * Employers are never deleted; they are deactivated so their history and
     * project assignments remain intact.
     */
    const toggleActive = async (employer) => {
        setError('');
        setTogglingId(employer.id);

        try {
            await axios.put(`/api/employers/${employer.id}`, {
                name: employer.name,
                representative_name: employer.representative_name ?? '',
                address: employer.address ?? '',
                phone: employer.phone ?? '',
                is_active: !employer.is_active,
            });

            await load();
        } catch (err) {
            setError(apiError(err, 'تغییر وضعیت کارفرما ناموفق بود.'));
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">کارفرمایان</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={openCreate}
                        sx={{ ml: 'auto' }}
                    >
                        کارفرمای جدید
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>نام کارفرما</TableCell>
                                <TableCell>نماینده</TableCell>
                                <TableCell>آدرس</TableCell>
                                <TableCell>شماره تماس</TableCell>
                                <TableCell>تعداد پروژه</TableCell>
                                <TableCell>وضعیت</TableCell>
                                <TableCell>عملیات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        <CircularProgress size={24} sx={{ my: 2 }} />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employers.map((employer) => (
                                    <TableRow key={employer.id} hover>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {employer.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{employer.representative_name || '—'}</TableCell>
                                        <TableCell
                                            sx={{
                                                maxWidth: 260,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {employer.address || '—'}
                                        </TableCell>
                                        <TableCell dir="ltr">{employer.phone || '—'}</TableCell>
                                        <TableCell>{employer.projects_count ?? 0}</TableCell>
                                        <TableCell>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                                justifyContent="center"
                                            >
                                                <Chip
                                                    size="small"
                                                    label={employer.is_active ? 'فعال' : 'غیرفعال'}
                                                    color={employer.is_active ? 'success' : 'default'}
                                                    variant={employer.is_active ? 'filled' : 'outlined'}
                                                />
                                                <Tooltip
                                                    title={employer.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                                                >
                                                    <span>
                                                        <Switch
                                                            size="small"
                                                            checked={Boolean(employer.is_active)}
                                                            disabled={togglingId === employer.id}
                                                            onChange={() => toggleActive(employer)}
                                                        />
                                                    </span>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="ویرایش">
                                                <IconButton size="small" onClick={() => openEdit(employer)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            {!loading && employers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7}>
                                        کارفرمایی یافت نشد
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>

            <Dialog
                open={Boolean(dialog)}
                onClose={closeDialog}
                fullWidth
                maxWidth="sm"
                slotProps={{ paper: { component: 'form', onSubmit: submit } }}
            >
                <DialogTitle>
                    {dialog?.mode === 'create' ? 'کارفرمای جدید' : 'ویرایش کارفرما'}
                </DialogTitle>
                <DialogContent>
                    {formError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {formError}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        required
                        label="نام کارفرما"
                        value={form.name}
                        onChange={setField('name')}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="نام نماینده"
                        value={form.representative_name}
                        onChange={setField('representative_name')}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="آدرس"
                        value={form.address}
                        onChange={setField('address')}
                        margin="normal"
                        multiline
                        minRows={2}
                    />
                    <TextField
                        fullWidth
                        label="شماره تماس (فقط عدد)"
                        value={form.phone}
                        onChange={(event) => {
                            setForm((current) => ({
                                ...current,
                                phone: onlyDigits(event.target.value),
                            }));
                        }}
                        margin="normal"
                        slotProps={{ htmlInput: { dir: 'ltr', inputMode: 'numeric' } }}
                    />
                    <FormControlLabel
                        sx={{ mt: 2 }}
                        control={(
                            <Switch
                                checked={form.is_active}
                                onChange={(event) => {
                                    setForm((current) => ({
                                        ...current,
                                        is_active: event.target.checked,
                                    }));
                                }}
                            />
                        )}
                        label="کارفرما فعال است"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} disabled={saving}>
                        انصراف
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={saving || !form.name}
                        startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <BusinessIcon />}
                    >
                        {saving ? 'در حال ذخیره…' : 'ذخیره'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
