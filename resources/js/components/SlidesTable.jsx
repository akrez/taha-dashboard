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
    Image as ImageIcon,
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
    caption: '',
    description: '',
    sort_order: 0,
    is_visible: true,
};

export default function SlidesTable() {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [dialog, setDialog] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);

        try {
            const res = await axios.get('/api/slides');

            setSlides(res.data.data ?? []);
            setError('');
        } catch (err) {
            setError(apiError(err, 'بارگذاری اسلایدها ناموفق بود.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // Release the object URL created for the local image preview.
    useEffect(() => {
        return () => {
            if (preview?.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const openCreate = () => {
        setForm(emptyForm);
        setImage(null);
        setPreview(null);
        setFormError('');
        setDialog({ mode: 'create' });
    };

    const openEdit = (slide) => {
        setForm({
            caption: slide.caption ?? '',
            description: slide.description ?? '',
            sort_order: slide.sort_order ?? 0,
            is_visible: Boolean(slide.is_visible),
        });
        setImage(null);
        setPreview(slide.image_url ?? null);
        setFormError('');
        setDialog({ mode: 'edit', slide });
    };

    const closeDialog = () => {
        if (saving) {
            return;
        }

        setDialog(null);
    };

    const handleImage = (event) => {
        const file = event.target.files?.[0] ?? null;

        setImage(file);
        setPreview(file ? URL.createObjectURL(file) : dialog?.slide?.image_url ?? null);
    };

    const submit = async (event) => {
        event.preventDefault();
        setFormError('');
        setSaving(true);

        const payload = new FormData();
        payload.append('caption', form.caption);
        payload.append('description', form.description ?? '');
        payload.append('sort_order', String(form.sort_order ?? 0));
        payload.append('is_visible', form.is_visible ? '1' : '0');

        if (image) {
            payload.append('image', image);
        }

        try {
            if (dialog.mode === 'create') {
                await axios.post('/api/slides', payload);
            } else {
                // PHP cannot read multipart bodies on PUT, so spoof the method.
                payload.append('_method', 'PUT');
                await axios.post(`/api/slides/${dialog.slide.id}`, payload);
            }

            setDialog(null);
            await load();
        } catch (err) {
            setFormError(apiError(err, 'ذخیره اسلاید ناموفق بود.'));
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        setDeleteError('');
        setDeleting(true);

        try {
            await axios.delete(`/api/slides/${deleteTarget.id}`);

            setDeleteTarget(null);
            await load();
        } catch (err) {
            setDeleteError(apiError(err, 'حذف اسلاید ناموفق بود.'));
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">اسلایدها</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={openCreate}
                        sx={{ ml: 'auto' }}
                    >
                        اسلاید جدید
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
                                <TableCell>تصویر</TableCell>
                                <TableCell>عنوان</TableCell>
                                <TableCell>توضیح</TableCell>
                                <TableCell align="center">ترتیب</TableCell>
                                <TableCell align="center">وضعیت</TableCell>
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
                                slides.map((slide) => (
                                    <TableRow key={slide.id} hover>
                                        <TableCell>
                                            {slide.image_url ? (
                                                <Box
                                                    component="img"
                                                    src={slide.image_url}
                                                    alt={slide.caption}
                                                    sx={{
                                                        width: 96,
                                                        height: 40,
                                                        objectFit: 'cover',
                                                        borderRadius: 1,
                                                    }}
                                                />
                                            ) : (
                                                <ImageIcon color="disabled" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {slide.caption}
                                            </Typography>
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                maxWidth: 260,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {slide.description || '—'}
                                        </TableCell>
                                        <TableCell align="center">{slide.sort_order}</TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={slide.is_visible ? 'نمایش' : 'مخفی'}
                                                size="small"
                                                color={slide.is_visible ? 'success' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="ویرایش">
                                                <IconButton size="small" onClick={() => openEdit(slide)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="حذف">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => {
                                                        setDeleteError('');
                                                        setDeleteTarget(slide);
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            {!loading && slides.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        اسلایدی ثبت نشده است
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
                    {dialog?.mode === 'create' ? 'اسلاید جدید' : 'ویرایش اسلاید'}
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
                                    width: 160,
                                    height: 64,
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                    bgcolor: 'action.hover',
                                    visibility: preview ? 'visible' : 'hidden',
                                }}
                            />
                            <Button variant="outlined" component="label">
                                انتخاب تصویر
                                <input hidden type="file" accept="image/*" onChange={handleImage} />
                            </Button>
                        </Box>
                        <TextField
                            label="عنوان"
                            value={form.caption}
                            onChange={(event) =>
                                setForm((current) => ({ ...current, caption: event.target.value }))
                            }
                            required
                            fullWidth
                            autoFocus
                        />
                        <TextField
                            label="توضیح"
                            value={form.description}
                            onChange={(event) =>
                                setForm((current) => ({ ...current, description: event.target.value }))
                            }
                            fullWidth
                            multiline
                            minRows={2}
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
                                checked={form.is_visible}
                                onChange={(event) =>
                                    setForm((current) => ({
                                        ...current,
                                        is_visible: event.target.checked,
                                    }))
                                }
                            />
                            <Typography variant="body2">نمایش در صفحه اول</Typography>
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
                <DialogTitle>حذف اسلاید</DialogTitle>
                <DialogContent>
                    {deleteError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {deleteError}
                        </Alert>
                    )}
                    <Typography>آیا از حذف «{deleteTarget?.caption}» مطمئن هستید؟</Typography>
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
