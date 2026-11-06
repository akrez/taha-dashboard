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
    MenuItem,
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
    name: '',
    employer_id: '',
    manager_id: '',
    is_active: true,
};

export default function ProjectsTable() {
    const [projects, setProjects] = useState([]);
    const [options, setOptions] = useState({ employers: [], users: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [dialog, setDialog] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteError, setDeleteError] = useState('');
    const [deleting, setDeleting] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);

        try {
            const [projectsRes, optionsRes] = await Promise.all([
                axios.get('/api/projects'),
                axios.get('/api/projects/options'),
            ]);

            setProjects(projectsRes.data.data ?? []);
            setOptions({
                employers: optionsRes.data.employers ?? [],
                users: optionsRes.data.users ?? [],
            });
            setError('');
        } catch (err) {
            setError(apiError(err, 'بارگذاری پروژه‌ها ناموفق بود.'));
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

    const openEdit = (project) => {
        setForm({
            name: project.name ?? '',
            employer_id: project.employer_id ?? '',
            manager_id: project.manager_id ?? '',
            is_active: Boolean(project.is_active),
        });
        setFormError('');
        setDialog({ mode: 'edit', project });
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

        const payload = {
            name: form.name,
            employer_id: form.employer_id === '' ? null : Number(form.employer_id),
            manager_id: form.manager_id === '' ? null : Number(form.manager_id),
            is_active: form.is_active,
        };

        try {
            if (dialog.mode === 'create') {
                await axios.post('/api/projects', payload);
            } else {
                await axios.put(`/api/projects/${dialog.project.id}`, payload);
            }

            setDialog(null);
            await load();
        } catch (err) {
            setFormError(apiError(err, 'ذخیره پروژه ناموفق بود.'));
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        setDeleteError('');
        setDeleting(true);

        try {
            await axios.delete(`/api/projects/${deleteTarget.id}`);

            setDeleteTarget(null);
            await load();
        } catch (err) {
            setDeleteError(apiError(err, 'حذف پروژه ناموفق بود.'));
        } finally {
            setDeleting(false);
        }
    };

    // Inactive employers are hidden from the dropdown, but keep the employer
    // currently assigned to the project so editing does not clear it.
    const employerChoices = [...options.employers];

    if (
        dialog?.project?.employer
        && !employerChoices.some((employer) => employer.id === dialog.project.employer.id)
    ) {
        employerChoices.push(dialog.project.employer);
    }

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">پروژه‌ها</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={openCreate}
                        sx={{ ml: 'auto' }}
                    >
                        پروژه جدید
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
                                <TableCell>شناسه</TableCell>
                                <TableCell>نام پروژه</TableCell>
                                <TableCell>کارفرما</TableCell>
                                <TableCell>مدیر پروژه</TableCell>
                                <TableCell>وضعیت</TableCell>
                                <TableCell>عملیات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        <CircularProgress size={24} sx={{ my: 2 }} />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                projects.map((project) => (
                                    <TableRow key={project.id} hover>
                                        <TableCell>{project.id}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {project.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            {project.employer?.name || '—'}
                                            {project.employer?.is_active === false && (
                                                <Chip
                                                    size="small"
                                                    label="غیرفعال"
                                                    variant="outlined"
                                                    sx={{ ml: 1 }}
                                                />
                                            )}
                                        </TableCell>
                                        <TableCell>{project.manager?.name || '—'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={project.is_active ? 'فعال' : 'غیرفعال'}
                                                color={project.is_active ? 'success' : 'default'}
                                                variant={project.is_active ? 'filled' : 'outlined'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="ویرایش">
                                                <IconButton size="small" onClick={() => openEdit(project)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="حذف">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => {
                                                        setDeleteError('');
                                                        setDeleteTarget(project);
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            {!loading && projects.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6}>
                                        پروژه‌ای یافت نشد
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
                    {dialog?.mode === 'create' ? 'پروژه جدید' : 'ویرایش پروژه'}
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
                        label="نام پروژه"
                        value={form.name}
                        onChange={setField('name')}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        select
                        label="کارفرما"
                        value={form.employer_id}
                        onChange={setField('employer_id')}
                        margin="normal"
                    >
                        <MenuItem value="">بدون کارفرما</MenuItem>
                        {employerChoices.map((employer) => (
                            <MenuItem key={employer.id} value={employer.id}>
                                {employer.name}
                                {employer.is_active === false ? ' (غیرفعال)' : ''}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        fullWidth
                        select
                        label="مدیر پروژه"
                        value={form.manager_id}
                        onChange={setField('manager_id')}
                        margin="normal"
                    >
                        <MenuItem value="">بدون مدیر پروژه</MenuItem>
                        {options.users.map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                                {user.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <FormControlLabel
                        sx={{ mt: 2 }}
                        control={(
                            <Switch
                                checked={form.is_active}
                                onChange={(event) => {
                                    setForm((current) => ({ ...current, is_active: event.target.checked }));
                                }}
                            />
                        )}
                        label="پروژه فعال است"
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
                        startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
                    >
                        {saving ? 'در حال ذخیره…' : 'ذخیره'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={Boolean(deleteTarget)}
                onClose={() => !deleting && setDeleteTarget(null)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>حذف پروژه</DialogTitle>
                <DialogContent>
                    {deleteError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {deleteError}
                        </Alert>
                    )}
                    <Typography>
                        آیا از حذف «{deleteTarget?.name}» مطمئن هستید؟
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>
                        انصراف
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={confirmDelete}
                        disabled={deleting}
                        startIcon={deleting ? <CircularProgress size={18} color="inherit" /> : <DeleteIcon />}
                    >
                        {deleting ? 'در حال حذف…' : 'حذف'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
