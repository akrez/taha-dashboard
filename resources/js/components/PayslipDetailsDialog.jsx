import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import { toPersianDigits } from '../jalali';
import PayslipFieldsView from './PayslipFieldsView';

export default function PayslipDetailsDialog({
    open,
    onClose,
    payslip,
    loading,
    errors = [],
    periodLabel,
    title = 'فیش حقوقی',
    showLinkStatus = true,
}) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>
                            {title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {periodLabel}
                        </Typography>
                    </Box>
                    {showLinkStatus && (
                        payslip?.is_linked ? (
                            <Chip size="small" color="success" label="کاربر متصل" />
                        ) : (
                            <Chip size="small" label="بدون کاربر" />
                        )
                    )}
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                {errors.length > 0 && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        <Box component="ul" sx={{ m: 0, pr: 2 }}>
                            {errors.map((message, index) => (
                                <li key={`${message}-${index}`}>{message}</li>
                            ))}
                        </Box>
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                        <CircularProgress />
                    </Box>
                ) : payslip ? (
                    <>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                justifyContent: 'space-between',
                                flexDirection: { xs: 'column', sm: 'row' },
                                gap: 1,
                                mb: 2,
                            }}
                        >
                            <Box>
                                <Typography variant="subtitle1" fontWeight={700}>
                                    {payslip.display_name || payslip.employee_name || '—'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    کد پرسنلی: {toPersianDigits(payslip.national_code)}
                                </Typography>
                            </Box>
                            {payslip.employee_name && payslip.display_name !== payslip.employee_name && (
                                <Typography variant="caption" color="text.secondary">
                                    نام در فایل: {payslip.employee_name}
                                </Typography>
                            )}
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <PayslipFieldsView data={payslip.data} />
                    </>
                ) : null}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>بستن</Button>
            </DialogActions>
        </Dialog>
    );
}
