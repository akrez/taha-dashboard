import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import {
    Alert,
    Box,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    Stack,
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
    ArrowBack as ArrowBackIcon,
    Check as SaveIcon,
    DeleteOutlined as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import MoneyField from './MoneyField';

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

function toPayload(row) {
    return {
        number: row.number === '' ? null : Number(row.number),
        duration: row.duration === '' ? null : Number(row.duration),
        amount_rials: row.amount_rials === '' ? null : Number(row.amount_rials),
        amount_currency: row.amount_currency === '' ? null : Number(row.amount_currency),
    };
}

export default function ProjectAddendaPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [project, setProject] = useState(null);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [savingKey, setSavingKey] = useState(null);
    const [deletingKey, setDeletingKey] = useState(null);

    const rowKey = useRef(0);

    const nextKey = () => {
        rowKey.current += 1;

        return `row-${rowKey.current}`;
    };

    const load = useCallback(async () => {
        setLoading(true);
        setLoadError('');

        try {
            const [projectRes, addendaRes] = await Promise.all([
                axios.get(`/api/projects/${id}`),
                axios.get(`/api/projects/${id}/addenda`),
            ]);

            setProject(projectRes.data.data ?? projectRes.data);
            setRows(
                (addendaRes.data.data ?? []).map((addendum) => ({
                    ...addendum,
                    _key: `db-${addendum.id}`,
                    error: '',
                })),
            );
        } catch (err) {
            setLoadError(apiError(err, 'بارگذاری الحاقیه‌ها ناموفق بود.'));
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    const setRowError = (key, message) => {
        setRows((current) => current.map((row) => (
            row._key === key ? { ...row, error: message } : row
        )));
    };

    const addRow = () => {
        setRows((current) => {
            const nextNumber = current.reduce(
                (max, row) => Math.max(max, Number(row.number) || 0),
                0,
            ) + 1;

            return [
                ...current,
                {
                    _key: nextKey(),
                    id: null,
                    number: nextNumber,
                    duration: '',
                    amount_rials: '',
                    amount_currency: '',
                    error: '',
                },
            ];
        });
    };

    const updateRow = (key, field) => (event) => {
        const { value } = event.target;

        setRows((current) => current.map((row) => (
            row._key === key ? { ...row, [field]: value } : row
        )));
    };

    const updateMoneyRow = (key, field) => (value) => {
        setRows((current) => current.map((row) => (
            row._key === key ? { ...row, [field]: value } : row
        )));
    };

    const saveRow = async (row) => {
        setSavingKey(row._key);
        setRowError(row._key, '');

        try {
            const response = row.id
                ? await axios.put(`/api/addenda/${row.id}`, toPayload(row))
                : await axios.post(`/api/projects/${id}/addenda`, toPayload(row));

            const saved = response.data.data ?? response.data;

            setRows((current) => current.map((item) => (
                item._key === row._key
                    ? { ...saved, _key: row._key, error: '' }
                    : item
            )));
        } catch (err) {
            setRowError(row._key, apiError(err, 'ذخیره الحاقیه ناموفق بود.'));
        } finally {
            setSavingKey(null);
        }
    };

    const deleteRow = async (row) => {
        if (!row.id) {
            setRows((current) => current.filter((item) => item._key !== row._key));

            return;
        }

        if (!window.confirm(`الحاقیه شماره ${row.number} حذف شود؟`)) {
            return;
        }

        setDeletingKey(row._key);
        setRowError(row._key, '');

        try {
            await axios.delete(`/api/addenda/${row.id}`);
            setRows((current) => current.filter((item) => item._key !== row._key));
        } catch (err) {
            setRowError(row._key, apiError(err, 'حذف الحاقیه ناموفق بود.'));
        } finally {
            setDeletingKey(null);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <IconButton onClick={() => navigate('/projects')} aria-label="بازگشت">
                        <ArrowBackIcon />
                    </IconButton>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6">الحاقیه‌های پروژه</Typography>
                        {project?.project_name && (
                            <Typography variant="body2" color="text.secondary" noWrap>
                                {project.project_name}
                            </Typography>
                        )}
                    </Box>
                </Stack>

                {loadError && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {loadError}
                    </Alert>
                )}

                <TableContainer sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: 120, whiteSpace: 'nowrap' }}>شماره الحاقیه</TableCell>
                                <TableCell sx={{ width: 140, whiteSpace: 'nowrap' }}>مدت الحاقیه (ماه)</TableCell>
                                <TableCell sx={{ width: 210, whiteSpace: 'nowrap' }}>مبلغ الحاقیه (ریال)</TableCell>
                                <TableCell sx={{ width: 210, whiteSpace: 'nowrap' }}>مبلغ الحاقیه (ارزی)</TableCell>
                                <TableCell />
                                <TableCell sx={{ width: 96 }} align="center">
                                    <Tooltip title="افزودن الحاقیه">
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={addRow}
                                            aria-label="افزودن الحاقیه"
                                        >
                                            <AddIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        هنوز الحاقیه‌ای ثبت نشده است. با دکمه + در ستون عملیات یک ردیف اضافه کنید.
                                    </TableCell>
                                </TableRow>
                            )}

                            {rows.map((row) => (
                                <TableRow key={row._key}>
                                    <TableCell>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            type="number"
                                            value={row.number}
                                            onChange={updateRow(row._key, 'number')}
                                            slotProps={{ htmlInput: { min: 1, step: 1 } }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            type="number"
                                            value={row.duration}
                                            onChange={updateRow(row._key, 'duration')}
                                            slotProps={{ htmlInput: { min: 0, step: 1 } }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <MoneyField
                                            size="small"
                                            fullWidth
                                            value={row.amount_rials}
                                            onChange={updateMoneyRow(row._key, 'amount_rials')}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ width: 210 }}>
                                        <MoneyField
                                            size="small"
                                            fullWidth
                                            value={row.amount_currency}
                                            onChange={updateMoneyRow(row._key, 'amount_currency')}
                                        />
                                    </TableCell>
                                    <TableCell />
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={0.5} justifyContent="center">
                                            <Tooltip title={row.id ? 'ذخیره تغییرات' : 'ثبت الحاقیه'}>
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        disabled={savingKey === row._key}
                                                        onClick={() => saveRow(row)}
                                                    >
                                                        {savingKey === row._key
                                                            ? <CircularProgress size={18} />
                                                            : <SaveIcon fontSize="small" />}
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="حذف">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        disabled={deletingKey === row._key}
                                                        onClick={() => deleteRow(row)}
                                                    >
                                                        {deletingKey === row._key
                                                            ? <CircularProgress size={18} />
                                                            : <DeleteIcon fontSize="small" />}
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}

                            {rows.filter((row) => row.error).map((row) => (
                                <TableRow key={`${row._key}-error`}>
                                    <TableCell colSpan={6} sx={{ border: 0, py: 0.5 }}>
                                        <Alert severity="error" onClose={() => setRowError(row._key, '')}>
                                            {row.error}
                                        </Alert>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
}
