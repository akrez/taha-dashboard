import { Box, Typography } from '@mui/material';
import { PAYSLIP_BODY_FIELDS, formatPayslipValue } from '../payslipFields';

/**
 * نمایش فیلدهای فیش حقوقی. این کامپوننت در پنل ادمین استفاده می‌شود و
 * بعداً در صفحهٔ کارگر هم قابل استفادهٔ مجدد است.
 */
export default function PayslipFieldsView({ data }) {
    return (
        <Box
            sx={{
                display: 'grid',
                gap: 1.25,
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                },
            }}
        >
            {PAYSLIP_BODY_FIELDS.map((field) => (
                <Box
                    key={field.key}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1.5,
                        px: 1.5,
                        py: 1.1,
                        bgcolor: 'background.paper',
                        minHeight: 58,
                    }}
                >
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.5, lineHeight: 1.6 }}
                    >
                        {field.label}
                    </Typography>
                    <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{
                            minHeight: 20,
                            wordBreak: 'break-word',
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        {formatPayslipValue(field, data?.[field.key])}
                    </Typography>
                </Box>
            ))}
        </Box>
    );
}
