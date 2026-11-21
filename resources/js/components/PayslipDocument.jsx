import { Box, Stack, Typography } from '@mui/material';
import { BadgeOutlined as BadgeIcon } from '@mui/icons-material';
import { toPersianDigits } from '../jalali';
import {
    PAYSLIP_DEDUCTION_FIELDS,
    PAYSLIP_EARNING_FIELDS,
    PAYSLIP_FIELD_MAP,
    PAYSLIP_QUANTITY_FIELDS,
    formatPayslipValue,
    payslipNumber,
    sumPayslipFields,
} from '../payslipFields';

const MONEY_FIELD = { money: true };

const BORDER = '1px solid #cbd5e1';
const SOFT_BORDER = '1px solid #eef0f2';

function moneyDisplay(rawValue, fallbackNumber) {
    const raw = rawValue === null || rawValue === undefined ? '' : String(rawValue).trim();

    if (raw !== '' && payslipNumber(raw) === null) {
        return formatPayslipValue(MONEY_FIELD, raw);
    }

    return formatPayslipValue(MONEY_FIELD, fallbackNumber);
}

function Section({ title, children, total, last = false }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                bgcolor: '#fff',
                borderBottom: { xs: last ? 0 : BORDER, md: 0 },
                borderLeft: { xs: 0, md: last ? 0 : BORDER },
            }}
        >
            <Box
                sx={{
                    px: 1.5,
                    py: 1,
                    bgcolor: '#e8edf2',
                    borderBottom: BORDER,
                }}
            >
                <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    sx={{ color: '#263a4d', lineHeight: 1.8 }}
                >
                    {title}
                </Typography>
            </Box>

            <Box sx={{ flex: 1 }}>{children}</Box>

            {total && (
                <Box
                    sx={{
                        mt: 'auto',
                        px: 1.5,
                        py: 1,
                        bgcolor: '#dbeafe',
                        borderTop: '1px solid #a7c8ef',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 1,
                    }}
                >
                    <Typography variant="body2" fontWeight={700} sx={{ color: '#123c68' }}>
                        {total.label}
                    </Typography>
                    <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ color: '#123c68', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
                    >
                        {total.value}
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

function FieldRow({ fieldKey, data }) {
    const field = PAYSLIP_FIELD_MAP.get(fieldKey) ?? { key: fieldKey, label: fieldKey, money: false };
    const raw = data?.[fieldKey];

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                px: 1.5,
                py: 0.7,
                borderBottom: SOFT_BORDER,
                '&:last-of-type': { borderBottom: 0 },
            }}
        >
            <Typography variant="body2" sx={{ color: '#30343a', lineHeight: 1.7 }}>
                {field.label}
            </Typography>
            <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                    color: '#1d2934',
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                }}
            >
                {formatPayslipValue(field, raw)}
            </Typography>
        </Box>
    );
}

function InfoItem({ label, value }) {
    return (
        <Box
            sx={{
                px: 1.5,
                py: 1.1,
                borderBottom: SOFT_BORDER,
                borderLeft: { xs: 0, sm: SOFT_BORDER },
                '&:last-of-type': { borderBottom: 0 },
            }}
        >
            <Typography variant="caption" sx={{ display: 'block', color: '#64748b', mb: 0.4 }}>
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ color: '#1d2934', wordBreak: 'break-word' }}>
                {toPersianDigits(value ?? '')}
            </Typography>
        </Box>
    );
}

/**
 * نمای فیش حقوقی کارمند، برگرفته از چیدمان فرم رسمی فیش حقوقی.
 */
export default function PayslipDocument({ payslip, periodLabel }) {
    const data = payslip?.data ?? {};

    const grossRaw = data['جمع مزایا'];
    const gross = payslipNumber(grossRaw) ?? sumPayslipFields(data, PAYSLIP_EARNING_FIELDS);
    const deductions = sumPayslipFields(data, PAYSLIP_DEDUCTION_FIELDS);
    const net = payslipNumber(data['خالص پرداختی']) ?? (gross - deductions);

    const grossDisplay = moneyDisplay(grossRaw, gross);
    const deductionsDisplay = formatPayslipValue(MONEY_FIELD, deductions);
    const netDisplay = moneyDisplay(data['خالص پرداختی'], net);

    return (
        <Box
            dir="rtl"
            sx={{
                bgcolor: '#f7f8fa',
                border: BORDER,
                borderRadius: 1.5,
                overflow: 'hidden',
                color: '#1d2934',
            }}
        >
            {/* سربرگ */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 1.25, sm: 1.5 },
                    bgcolor: '#fff',
                    borderBottom: BORDER,
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <BadgeIcon sx={{ color: '#24384b' }} />
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#24384b' }}>
                        فیش حقوقی
                    </Typography>
                </Stack>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#475569' }}>
                    {periodLabel}
                </Typography>
            </Box>

            {/* اطلاعات کارمند */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
                    bgcolor: '#fff',
                    borderBottom: BORDER,
                }}
            >
                <InfoItem label="نام و نام خانوادگی" value={payslip?.display_name || payslip?.employee_name} />
                <InfoItem label="کد پرسنلی" value={payslip?.national_code} />
                <InfoItem label="محل خدمت" value={data['محل خدمت']} />
                <InfoItem label="مرکز هزینه" value={data['مرکز هزینه']} />
                <InfoItem label="گروه" value={data['گروه']} />
                <InfoItem label="شماره حساب" value={data['شماره حساب']} />
            </Box>

            {/* بدنه */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '0.85fr 1.5fr 1fr' },
                    alignItems: 'stretch',
                    mx: { xs: 1, sm: 1.25 },
                    mt: { xs: 1, sm: 1.25 },
                    border: BORDER,
                    borderRadius: 1,
                    overflow: 'hidden',
                }}
            >
                <Section title="کارکرد">
                    {PAYSLIP_QUANTITY_FIELDS.map((fieldKey) => (
                        <FieldRow key={fieldKey} fieldKey={fieldKey} data={data} />
                    ))}
                </Section>

                <Section
                    title="حقوق و مزایا و فوق‌العاده‌ها"
                    total={{ label: 'جمع مزایا', value: grossDisplay }}
                >
                    {PAYSLIP_EARNING_FIELDS.map((fieldKey) => (
                        <FieldRow key={fieldKey} fieldKey={fieldKey} data={data} />
                    ))}
                </Section>

                <Section
                    title="کسورات"
                    last
                    total={{ label: 'جمع کسورات', value: deductionsDisplay }}
                >
                    {PAYSLIP_DEDUCTION_FIELDS.map((fieldKey) => (
                        <FieldRow key={fieldKey} fieldKey={fieldKey} data={data} />
                    ))}
                </Section>
            </Box>

            {/* جمع‌ها و خالص پرداختی */}
            <Box sx={{ px: { xs: 1, sm: 1.25 }, pb: { xs: 1, sm: 1.25 } }}>
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                        gap: 1.25,
                        mb: 1.25,
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            px: 1.5,
                            py: 1,
                            bgcolor: '#dbeafe',
                            border: '1px solid #a7c8ef',
                            borderRadius: 1,
                        }}
                    >
                        <Typography variant="body2" fontWeight={700} sx={{ color: '#123c68' }}>
                            جمع مزایا
                        </Typography>
                        <Typography
                            variant="body1"
                            fontWeight={700}
                            sx={{ color: '#123c68', fontVariantNumeric: 'tabular-nums' }}
                        >
                            {grossDisplay}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            px: 1.5,
                            py: 1,
                            bgcolor: '#fee2e2',
                            border: '1px solid #fca5a5',
                            borderRadius: 1,
                        }}
                    >
                        <Typography variant="body2" fontWeight={700} sx={{ color: '#7f1d1d' }}>
                            جمع کسورات
                        </Typography>
                        <Typography
                            variant="body1"
                            fontWeight={700}
                            sx={{ color: '#7f1d1d', fontVariantNumeric: 'tabular-nums' }}
                        >
                            {deductionsDisplay}
                        </Typography>
                    </Box>
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        justifyContent: 'space-between',
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: 1,
                        px: 2,
                        py: 1.5,
                        bgcolor: '#24384b',
                        borderRadius: 1,
                        color: '#fff',
                    }}
                >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={700}>
                            خالص پرداختی
                        </Typography>
                        <Typography
                            variant="h5"
                            fontWeight={700}
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                            {netDisplay}
                        </Typography>
                    </Stack>

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 0.5, sm: 2 }}
                        sx={{ color: '#dce6ef' }}
                    >
                        <Typography variant="body2">جمع مزایا: {grossDisplay}</Typography>
                        <Typography variant="body2">جمع کسورات: {deductionsDisplay}</Typography>
                    </Stack>
                </Box>
            </Box>
        </Box>
    );
}
