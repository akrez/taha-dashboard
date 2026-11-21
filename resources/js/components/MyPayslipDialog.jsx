import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
} from '@mui/material';
import PayslipDocument from './PayslipDocument';

export default function MyPayslipDialog({
    open,
    onClose,
    payslip,
    loading,
    errors = [],
    periodLabel,
}) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogContent sx={{ bgcolor: '#eef1f5', p: { xs: 1, sm: 2 } }}>
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
                    <PayslipDocument payslip={payslip} periodLabel={periodLabel} />
                ) : null}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>بستن</Button>
            </DialogActions>
        </Dialog>
    );
}
