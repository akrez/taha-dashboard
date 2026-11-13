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
    Divider,
    IconButton,
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
    Add as AddIcon,
    Edit as EditIcon,
} from '@mui/icons-material';
import JalaliDatePicker from './JalaliDatePicker';

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
    // مشخصات پروژه
    internal_code: '',
    project_name: '',
    contract_number: '',
    plan_code: '',

    // اطلاعات سازمانی
    ministry: '',
    employer_id: '',
    consultant: '',

    // مبالغ
    initial_amount_billion_rials: '',
    initial_amount_million_currency: '',
    aggregate_amount: '',
    remaining_amount: '',

    // اطلاعات زمانی
    contract_date: '',
    notification_date: '',
    start_date: '',
    initial_duration: '',
    end_date: '',
    extended_duration: '',
    extended_end_date: '',

    // ابعاد و شاخص
    project_dimension: '',
    unit: '',
    base_index: '',
    base_year: '',

    // مشخصات تخصصی
    field: '',
    specialization: '',
    acquisition_method: '',
    nature: '',

    // وضعیت پروژه
    status_code: '',
    project_type: '',
    contract_status: '',
    project_status: '',
    contract_type: '',
    is_civil: '',
    activity_status: '',

    // موقعیت جغرافیایی
    country: '',
    province: '',
    county: '',
};

function FormSection({ title, children }) {
    return (
        <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
                >
                    {title}
                </Typography>
                <Divider sx={{ flexGrow: 1 }} />
            </Box>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        lg: 'repeat(3, 1fr)',
                        xl: 'repeat(4, 1fr)',
                    },
                    gap: 2,
                }}
            >
                {children}
            </Box>
        </Box>
    );
}

export default function ProjectsTable() {
    const [projects, setProjects] = useState([]);
    const [options, setOptions] = useState({
        employers: [],
        civil_statuses: [],
        activity_statuses: [],
        provinces: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusError, setStatusError] = useState('');
    const [statusSavingId, setStatusSavingId] = useState(null);

    const [dialog, setDialog] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

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
                civil_statuses: optionsRes.data.civil_statuses ?? [],
                activity_statuses: optionsRes.data.activity_statuses ?? [],
                provinces: optionsRes.data.provinces ?? [],
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
        setForm({
            ...emptyForm,
            activity_status: options.activity_statuses[0]?.name ?? '',
        });
        setFormError('');
        setDialog({ mode: 'create' });
    };

    const openEdit = (project) => {
        setForm({
            ...Object.fromEntries(
                Object.keys(emptyForm).map((key) => [
                    key,
                    project[key] ?? emptyForm[key],
                ]),
            ),
            employer_id: project.employer_id ?? '',
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

        const payload = Object.fromEntries(
            Object.entries(form).map(([key, value]) => [key, value === '' ? null : value]),
        );

        payload.employer_id = form.employer_id === '' ? null : Number(form.employer_id);

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

    /**
     * وضعیت پروژه در سیستم را با endpoint اختصاصی تغییر می‌دهد؛
     * نیازی به ارسال کل اطلاعات پروژه نیست.
     */
    const toggleSystemStatus = async (project) => {
        setStatusError('');
        setStatusSavingId(project.id);

        try {
            await axios.patch(`/api/projects/${project.id}/system-status`, {
                is_active: !project.is_active,
            });

            await load();
        } catch (err) {
            setStatusError(apiError(err, 'تغییر وضعیت پروژه ناموفق بود.'));
        } finally {
            setStatusSavingId(null);
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

                {statusError && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setStatusError('')}>
                        {statusError}
                    </Alert>
                )}

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>نام پروژه</TableCell>
                                <TableCell>کد داخلی سپهر</TableCell>
                                <TableCell>شماره قرارداد</TableCell>
                                <TableCell>کارفرما</TableCell>
                                <TableCell>وضعیت پروژه در سیستم</TableCell>
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
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {project.project_name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{project.internal_code}</TableCell>
                                        <TableCell>{project.contract_number}</TableCell>
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
                                        <TableCell>
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                                justifyContent="center"
                                            >
                                                <Chip
                                                    size="small"
                                                    label={project.is_active ? 'فعال' : 'غیرفعال'}
                                                    color={project.is_active ? 'success' : 'default'}
                                                    variant={project.is_active ? 'filled' : 'outlined'}
                                                />
                                                <Tooltip
                                                    title={project.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                                                >
                                                    <span>
                                                        <Switch
                                                            size="small"
                                                            checked={Boolean(project.is_active)}
                                                            disabled={statusSavingId === project.id}
                                                            onChange={() => toggleSystemStatus(project)}
                                                        />
                                                    </span>
                                                </Tooltip>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="ویرایش">
                                                <IconButton size="small" onClick={() => openEdit(project)}>
                                                    <EditIcon fontSize="small" />
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
                fullWidth
                maxWidth="xl"
                open={Boolean(dialog)}
                onClose={closeDialog}
                slotProps={{
                    paper: {
                        component: 'form',
                        onSubmit: submit,
                        sx: {
                            m: { xs: 2, md: 4 },
                            mt: { xs: 2, md: '80px' },
                            maxHeight: { md: 'calc(100vh - 112px)' },
                        },
                    },
                }}
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

                    <FormSection title="مشخصات کلی قراردادی">
                        <TextField
                            fullWidth
                            required
                            label="نام پروژه"
                            value={form.project_name}
                            onChange={setField('project_name')}
                            slotProps={{ htmlInput: { maxLength: 250 } }}
                        />
                        <TextField
                            fullWidth
                            required
                            label="کد داخلی سپهر"
                            value={form.internal_code}
                            onChange={setField('internal_code')}
                            slotProps={{ htmlInput: { maxLength: 8, inputMode: 'numeric' } }}
                        />
                        <TextField
                            fullWidth
                            required
                            label="شماره قرارداد"
                            value={form.contract_number}
                            onChange={setField('contract_number')}
                            slotProps={{ htmlInput: { maxLength: 20 } }}
                        />
                        <TextField
                            fullWidth
                            label="کد طرح"
                            value={form.plan_code}
                            onChange={setField('plan_code')}
                            slotProps={{ htmlInput: { maxLength: 15 } }}
                        />
                        <TextField
                            fullWidth
                            label="وزارتخانه"
                            value={form.ministry}
                            onChange={setField('ministry')}
                            slotProps={{ htmlInput: { maxLength: 40 } }}
                        />
                        <TextField
                            fullWidth
                            label="رشته"
                            value={form.field}
                            onChange={setField('field')}
                            slotProps={{ htmlInput: { maxLength: 10 } }}
                        />
                        <TextField
                            fullWidth
                            label="گرایش"
                            value={form.specialization}
                            onChange={setField('specialization')}
                            slotProps={{ htmlInput: { maxLength: 20 } }}
                        />
                        <TextField
                            fullWidth
                            label="ابعاد پروژه"
                            type="number"
                            value={form.project_dimension}
                            onChange={setField('project_dimension')}
                            slotProps={{ htmlInput: { step: '0.01', min: 0 } }}
                        />
                        <TextField
                            fullWidth
                            label="واحد"
                            value={form.unit}
                            onChange={setField('unit')}
                            slotProps={{ htmlInput: { maxLength: 10 } }}
                        />
                        <TextField
                            fullWidth
                            label="کشور"
                            value={form.country}
                            onChange={setField('country')}
                            slotProps={{ htmlInput: { maxLength: 10 } }}
                        />
                        <TextField
                            fullWidth
                            select
                            label="استان"
                            value={form.province}
                            onChange={setField('province')}
                        >
                            <MenuItem value="">انتخاب نشده</MenuItem>
                            {options.provinces.map((province) => (
                                <MenuItem key={province.name} value={province.name}>{province.trans}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            label="شهرستان"
                            value={form.county}
                            onChange={setField('county')}
                            slotProps={{ htmlInput: { maxLength: 15 } }}
                        />
                        <TextField
                            fullWidth
                            label="ماهیت"
                            value={form.nature}
                            onChange={setField('nature')}
                            slotProps={{ htmlInput: { maxLength: 10 } }}
                        />
                    </FormSection>

                    <FormSection title="اطلاعات ریالی پروژه">
                        <TextField
                            fullWidth
                            label="مبلغ اولیه (میلیارد ریال)"
                            type="number"
                            value={form.initial_amount_billion_rials}
                            onChange={setField('initial_amount_billion_rials')}
                            slotProps={{ htmlInput: { step: '0.01', min: 0 } }}
                        />
                        <TextField
                            fullWidth
                            label="مبلغ اولیه (میلیون ارزی)"
                            type="number"
                            value={form.initial_amount_million_currency}
                            onChange={setField('initial_amount_million_currency')}
                            slotProps={{ htmlInput: { step: '0.01', min: 0 } }}
                        />
                    </FormSection>

                    <FormSection title="مبلغ قرارداد براساس آخرین الحاقیه">
                        <TextField
                            fullWidth
                            label="مبلغ تجمیع"
                            type="number"
                            value={form.aggregate_amount}
                            onChange={setField('aggregate_amount')}
                            slotProps={{ htmlInput: { step: '0.01', min: 0 } }}
                        />
                        <TextField
                            fullWidth
                            label="مبلغ مانده"
                            type="number"
                            value={form.remaining_amount}
                            onChange={setField('remaining_amount')}
                            slotProps={{ htmlInput: { step: '1', min: 0 } }}
                        />
                    </FormSection>

                    <FormSection title="اطلاعات زمانی پروژه">
                        <JalaliDatePicker
                            label="تاریخ عقد قرارداد"
                            value={form.contract_date}
                            onChange={(value) => setForm((current) => ({ ...current, contract_date: value }))}
                        />
                        <JalaliDatePicker
                            label="تاریخ ابلاغ"
                            value={form.notification_date}
                            onChange={(value) => setForm((current) => ({ ...current, notification_date: value }))}
                        />
                        <JalaliDatePicker
                            label="تاریخ شروع"
                            value={form.start_date}
                            onChange={(value) => setForm((current) => ({ ...current, start_date: value }))}
                        />
                        <TextField
                            fullWidth
                            label="مدت اولیه قرارداد"
                            type="number"
                            value={form.initial_duration}
                            onChange={setField('initial_duration')}
                            slotProps={{ htmlInput: { step: '1', min: 0, max: 65535 } }}
                        />
                        <JalaliDatePicker
                            label="تاریخ پایان"
                            value={form.end_date}
                            onChange={(value) => setForm((current) => ({ ...current, end_date: value }))}
                        />
                        <TextField
                            fullWidth
                            label="مدت تمدید شده"
                            type="number"
                            value={form.extended_duration}
                            onChange={setField('extended_duration')}
                            slotProps={{ htmlInput: { step: '1', min: 0, max: 999 } }}
                        />
                        <JalaliDatePicker
                            label="تاریخ خاتمه تمدید شده"
                            value={form.extended_end_date}
                            onChange={(value) => setForm((current) => ({ ...current, extended_end_date: value }))}
                        />
                    </FormSection>

                    <FormSection title="اطلاعات فنی پروژه">
                        <TextField
                            fullWidth
                            label="نوع پیمان"
                            value={form.contract_type}
                            onChange={setField('contract_type')}
                            slotProps={{ htmlInput: { maxLength: 20 } }}
                        />
                        <TextField
                            fullWidth
                            label="روش اخذ"
                            value={form.acquisition_method}
                            onChange={setField('acquisition_method')}
                            slotProps={{ htmlInput: { maxLength: 15 } }}
                        />
                        <TextField
                            fullWidth
                            label="شاخص مبنا"
                            value={form.base_index}
                            onChange={setField('base_index')}
                            slotProps={{ htmlInput: { maxLength: 10 } }}
                        />
                        <TextField
                            fullWidth
                            label="سال مبنا"
                            type="number"
                            value={form.base_year}
                            onChange={setField('base_year')}
                            slotProps={{ htmlInput: { step: '1', min: 0, max: 9999 } }}
                        />
                        <TextField
                            fullWidth
                            label="نوع پروژه"
                            value={form.project_type}
                            onChange={setField('project_type')}
                            slotProps={{ htmlInput: { maxLength: 20 } }}
                        />
                        <TextField
                            fullWidth
                            label="کد وضعیت"
                            value={form.status_code}
                            onChange={setField('status_code')}
                            slotProps={{ htmlInput: { maxLength: 10 } }}
                        />
                        <TextField
                            fullWidth
                            label="وضعیت قرارداد"
                            value={form.contract_status}
                            onChange={setField('contract_status')}
                            slotProps={{ htmlInput: { maxLength: 100 } }}
                        />
                        <TextField
                            fullWidth
                            label="وضعیت پروژه"
                            value={form.project_status}
                            onChange={setField('project_status')}
                            slotProps={{ htmlInput: { maxLength: 20 } }}
                        />
                        <TextField
                            fullWidth
                            select
                            label="وضعیت عمرانی پروژه"
                            value={form.is_civil}
                            onChange={setField('is_civil')}
                        >
                            <MenuItem value="">انتخاب نشده</MenuItem>
                            {options.civil_statuses.map((status) => (
                                <MenuItem key={status.name} value={status.name}>{status.trans}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            required
                            select
                            label="وضعیت فعالیت"
                            value={form.activity_status}
                            onChange={setField('activity_status')}
                        >
                            {options.activity_statuses.map((status) => (
                                <MenuItem key={status.name} value={status.name}>{status.trans}</MenuItem>
                            ))}
                        </TextField>
                    </FormSection>

                    <FormSection title="ذینفعان پروژه">
                        <TextField
                            fullWidth
                            select
                            label="کارفرما"
                            value={form.employer_id}
                            onChange={setField('employer_id')}
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
                            label="مشاور"
                            value={form.consultant}
                            onChange={setField('consultant')}
                            slotProps={{ htmlInput: { maxLength: 40 } }}
                        />
                    </FormSection>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} disabled={saving}>
                        انصراف
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={
                            saving
                            || !form.internal_code
                            || !form.project_name
                            || !form.contract_number
                            || !form.activity_status
                        }
                        startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
                    >
                        {saving ? 'در حال ذخیره…' : 'ذخیره'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
