import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import {
    Alert,
    Autocomplete,
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
    Lock as LockIcon,
    People as PeopleIcon,
    Security as SecurityIcon,
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

function userLabel(user) {
    return user.name || '—';
}

export default function RolesTable() {
    const [roles, setRoles] = useState([]);
    const [permOptions, setPermOptions] = useState([]);
    const [permSearch, setPermSearch] = useState('');
    const [permsLoading, setPermsLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [nameDialog, setNameDialog] = useState(null);
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState('');
    const [savingName, setSavingName] = useState(false);

    const [permDialog, setPermDialog] = useState(null);
    const [selected, setSelected] = useState([]);
    const [permError, setPermError] = useState('');
    const [savingPerms, setSavingPerms] = useState(false);

    const [userDialog, setUserDialog] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [userSearch, setUserSearch] = useState('');
    const [usersLoading, setUsersLoading] = useState(false);
    const [userError, setUserError] = useState('');
    const [savingUsers, setSavingUsers] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);

        try {
            const rolesRes = await axios.get('/api/roles');

            setRoles(rolesRes.data.data ?? []);
            setError('');
        } catch (err) {
            setError(apiError(err, 'بارگذاری نقشها ناموفق بود.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // Search users on the server (the table can be large), debounced so we
    // only hit the API once the typing pauses.
    useEffect(() => {
        if (!userDialog) {
            return undefined;
        }

        const controller = new AbortController();
        setUsersLoading(true);

        const timer = setTimeout(() => {
            axios
                .get('/api/roles/users', {
                    params: { search: userSearch || undefined },
                    signal: controller.signal,
                })
                .then((res) => setUserOptions(res.data.data ?? []))
                .catch((err) => {
                    if (!axios.isCancel(err)) {
                        setUserError(apiError(err, 'بارگذاری کاربران ناموفق بود.'));
                    }
                })
                .finally(() => {
                    if (!controller.signal.aborted) {
                        setUsersLoading(false);
                    }
                });
        }, 300);

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [userDialog, userSearch]);

    // Permissions are searched on the server as well.
    useEffect(() => {
        if (!permDialog) {
            return undefined;
        }

        const controller = new AbortController();
        setPermsLoading(true);

        const timer = setTimeout(() => {
            axios
                .get('/api/roles/permissions', {
                    params: { search: permSearch || undefined },
                    signal: controller.signal,
                })
                .then((res) => setPermOptions(res.data.data ?? []))
                .catch((err) => {
                    if (!axios.isCancel(err)) {
                        setPermError(apiError(err, 'بارگذاری ناموفق بود.'));
                    }
                })
                .finally(() => {
                    if (!controller.signal.aborted) {
                        setPermsLoading(false);
                    }
                });
        }, 300);

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [permDialog, permSearch]);

    const openCreate = () => {
        setName('');
        setNameError('');
        setNameDialog({ mode: 'create' });
    };

    const openEdit = (role) => {
        setName(role.name);
        setNameError('');
        setNameDialog({ mode: 'edit', role });
    };

    const closeNameDialog = () => {
        if (savingName) {
            return;
        }

        setNameDialog(null);
    };

    const submitName = async (event) => {
        event.preventDefault();
        setNameError('');
        setSavingName(true);

        try {
            if (nameDialog.mode === 'create') {
                await axios.post('/api/roles', { name });
            } else {
                await axios.put(`/api/roles/${nameDialog.role.id}`, { name });
            }

            setNameDialog(null);
            await load();
        } catch (err) {
            setNameError(apiError(err, 'ذخیره نقش ناموفق بود.'));
        } finally {
            setSavingName(false);
        }
    };

    const openPermissions = (role) => {
        setSelected(role.permissions ?? []);
        setPermOptions(role.permissions ?? []);
        setPermSearch('');
        setPermsLoading(true);
        setPermError('');
        setPermDialog(role);
    };

    const closePermissions = () => {
        if (savingPerms) {
            return;
        }

        setPermDialog(null);
    };

    const submitPermissions = async (event) => {
        event.preventDefault();
        setPermError('');
        setSavingPerms(true);

        try {
            await axios.put(`/api/roles/${permDialog.id}/permissions`, {
                permissions: selected.map((permission) => permission.id),
            });

            setPermDialog(null);
            await load();
        } catch (err) {
            setPermError(apiError(err, 'ذخیره دسترسیها ناموفق بود.'));
        } finally {
            setSavingPerms(false);
        }
    };

    const openUsers = (role) => {
        setSelectedUsers(role.users ?? []);
        setUserOptions(role.users ?? []);
        setUserSearch('');
        setUserError('');
        setUserDialog(role);
    };

    const closeUsers = () => {
        if (savingUsers) {
            return;
        }

        setUserDialog(null);
    };

    const submitUsers = async (event) => {
        event.preventDefault();
        setUserError('');
        setSavingUsers(true);

        try {
            await axios.put(`/api/roles/${userDialog.id}/users`, {
                users: selectedUsers.map((user) => user.id),
            });

            setUserDialog(null);
            await load();
        } catch (err) {
            setUserError(apiError(err, 'ذخیره کاربران ناموفق بود.'));
        } finally {
            setSavingUsers(false);
        }
    };

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">نقشها</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={openCreate}
                        sx={{ ml: 'auto' }}
                    >
                        نقش جدید
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
                                <TableCell>نام نقش</TableCell>
                                <TableCell>دسترسیها</TableCell>
                                <TableCell>کاربران</TableCell>
                                <TableCell align="center">عملیات</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        <CircularProgress size={24} sx={{ my: 2 }} />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                roles.map((role) => (
                                    <TableRow key={role.id} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="body2" fontWeight={600}>
                                                    {role.name}
                                                </Typography>
                                                {role.is_protected && (
                                                    <Tooltip title="نقش محافظتشده">
                                                        <LockIcon fontSize="small" color="disabled" />
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            {(role.permissions ?? []).length === 0 ? (
                                                '—'
                                            ) : (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: 0.5,
                                                    }}
                                                >
                                                    {(role.permissions ?? []).map((permission) => (
                                                        <Chip
                                                            key={permission.id}
                                                            label={permission.name}
                                                            size="small"
                                                            dir="ltr"
                                                        />
                                                    ))}
                                                </Box>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {(role.users ?? []).length === 0 ? (
                                                '—'
                                            ) : (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: 0.5,
                                                    }}
                                                >
                                                    {(role.users ?? []).map((user) => (
                                                        <Chip
                                                            key={user.id}
                                                            label={userLabel(user)}
                                                            size="small"
                                                        />
                                                    ))}
                                                </Box>
                                            )}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="ویرایش نام">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => openEdit(role)}
                                                        disabled={role.is_protected}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="مدیریت دسترسیها">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => openPermissions(role)}
                                                        disabled={role.is_protected}
                                                    >
                                                        <SecurityIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="مدیریت کاربران">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => openUsers(role)}
                                                        disabled={role.is_protected}
                                                    >
                                                        <PeopleIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            {!loading && roles.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        نقشی یافت نشد
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>

            <Dialog
                open={Boolean(nameDialog)}
                onClose={closeNameDialog}
                fullWidth
                maxWidth="xs"
                slotProps={{ paper: { component: 'form', onSubmit: submitName } }}
            >
                <DialogTitle>
                    {nameDialog?.mode === 'edit' ? 'ویرایش نقش' : 'نقش جدید'}
                </DialogTitle>
                <DialogContent>
                    {nameError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {nameError}
                        </Alert>
                    )}
                    <TextField
                        autoFocus
                        fullWidth
                        label="نام نقش"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        disabled={savingName}
                        slotProps={{ htmlInput: { dir: 'ltr' } }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeNameDialog} disabled={savingName}>
                        انصراف
                    </Button>
                    <Button type="submit" variant="contained" disabled={savingName || !name.trim()}>
                        ذخیره
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={Boolean(permDialog)}
                onClose={closePermissions}
                fullWidth
                maxWidth="sm"
                slotProps={{ paper: { component: 'form', onSubmit: submitPermissions } }}
            >
                <DialogTitle>دسترسیهای {permDialog?.name}</DialogTitle>
                <DialogContent>
                    {permError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {permError}
                        </Alert>
                    )}
                    {!permsLoading && permOptions.length === 0 && !permSearch ? (
                        <Typography variant="body2" color="text.secondary">
                            دسترسیای تعریف نشده است.
                        </Typography>
                    ) : (
                        <Autocomplete
                            multiple
                            disableCloseOnSelect
                            options={permOptions}
                            value={selected}
                            onChange={(event, value) => setSelected(value)}
                            onInputChange={(event, value, reason) => {
                                if (reason === 'input') {
                                    setPermSearch(value);
                                }
                            }}
                            filterOptions={(options) => options}
                            getOptionLabel={(option) => option.name}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            noOptionsText="موردی یافت نشد"
                            loading={permsLoading}
                            disabled={savingPerms}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    autoFocus
                                    fullWidth
                                    label="دسترسی‌ها"
                                    placeholder="جست‌وجو…"
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => {
                                    const { key, ...tagProps } = getTagProps({ index });

                                    return (
                                        <Chip
                                            key={key}
                                            label={option.name}
                                            size="small"
                                            dir="ltr"
                                            {...tagProps}
                                        />
                                    );
                                })
                            }
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closePermissions} disabled={savingPerms}>
                        انصراف
                    </Button>
                    <Button type="submit" variant="contained" disabled={savingPerms}>
                        ذخیره
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={Boolean(userDialog)}
                onClose={closeUsers}
                fullWidth
                maxWidth="sm"
                slotProps={{ paper: { component: 'form', onSubmit: submitUsers } }}
            >
                <DialogTitle>کاربران {userDialog?.name}</DialogTitle>
                <DialogContent>
                    {userError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {userError}
                        </Alert>
                    )}
                    <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={userOptions}
                        value={selectedUsers}
                        onChange={(event, value) => setSelectedUsers(value)}
                        onInputChange={(event, value, reason) => {
                            if (reason === 'input') {
                                setUserSearch(value);
                            }
                        }}
                        filterOptions={(options) => options}
                        getOptionLabel={(option) => userLabel(option)}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        loading={usersLoading}
                        noOptionsText="کاربری یافت نشد"
                        disabled={savingUsers}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                autoFocus
                                fullWidth
                                label="کاربران"
                                placeholder="جست‌وجوی نام…"
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => {
                                const { key, ...tagProps } = getTagProps({ index });

                                return (
                                    <Chip
                                        key={key}
                                        label={userLabel(option)}
                                        size="small"
                                        {...tagProps}
                                    />
                                );
                            })
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeUsers} disabled={savingUsers}>
                        انصراف
                    </Button>
                    <Button type="submit" variant="contained" disabled={savingUsers}>
                        ذخیره
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
