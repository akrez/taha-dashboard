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
    DeleteOutlined as DeleteIcon,
    Edit as EditIcon,
    Link as LinkIcon,
} from '@mui/icons-material';

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
    title: '',
    url: '',
    sort_order: 0,
    show_in_top: true,
    show_in_bottom: false,
};

export default function LinksTable() {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [dialog, setDialog] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);

        try {
            const res = await axios.get('/api/links');

            setLinks(res.data.data ?? []);
            setError('');
        } catch (err) {
            setError(apiError(err, 'بارگذاری لینک‌ها ناموفق بود.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // Release the object URL created for the local file preview.
    useEffect(() => {
        return () => {
            if (preview?.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const openCreate = () => {
        setForm(emptyForm);
        setFile(null);
        setPreview(null);
        setFormError('');
        setDialog({ mode: 'create' });
    };

    const openEdit = (link) => {
        setForm({
            title: link.title ?? '',
            url: link.url ?? '',
            sort_order: link.sort_order ?? 0,
            show_in_top: Boolean(link.show_in_top),
            show_in_bottom: Boolean(link.show_in_bottom),
        });
        setFile(null);
        setPreview(link.file_url ?? null);
        setFormError('');
        setDialog({ mode: 'edit', link });
    };

    const closeDialog = () => {
        if (saving) {
            return;
        }

        setDialog(null);
    };

    const handleFile = (event) => {
        const selected = event.target.files?.[0] ?? null;

        setFile(selected);
        setPreview(selected ? URL.createObjectURL(selected) : dialog?.link?.file_url ?? null);
    };

    const submit = async (event) => {
        event.preventDefault();
        setFormError('');
        setSaving(true);

        const payload = new FormData();
        payload.append('title', form.title);
        payload.append('url', form.url ?? '');
        payload.append('sort_order', String(form.sort_order ?? 0));
        payload.append('show_in_top', form.show_in_top ? '1' : '0');
        payload.append('show_in_bottom', form.show_in_bottom ? '1' : '0');

        if (file) {
            payload.append('file', file);
        }

        try {
            if (dialog.mode === 'create') {
                await axios.post('/api/links', payload);
            } else {
                // PHP cannot read multipart bodies on PUT, so spoof the method.
                payload.append('_method', 'PUT');
                await axios.post(`/api/links/${dialog.link.id}`, payload);
            }

            setDialog(null);
            await load();
        } catch (err) {
            setFormError(apiError(err, 'ذخیره لینک ناموفق بود.'));
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        setDeleteError('');
        setDeleting(true);

        try {
            await axios.delete(`/api/links/${deleteTarget.id}`);

            setDeleteTarget(null);
            await load();
        } catch (err) {
            setDeleteError(apiError(err, 'حذف لینک ناموفق بود.'));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">لینک‌ها</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={openCreate}
                        sx={{ ml: 'auto' }}
                    >
                        لینک جدید
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
                                <TableCell>آیکن</TableCell>
                                <TableCell>عنوان</TableCell>
                                <TableCell>آدرس</TableCell>
                                <TableCell align="center">ترتیب</TableCell>
                                <TableCell align="center">محل نمایش</TableCell>
                                <TableCell align="center">عملیات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <CircularProgress size={24} sx={{ my: 2 }} />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                links.map((link) => (
                                    <TableRow key={link.id} hover>
                                        <TableCell>
                                            {link.file_url ? (
                                                <Box
                                                    component="img"
                                                    src={link.file_url}
                                                    alt={link.title}
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        objectFit: 'contain',
                                                        borderRadius: 1,
                                                    }}
                                                />
                                            ) : (
                                                <LinkIcon color="disabled" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {link.title}
                                            </Typography>
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                maxWidth: 280,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {link.url ? (
                                                <Box
                                                    component="a"
                                                    href={link.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    sx={{ color: 'primary.main' }}
                                                >
                                                    {link.url}
                                                </Box>
                                            ) : (
                                                '—'
                                            )}
                                        </TableCell>
                                        <TableCell align="center">{link.sort_order}</TableCell>
                                        <TableCell align="center">
                                            <Stack
                                                direction="row"
                                                spacing={0.5}
                                                justifyContent="center"
                                                flexWrap="wrap"
                                                useFlexGap
                                            >
                                                {link.show_in_top && (
                                                    <Chip label="بالا" size="small" color="primary" />
                                                )}
                                                {link.show_in_bottom && (
                                                    <Chip label="پایین" size="small" color="success" />
                                                )}
                                                {!link.show_in_top && !link.show_in_bottom && (
                                                    <Chip label="مخفی" size="small" />
                                                )}
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="ویرایش">
                                                <IconButton size="small" onClick={() => openEdit(link)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="حذف">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => {
                                                        setDeleteError('');
                                                        setDeleteTarget(link);
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            {!loading && links.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        لینکی ثبت نشده است
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
                    {dialog?.mode === 'create' ? 'لینک جدید' : 'ویرایش لینک'}
                </DialogTitle>
                <DialogContent>
                    {formError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {formError}
                        </Alert>
                    )}
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                component="img"
                                src={preview ?? ''}
                                alt=""
                                sx={{
                                    width: 64,
                                    height: 64,
                                    objectFit: 'contain',
                                    borderRadius: 1,
                                    bgcolor: 'action.hover',
                                    visibility: preview ? 'visible' : 'hidden',
                                }}
                            />
                            <Button variant="outlined" component="label">
                                انتخاب آیکن
                                <input hidden type="file" onChange={handleFile} />
                            </Button>
                        </Box>
                        <TextField
                            label="عنوان"
                            value={form.title}
                            onChange={(event) =>
                                setForm((current) => ({ ...current, title: event.target.value }))
                            }
                            required
                            fullWidth
                            autoFocus
                        />
                        <TextField
                            label="آدرس"
                            value={form.url}
                            onChange={(event) =>
                                setForm((current) => ({ ...current, url: event.target.value }))
                            }
                            required
                            fullWidth
                            placeholder="https://example.com"
                            slotProps={{ htmlInput: { dir: 'ltr', style: { textAlign: 'left' } } }}
                        />
                        <TextField
                            label="ترتیب"
                            type="number"
                            value={form.sort_order}
                            onChange={(event) =>
                                setForm((current) => ({
                                    ...current,
                                    sort_order: Number(event.target.value),
                                }))
                            }
                            fullWidth
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Switch
                                checked={form.show_in_top}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        show_in_top: event.target.checked,
                                    }))
                                }
                            />
                            <Typography variant="body2">نمایش در بالا</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Switch
                                checked={form.show_in_bottom}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        show_in_bottom: event.target.checked,
                                    }))
                                }
                            />
                            <Typography variant="body2">نمایش در پایین</Typography>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} disabled={saving}>
                        انصراف
                    </Button>
                    <Button type="submit" variant="contained" disabled={saving}>
                        ذخیره
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={Boolean(deleteTarget)}
                onClose={() => !deleting && setDeleteTarget(null)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>حذف لینک</DialogTitle>
                <DialogContent>
                    {deleteError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {deleteError}
                        </Alert>
                    )}
                    <Typography>آیا از حذف «{deleteTarget?.title}» مطمئن هستید؟</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
                        انصراف
                    </Button>
                    <Button color="error" variant="contained" onClick={confirmDelete} disabled={deleting}>
                        حذف
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
