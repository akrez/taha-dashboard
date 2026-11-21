export const JALALI_MONTHS = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
];

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

const PERSIAN_TO_ENGLISH = {
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
};

export function toPersianDigits(value) {
    return String(value ?? '').replace(/\d/g, (digit) => PERSIAN_DIGITS[Number(digit)]);
}

export function toEnglishDigits(value) {
    return String(value ?? '').replace(/[۰-۹٠-٩]/g, (digit) => PERSIAN_TO_ENGLISH[digit] ?? digit);
}

/**
 * سال و ماه شمسی جاری را برمی‌گرداند.
 */
export function currentJalaliPeriod() {
    try {
        const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', {
            year: 'numeric',
            month: 'numeric',
        }).formatToParts(new Date());

        const year = Number(parts.find((part) => part.type === 'year')?.value);
        const month = Number(parts.find((part) => part.type === 'month')?.value);

        if (Number.isInteger(year) && Number.isInteger(month) && month >= 1 && month <= 12) {
            return { year, month };
        }
    } catch {
        // از Date میلادی به عنوان تخمین استفاده می‌کنیم.
    }

    return {
        year: new Date().getFullYear() - 621,
        month: 1,
    };
}

export function formatJalaliPeriod(year, month) {
    const monthLabel = JALALI_MONTHS[Number(month) - 1] ?? '';

    return `${monthLabel} ${toPersianDigits(year)}`.trim();
}

export function formatJalaliDateTime(value) {
    if (!value) {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}
