import { Children, useEffect, useState } from 'react';
import axios from 'axios';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    MenuItem,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    PlaylistAdd as AddendumIcon,
    Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import JalaliDatePicker from './JalaliDatePicker';
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
    initial_amount_rials: '',
    initial_amount_currency: '',
    aggregate_amount_rials: '',
    aggregate_amount_currency: '',
    currency_unit: '',
    remaining_amount: '',

    // اطلاعات زمانی
    contract_date: '',
    notification_date: '',
    project_start_date: '',
    initial_contract_duration: '',
    contract_end_date: '',
    extended_contract_duration: '',
    extended_contract_end_date: '',

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
    project_group: '',
    contract_status: '',
    project_status: '',
    contract_type: '',
    is_civil: '',
    activity_status: '',

    // موقعیت جغرافیایی
    country: '',
    province: '',
    county: '',

    // آدرس محل اجرای پروژه
    workshop_address: '',
};

const MONEY_FIELDS = [
    'initial_amount_rials',
    'initial_amount_currency',
    'aggregate_amount_rials',
    'aggregate_amount_currency',
    'remaining_amount',
];

const emptyOptions = {
    employers: [],
    civil_statuses: [],
    activity_statuses: [],
    project_types: [],
    contract_types: [],
    project_groups: [],
    provinces: [],
};

const TABS = [
    'مشخصات کلی قراردادی',
    'اطلاعات ریالی پروژه',
    'مبلغ قرارداد براساس آخرین الحاقیه',
    'اطلاعات زمانی پروژه',
    'اطلاعات فنی پروژه',
    'ذینفعان پروژه',
    'سایر',
];

/**
 * فیلدهای اجباری فرم و تبی که در آن قرار دارند.
 */
const REQUIRED_FIELDS = {
    project_name: { tab: 0, label: 'پروژه' },
    internal_code: { tab: 0, label: 'کد داخلی سپهر' },
    contract_number: { tab: 0, label: 'شماره قرارداد' },
    activity_status: { tab: 6, label: 'وضعیت فعالیت قرارداد' },
};

const isEmpty = (value) => value === '' || value === null || value === undefined;

/**
 * یک ردیف از فیلدهای فرم. عرض هر فیلد از روی `span` همان فیلد (درصد در نمونه) تعیین می‌شود.
 */
function FormRow({ children }) {
    const items = Children.toArray(children);
    const columns = items.map((child) => Number(child.props?.span) || 1);

    return (
        <Box
            sx={{
                display: 'grid',
                gap: 1.5,
                mb: 2,
                gridTemplateColumns: {
                    xs: '1fr',
                    md: columns.map((span) => `${span}fr`).join(' '),
                },
            }}
        >
            {items}
        </Box>
    );
}

/**
 * خانه‌ی یک فیلد در ردیف فرم؛ عرض آن از طریق `span` در `FormRow` خوانده می‌شود.
 */
function FieldCell({ children }) {
    return <Box sx={{ minWidth: 0 }}>{children}</Box>;
}

export default function ProjectFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState(emptyForm);
    const [tab, setTab] = useState(0);
    const [options, setOptions] = useState(emptyOptions);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [formError, setFormError] = useState('');
    const [touched, setTouched] = useState({});
    const [submitAttempted, setSubmitAttempted] = useState(false);

    // Inactive employers are hidden from the dropdown, but keep the employer
    // currently assigned to the project so editing does not clear it.
    const [assignedEmployer, setAssignedEmployer] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const loadForm = async () => {
            setLoading(true);
            setLoadError('');

            try {
                const requests = [axios.get('/api/projects/options')];

                if (isEdit) {
                    requests.push(axios.get(`/api/projects/${id}`));
                }

                const [optionsRes, projectRes] = await Promise.all(requests);

                if (cancelled) {
                    return;
                }

                setOptions({
                    employers: optionsRes.data.employers ?? [],
                    civil_statuses: optionsRes.data.civil_statuses ?? [],
                    activity_statuses: optionsRes.data.activity_statuses ?? [],
                    project_types: optionsRes.data.project_types ?? [],
                    contract_types: optionsRes.data.contract_types ?? [],
                    project_groups: optionsRes.data.project_groups ?? [],
                    provinces: optionsRes.data.provinces ?? [],
                });

                if (projectRes) {
                    const project = projectRes.data.data ?? projectRes.data;

                    setForm({
                        ...Object.fromEntries(
                            Object.keys(emptyForm).map((key) => [
                                key,
                                project[key] ?? emptyForm[key],
                            ]),
                        ),
                        employer_id: project.employer_id != null ? String(project.employer_id) : '',
                    });
                    setAssignedEmployer(project.employer ?? null);
                } else {
                    setForm({
                        ...emptyForm,
                        activity_status: optionsRes.data.activity_statuses?.[0]?.name ?? '',
                    });
                }
            } catch (err) {
                if (!cancelled) {
                    setLoadError(apiError(err, 'بارگذاری اطلاعات پروژه ناموفق بود.'));
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadForm();

        return () => {
            cancelled = true;
        };
    }, [id, isEdit]);

    const setField = (field) => (event) => {
        setForm((current) => ({ ...current, [field]: event.target.value }));
    };

    const setMoneyField = (field) => (value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const setDateField = (field) => (value) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const markTouched = (field) => () => {
        setTouched((current) => ({ ...current, [field]: true }));
    };

    const showRequiredError = (field) => (
        Boolean(REQUIRED_FIELDS[field])
        && isEmpty(form[field])
        && (touched[field] || submitAttempted)
    );

    const requiredErrorProps = (field) => ({
        error: showRequiredError(field),
        helperText: showRequiredError(field) ? 'تکمیل این فیلد الزامی است.' : undefined,
        onBlur: markTouched(field),
    });

    const submit = async (event) => {
        event.preventDefault();
        setFormError('');
        setSubmitAttempted(true);

        const missing = Object.keys(REQUIRED_FIELDS).filter((field) => isEmpty(form[field]));

        if (missing.length) {
            setTab(REQUIRED_FIELDS[missing[0]].tab);
            setFormError(`تکمیل «${REQUIRED_FIELDS[missing[0]].label}» الزامی است.`);

            return;
        }

        setSaving(true);

        const payload = Object.fromEntries(
            Object.entries(form).map(([key, value]) => [key, value === '' ? null : value]),
        );

        MONEY_FIELDS.forEach((key) => {
            payload[key] = form[key] === '' ? null : Number(form[key]);
        });

        payload.employer_id = form.employer_id === '' ? null : Number(form.employer_id);

        try {
            if (isEdit) {
                await axios.put(`/api/projects/${id}`, payload);
                navigate('/projects');
            } else {
                const response = await axios.post('/api/projects', payload);
                const created = response.data.data ?? response.data;

                navigate(`/projects/${created.id}/addenda`);
            }
        } catch (err) {
            setFormError(apiError(err, 'ذخیره پروژه ناموفق بود.'));
        } finally {
            setSaving(false);
        }
    };

    const employerChoices = [...options.employers];

    if (
        assignedEmployer
        && !employerChoices.some((employer) => employer.id === assignedEmployer.id)
    ) {
        employerChoices.push(assignedEmployer);
    }

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

    if (loadError) {
        return (
            <Card>
                <CardContent>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {loadError}
                    </Alert>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/projects')}>
                        بازگشت به فهرست پروژه‌ها
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mb: 1,
                        minHeight: 48,
                    }}
                >
                    <IconButton
                        onClick={() => navigate('/projects')}
                        aria-label="بازگشت"
                        sx={{ flexShrink: 0 }}
                    >
                        <ArrowBackIcon />
                    </IconButton>

                    <Box sx={{ display: 'flex', alignItems: 'center', height: 40, minWidth: 0 }}>
                        <Typography variant="h6" noWrap sx={{ lineHeight: 1.4 }}>
                            {isEdit ? 'ویرایش پروژه' : 'پروژه جدید'}
                        </Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1 }} />

                    {isEdit && (
                        <Button
                            variant="outlined"
                            startIcon={<AddendumIcon />}
                            onClick={() => navigate(`/projects/${id}/addenda`)}
                            sx={{ flexShrink: 0, whiteSpace: 'nowrap', height: 40 }}
                        >
                            الحاقیه‌ها
                        </Button>
                    )}
                </Box>

                <Box
                    component="form"
                    onSubmit={submit}
                    noValidate
                    sx={{ '& .MuiFormLabel-asterisk, & .MuiInputLabel-asterisk': { color: 'error.main' } }}
                >
                    {formError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {formError}
                        </Alert>
                    )}

                    <Tabs
                        value={tab}
                        onChange={(event, value) => setTab(value)}
                        variant="scrollable"
                        allowScrollButtonsMobile
                        sx={{
                            mb: 2,
                            minHeight: 46,
                            p: 0.5,
                            borderRadius: '12px',
                            bgcolor: 'grey.50',
                            border: '1px solid',
                            borderColor: 'divider',
                            '& .MuiTabs-indicator': { display: 'none' },
                            '& .MuiTabs-scroller': { overflowY: 'hidden' },
                        }}
                    >
                        {TABS.map((label) => (
                            <Tab
                                key={label}
                                label={label}
                                disableRipple
                                sx={{
                                    minHeight: 38,
                                    my: 0.25,
                                    mx: 0.25,
                                    px: 1.75,
                                    borderRadius: '9px',
                                    fontWeight: 600,
                                    fontSize: '0.8rem',
                                    color: 'text.secondary',
                                    transition: 'background .18s ease, color .18s ease, box-shadow .18s ease',
                                    '&:hover': {
                                        color: 'text.primary',
                                        bgcolor: 'action.hover',
                                    },
                                    '&.Mui-selected': {
                                        color: '#fff',
                                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                                        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                                    },
                                    '&.Mui-selected:hover': {
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    },
                                }}
                            />
                        ))}
                    </Tabs>

                    <Box role="tabpanel" sx={{ display: tab === 0 ? 'block' : 'none', mt: 1 }}>
                        <FormRow>
                            <FieldCell span={87} minWidth={240}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    required
                                    label="پروژه"
                                    value={form.project_name}
                                    onChange={setField('project_name')}
                                    {...requiredErrorProps('project_name')}
                                    slotProps={{ htmlInput: { maxLength: 250 } }}
                                />
                            </FieldCell>
                            <FieldCell span={13}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    required
                                    label="کد داخلی سپهر"
                                    value={form.internal_code}
                                    onChange={setField('internal_code')}
                                    {...requiredErrorProps('internal_code')}
                                    slotProps={{ htmlInput: { maxLength: 8, inputMode: 'numeric' } }}
                                />
                            </FieldCell>
                        </FormRow>

                        <FormRow>
                            <FieldCell span={7} minWidth={115}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    required
                                    label="شماره قرارداد"
                                    value={form.contract_number}
                                    onChange={setField('contract_number')}
                                    {...requiredErrorProps('contract_number')}
                                    slotProps={{ htmlInput: { maxLength: 20 } }}
                                />
                            </FieldCell>
                            <FieldCell span={7} minWidth={100}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="کد طرح"
                                    value={form.plan_code}
                                    onChange={setField('plan_code')}
                                    slotProps={{ htmlInput: { maxLength: 15 } }}
                                />
                            </FieldCell>
                            <FieldCell span={27} minWidth={160}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="رشته"
                                    value={form.field}
                                    onChange={setField('field')}
                                    slotProps={{ htmlInput: { maxLength: 10 } }}
                                />
                            </FieldCell>
                            <FieldCell span={22} minWidth={150}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="گرایش"
                                    value={form.specialization}
                                    onChange={setField('specialization')}
                                    slotProps={{ htmlInput: { maxLength: 20 } }}
                                />
                            </FieldCell>
                            <FieldCell span={19} minWidth={170}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="حجم / طول / ابعاد پروژه"
                                    type="number"
                                    value={form.project_dimension}
                                    onChange={setField('project_dimension')}
                                    slotProps={{ htmlInput: { step: '0.01', min: 0 } }}
                                />
                            </FieldCell>
                            <FieldCell span={10} minWidth={100}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="واحد"
                                    value={form.unit}
                                    onChange={setField('unit')}
                                    slotProps={{ htmlInput: { maxLength: 10 } }}
                                />
                            </FieldCell>
                        </FormRow>

                        <FormRow>
                            <FieldCell span={12} minWidth={115}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="کشور"
                                    value={form.country}
                                    onChange={setField('country')}
                                    slotProps={{ htmlInput: { maxLength: 10 } }}
                                />
                            </FieldCell>
                            <FieldCell span={42} minWidth={190}>
                                <TextField
                                    size="small"
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
                            </FieldCell>
                            <FieldCell span={11} minWidth={115}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="شهرستان"
                                    value={form.county}
                                    onChange={setField('county')}
                                    slotProps={{ htmlInput: { maxLength: 15 } }}
                                />
                            </FieldCell>
                            <FieldCell span={8} minWidth={100}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="ماهیت"
                                    value={form.nature}
                                    onChange={setField('nature')}
                                    slotProps={{ htmlInput: { maxLength: 10 } }}
                                />
                            </FieldCell>
                        </FormRow>
                    </Box>

                    <Box role="tabpanel" sx={{ display: tab === 1 ? 'block' : 'none', mt: 1 }}>
                        <FormRow>
                            <FieldCell span={16} minWidth={180}>
                                <MoneyField
                                    size="small"
                                    fullWidth
                                    label="مبلغ اولیه ریالی"
                                    value={form.initial_amount_rials}
                                    onChange={setMoneyField('initial_amount_rials')}
                                />
                            </FieldCell>
                            <FieldCell span={14} minWidth={180}>
                                <MoneyField
                                    size="small"
                                    fullWidth
                                    label="مبلغ اولیه ارزی"
                                    value={form.initial_amount_currency}
                                    onChange={setMoneyField('initial_amount_currency')}
                                />
                            </FieldCell>
                            <FieldCell span={10} minWidth={110}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="واحد ارزی"
                                    value={form.currency_unit}
                                    onChange={setField('currency_unit')}
                                    slotProps={{ htmlInput: { maxLength: 10 } }}
                                />
                            </FieldCell>
                            <FieldCell span={18} minWidth={180}>
                                <MoneyField
                                    size="small"
                                    fullWidth
                                    label="مبلغ مانده"
                                    value={form.remaining_amount}
                                    onChange={setMoneyField('remaining_amount')}
                                />
                            </FieldCell>
                        </FormRow>
                    </Box>

                    <Box role="tabpanel" sx={{ display: tab === 2 ? 'block' : 'none', mt: 1 }}>
                        <FormRow>
                            <FieldCell span={30} minWidth={200}>
                                <MoneyField
                                    size="small"
                                    fullWidth
                                    label="مبلغ قرارداد ریالی"
                                    value={form.aggregate_amount_rials}
                                    onChange={setMoneyField('aggregate_amount_rials')}
                                />
                            </FieldCell>
                            <FieldCell span={30} minWidth={200}>
                                <MoneyField
                                    size="small"
                                    fullWidth
                                    label="مبلغ قرارداد ارزی"
                                    value={form.aggregate_amount_currency}
                                    onChange={setMoneyField('aggregate_amount_currency')}
                                />
                            </FieldCell>
                        </FormRow>
                    </Box>

                    <Box role="tabpanel" sx={{ display: tab === 3 ? 'block' : 'none', mt: 1 }}>
                        <FormRow>
                            <FieldCell span={12} minWidth={150}>
                                <JalaliDatePicker
                                    label="تاریخ انعقاد قرارداد"
                                    value={form.contract_date}
                                    onChange={setDateField('contract_date')}
                                />
                            </FieldCell>
                            <FieldCell span={10} minWidth={145}>
                                <JalaliDatePicker
                                    label="تاریخ ابلاغ قرارداد"
                                    value={form.notification_date}
                                    onChange={setDateField('notification_date')}
                                />
                            </FieldCell>
                            <FieldCell span={10} minWidth={140}>
                                <JalaliDatePicker
                                    label="تاریخ شروع پروژه"
                                    value={form.project_start_date}
                                    onChange={setDateField('project_start_date')}
                                />
                            </FieldCell>
                            <FieldCell span={13} minWidth={150}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="مدت پیمان اولیه به ماه"
                                    type="number"
                                    value={form.initial_contract_duration}
                                    onChange={setField('initial_contract_duration')}
                                    slotProps={{ htmlInput: { step: '1', min: 0, max: 65535 } }}
                                />
                            </FieldCell>
                            <FieldCell span={10} minWidth={150}>
                                <JalaliDatePicker
                                    label="تاریخ خاتمه پیمان"
                                    value={form.contract_end_date}
                                    onChange={setDateField('contract_end_date')}
                                />
                            </FieldCell>
                            <FieldCell span={15} minWidth={160}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="مدت پیمان تمدید شده به ماه"
                                    type="number"
                                    value={form.extended_contract_duration}
                                    onChange={setField('extended_contract_duration')}
                                    slotProps={{ htmlInput: { step: '1', min: 0, max: 999 } }}
                                />
                            </FieldCell>
                            <FieldCell span={12} minWidth={170}>
                                <JalaliDatePicker
                                    label="تاریخ خاتمه پس از تمدید"
                                    value={form.extended_contract_end_date}
                                    onChange={setDateField('extended_contract_end_date')}
                                />
                            </FieldCell>
                        </FormRow>
                    </Box>

                    <Box role="tabpanel" sx={{ display: tab === 4 ? 'block' : 'none', mt: 1 }}>
                        <FormRow>
                            <FieldCell span={10}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    select
                                    label="نوع پیمان"
                                    value={form.contract_type}
                                    onChange={setField('contract_type')}
                                >
                                    <MenuItem value="">انتخاب نشده</MenuItem>
                                    {options.contract_types.map((type) => (
                                        <MenuItem key={type.name} value={type.name}>{type.trans}</MenuItem>
                                    ))}
                                </TextField>
                            </FieldCell>
                            <FieldCell span={10}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="نحوه اخذ"
                                    value={form.acquisition_method}
                                    onChange={setField('acquisition_method')}
                                    slotProps={{ htmlInput: { maxLength: 15 } }}
                                />
                            </FieldCell>
                            <FieldCell span={10}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="شناسه وضعیت"
                                    value={form.status_code}
                                    onChange={setField('status_code')}
                                    slotProps={{ htmlInput: { maxLength: 10 } }}
                                />
                            </FieldCell>
                            <FieldCell span={10}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="شاخص مبنا"
                                    value={form.base_index}
                                    onChange={setField('base_index')}
                                    slotProps={{ htmlInput: { maxLength: 10 } }}
                                />
                            </FieldCell>
                            <FieldCell span={10}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="سال مبنا"
                                    type="number"
                                    value={form.base_year}
                                    onChange={setField('base_year')}
                                    slotProps={{ htmlInput: { step: '1', min: 0, max: 9999 } }}
                                />
                            </FieldCell>
                            <FieldCell span={12}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    select
                                    label="نوع پروژه"
                                    value={form.project_type}
                                    onChange={setField('project_type')}
                                >
                                    <MenuItem value="">انتخاب نشده</MenuItem>
                                    {options.project_types.map((type) => (
                                        <MenuItem key={type.name} value={type.name}>{type.trans}</MenuItem>
                                    ))}
                                </TextField>
                            </FieldCell>
                            <FieldCell span={12}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    select
                                    label="گروه پروژه"
                                    value={form.project_group}
                                    onChange={setField('project_group')}
                                >
                                    <MenuItem value="">انتخاب نشده</MenuItem>
                                    {options.project_groups.map((group) => (
                                        <MenuItem key={group.name} value={group.name}>{group.trans}</MenuItem>
                                    ))}
                                </TextField>
                            </FieldCell>
                        </FormRow>
                    </Box>

                    <Box role="tabpanel" sx={{ display: tab === 5 ? 'block' : 'none', mt: 1 }}>
                        <FormRow>
                            <FieldCell span={25} minWidth={160}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="وزارتخانه"
                                    value={form.ministry}
                                    onChange={setField('ministry')}
                                    slotProps={{ htmlInput: { maxLength: 40 } }}
                                />
                            </FieldCell>
                            <FieldCell span={35} minWidth={180}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    select
                                    label="کارفرما"
                                    value={form.employer_id}
                                    onChange={setField('employer_id')}
                                >
                                    <MenuItem value="">بدون کارفرما</MenuItem>
                                    {employerChoices.map((employer) => (
                                        <MenuItem key={employer.id} value={String(employer.id)}>
                                            {employer.name}
                                            {employer.is_active === false ? ' (غیرفعال)' : ''}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </FieldCell>
                            <FieldCell span={40} minWidth={180}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="مشاور"
                                    value={form.consultant}
                                    onChange={setField('consultant')}
                                    slotProps={{ htmlInput: { maxLength: 40 } }}
                                />
                            </FieldCell>
                        </FormRow>

                        <FormRow>
                            <FieldCell span={100} minWidth={240}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="آدرس کارگاه"
                                    value={form.workshop_address}
                                    onChange={setField('workshop_address')}
                                    slotProps={{ htmlInput: { maxLength: 255 } }}
                                />
                            </FieldCell>
                        </FormRow>
                    </Box>

                    <Box role="tabpanel" sx={{ display: tab === 6 ? 'block' : 'none', mt: 1 }}>
                        <FormRow>
                            <FieldCell span={25} minWidth={160}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    required
                                    select
                                    label="وضعیت فعالیت قرارداد"
                                    value={form.activity_status}
                                    onChange={setField('activity_status')}
                                    {...requiredErrorProps('activity_status')}
                                >
                                    {options.activity_statuses.map((status) => (
                                        <MenuItem key={status.name} value={status.name}>{status.trans}</MenuItem>
                                    ))}
                                </TextField>
                            </FieldCell>
                            <FieldCell span={25} minWidth={160}>
                                <TextField
                                    size="small"
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
                            </FieldCell>
                            <FieldCell span={25} minWidth={160}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="وضعیت قرارداد"
                                    value={form.contract_status}
                                    onChange={setField('contract_status')}
                                    slotProps={{ htmlInput: { maxLength: 100 } }}
                                />
                            </FieldCell>
                            <FieldCell span={25} minWidth={160}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    label="وضعیت پروژه"
                                    value={form.project_status}
                                    onChange={setField('project_status')}
                                    slotProps={{ htmlInput: { maxLength: 20 } }}
                                />
                            </FieldCell>
                        </FormRow>
                    </Box>

                    <Box
                        sx={{
                            position: 'sticky',
                            bottom: 0,
                            mt: 4,
                            py: 2,
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 1,
                            bgcolor: 'background.paper',
                            borderTop: 1,
                            borderColor: 'divider',
                        }}
                    >
                        <Button onClick={() => navigate('/projects')} disabled={saving}>
                            انصراف
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={saving}
                            startIcon={
                                saving
                                    ? <CircularProgress size={18} color="inherit" />
                                    : <SaveIcon />
                            }
                        >
                            {saving ? 'در حال ذخیره…' : 'ذخیره'}
                        </Button>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
