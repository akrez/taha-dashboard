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
    IconButton,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    PlaylistAdd as AddendaIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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

export default function ProjectsTable() {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusError, setStatusError] = useState('');
    const [statusSavingId, setStatusSavingId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);

        try {
            const { data } = await axios.get('/api/projects');

            setProjects(data.data ?? []);
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

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">پروژه‌ها</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/projects/create')}
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
                                            <Stack direction="row" spacing={0.5}>
                                                <Tooltip title="الحاقیه‌ها">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigate(`/projects/${project.id}/addenda`)}
                                                    >
                                                        <AddendaIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="ویرایش">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => navigate(`/projects/${project.id}/edit`)}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
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
        </Card>
    );
}
