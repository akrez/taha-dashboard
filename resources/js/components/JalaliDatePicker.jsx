import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { TextField as MuiTextField } from '@mui/material';

const persianDigits = '۰۱۲۳۴۵۶۷۸۹';

/**
 * تاریخ شمسی انتخاب‌شده را به صورت رشته انگلیسی Y-m-d برمی‌گرداند.
 */
function toEnglishDigits(value) {
    return String(value ?? '').replace(
        /[۰-۹]/g,
        (digit) => String(persianDigits.indexOf(digit)),
    );
}

export default function JalaliDatePicker({ label, value, onChange }) {
    return (
        <DatePicker
            value={value || ''}
            onChange={(date) => onChange(date ? toEnglishDigits(date.format('YYYY-MM-DD')) : '')}
            calendar={persian}
            locale={persian_fa}
            format="YYYY-MM-DD"
            calendarPosition="bottom-right"
            editable={false}
            render={(formattedValue, openCalendar) => (
                <MuiTextField
                    fullWidth
                    label={label}
                    value={formattedValue}
                    onClick={openCalendar}
                    placeholder="1403-05-21"
                    slotProps={{ htmlInput: { readOnly: true, dir: 'ltr' } }}
                />
            )}
        />
    );
}
