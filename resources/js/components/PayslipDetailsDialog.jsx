import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import PayslipDocument from './PayslipDocument';

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
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    pb: 1,
                }}
            >
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        {title}
                    </Typography>
                    {periodLabel && (
                        <Typography variant="caption" color="text.secondary">
                            {periodLabel}
                        </Typography>
                    )}
                </Box>

                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    {showLinkStatus && payslip && (
                        payslip.is_linked ? (
                            <Chip size="small" color="success" label="کاربر متصل" />
                        ) : (
                            <Chip size="small" label="بدون کاربر" />
                        )
                    )}
                    <IconButton onClick={onClose} aria-label="بستن" disabled={loading}>
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers sx={{ bgcolor: '#eef1f5', p: { xs: 1, sm: 2 } }}>
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
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : payslip ? (
                    <PayslipDocument payslip={payslip} />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
