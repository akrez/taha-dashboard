import { TextField } from '@mui/material';

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/**
 * ارقام فارسی/عربی را به لاتین تبدیل می‌کند و هر کاراکتر غیرعددی را حذف می‌کند.
 */
export function digitsOnly(value) {
    return String(value ?? '')
        .split(/[.٫]/)[0]
        .replace(/[۰-۹]/g, (digit) => PERSIAN_DIGITS.indexOf(digit))
        .replace(/[٠-٩]/g, (digit) => ARABIC_DIGITS.indexOf(digit))
        .replace(/\D/g, '')
        .replace(/^0+(?=\d)/, '');
}

/**
 * عدد را با جداکننده هزاران (کاما) نمایش می‌دهد.
 */
export function formatThousands(value) {
    const digits = digitsOnly(value);

    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * ورودی عددی صحیح با جداکننده هزاران.
 * مقدار خروجی `onChange` فقط شامل ارقام لاتین است.
 */
export default function MoneyField({ value, onChange, slotProps, ...props }) {
    const htmlInput = {
        maxLength: 19,
        inputMode: 'numeric',
        dir: 'ltr',
        ...slotProps?.htmlInput,
    };

    return (
        <TextField
            {...props}
            type="text"
            value={formatThousands(value)}
            onChange={(event) => onChange(digitsOnly(event.target.value))}
            slotProps={{
                ...slotProps,
                htmlInput,
            }}
            sx={{
                '& input': { textAlign: 'left', fontVariantNumeric: 'tabular-nums' },
                ...props.sx,
            }}
        />
    );
}
