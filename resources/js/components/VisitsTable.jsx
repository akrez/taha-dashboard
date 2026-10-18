import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Card,
    CardContent,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material';

const columns = [
    { id: 'id', label: '#' },
    { id: 'user', label: 'کاربر' },
    { id: 'ip_address', label: 'IP' },
    { id: 'user_agent', label: 'مرورگر' },
    { id: 'visited_at', label: 'تاریخ بازدید' },
];

function userName(visit) {
    if (!visit.user) {
        return '—';
    }

    const fullName = [visit.user.first_name, visit.user.last_name].filter(Boolean).join(' ');

    return fullName || visit.user.national_code || '—';
}

export default function VisitsTable() {
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        setLoading(true);

        axios
            .get('/api/visits', { params: { page: page + 1, per_page: rowsPerPage } })
            .then((res) => {
                setRows(res.data.data ?? []);
                setTotal(res.data.total ?? 0);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [page, rowsPerPage]);

    return (
        <Card>
            <CardContent>
                <Typography variant="h6" gutterBottom>
                    بازدیدها
                </Typography>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell key={column.id}>{column.label}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} align="center">
                                        <CircularProgress size={24} sx={{ my: 2 }} />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell>{row.id}</TableCell>
                                        <TableCell>{userName(row)}</TableCell>
                                        <TableCell dir="ltr">{row.ip_address ?? '—'}</TableCell>
                                        <TableCell
                                            sx={{
                                                maxWidth: 260,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {row.user_agent ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            {row.visited_at
                                                ? new Date(row.visited_at).toLocaleString('fa-IR')
                                                : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                            {!loading && rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={columns.length} align="center">
                                        بازدیدی یافت نشد
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={total}
                    page={page}
                    onPageChange={(_event, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[10, 25, 50]}
                    labelRowsPerPage="تعداد در صفحه"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} از ${count}`}
                />
            </CardContent>
        </Card>
    );
}
