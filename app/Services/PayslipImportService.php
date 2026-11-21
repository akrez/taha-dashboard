<?php

namespace App\Services;

use App\Models\PayslipUpload;
use App\Models\User;
use App\Support\PayslipFields;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Facades\Excel;
use Throwable;

class PayslipImportService
{
    /**
     * ثبت فایل فیش حقوقی یک دوره.
     *
     * کل فایل ابتدا خوانده و اعتبارسنجی می‌شود و سپس در یک تراکنش، داده‌های
     * قبلی همان دوره حذف و داده‌های جدید درج می‌شوند.
     *
     * @return array{
     *     upload: PayslipUpload,
     *     total_rows: int,
     *     imported_rows: int,
     *     linked_rows: int,
     *     unlinked_rows: int,
     *     skipped_rows: int,
     *     warnings: list<array{row: int, message: string}>
     * }
     */
    public function import(UploadedFile $file, int $year, int $month, ?int $uploadedBy = null): array
    {
        // اندازه دسته‌های درج؛ طبق درخواست داخل خود تابع و بدون فایل config.
        $batchSize = 20;

        try {
            $sheets = Excel::toArray(new class {}, $file);
        } catch (Throwable) {
            throw ValidationException::withMessages([
                'file' => ['خواندن فایل اکسل ناموفق بود.'],
            ]);
        }

        $sheet = $sheets[0] ?? [];

        if ($sheet === []) {
            throw ValidationException::withMessages([
                'file' => ['فایل اکسل خالی است.'],
            ]);
        }

        $headers = array_shift($sheet);
        $headerIndexes = $this->headerIndexes((array) $headers);

        $codeHeader = $this->normalizeHeader('کد پرسنلی');

        if (! array_key_exists($codeHeader, $headerIndexes)) {
            throw ValidationException::withMessages([
                'file' => ['ستون «کد پرسنلی» در فایل اکسل وجود ندارد.'],
            ]);
        }

        $rows = [];
        $warnings = [];
        $totalRows = 0;
        $skippedRows = 0;

        foreach ($sheet as $index => $rawRow) {
            $rawRow = (array) $rawRow;

            if ($this->isEmptyRow($rawRow)) {
                continue;
            }

            $totalRows++;
            $excelRow = $index + 2;

            $mapped = [];
            foreach (PayslipFields::FIELDS as $field) {
                $header = $this->normalizeHeader($field);
                $value = array_key_exists($header, $headerIndexes)
                    ? ($rawRow[$headerIndexes[$header]] ?? null)
                    : null;

                $mapped[$field] = $this->normalizeValue($value);
            }

            $code = $this->normalizePersonnelCode($rawRow[$headerIndexes[$codeHeader]] ?? null);

            if ($code === null) {
                $skippedRows++;

                if (count($warnings) < 50) {
                    $warnings[] = [
                        'row' => $excelRow,
                        'message' => 'کد پرسنلی خالی یا نامعتبر است و این ردیف نادیده گرفته شد.',
                    ];
                }

                continue;
            }

            // کد پرسنلی در JSON هم با همان قالب ۱۰ رقمی ذخیره می‌شود.
            $mapped['کد پرسنلی'] = $code;

            // اگر کد پرسنلی در فایل تکراری باشد، آخرین ردیف جایگزین می‌شود.
            $rows[$code] = [
                'national_code' => $code,
                'employee_name' => $mapped['نام و نام خانوادگی کارمند'] ?: null,
                'data' => $mapped,
            ];
        }

        if ($rows === []) {
            $message = 'هیچ ردیف معتبری در فایل یافت نشد.';

            if ($skippedRows > 0) {
                $message .= " {$skippedRows} ردیف به دلیل خالی یا نامعتبر بودن کد پرسنلی رد شد.";
            }

            throw ValidationException::withMessages(['rows' => [$message]]);
        }

        $userIds = $this->userIdsByNationalCode(array_keys($rows));

        $linkedRows = 0;
        $unlinkedRows = 0;
        $payslipRows = [];

        foreach ($rows as $code => $row) {
            $userId = $userIds[$code] ?? null;

            if ($userId !== null) {
                $linkedRows++;
            } else {
                $unlinkedRows++;
            }

            $payslipRows[] = [
                'user_id' => $userId,
                'national_code' => $code,
                'employee_name' => $row['employee_name'],
                'data' => $row['data'],
            ];
        }

        $upload = DB::transaction(function () use (
            $year,
            $month,
            $uploadedBy,
            $file,
            $totalRows,
            $payslipRows,
            $linkedRows,
            $unlinkedRows,
            $skippedRows,
            $batchSize,
        ): PayslipUpload {
            $existing = PayslipUpload::query()
                ->where('year', $year)
                ->where('month', $month)
                ->first();

            if ($existing !== null) {
                $existing->payslips()->delete();
                $existing->delete();
            }

            $upload = PayslipUpload::query()->create([
                'year' => $year,
                'month' => $month,
                'is_active' => false,
                'original_file_name' => mb_substr($file->getClientOriginalName(), 0, 255),
                'uploaded_by' => $uploadedBy,
                'total_rows' => $totalRows,
                'imported_rows' => count($payslipRows),
                'linked_rows' => $linkedRows,
                'unlinked_rows' => $unlinkedRows,
                'skipped_rows' => $skippedRows,
            ]);

            foreach (array_chunk($payslipRows, $batchSize) as $chunk) {
                $upload->payslips()->createMany($chunk);
            }

            return $upload;
        });

        return [
            'upload' => $upload->load('uploadedBy'),
            'total_rows' => $totalRows,
            'imported_rows' => count($payslipRows),
            'linked_rows' => $linkedRows,
            'unlinked_rows' => $unlinkedRows,
            'skipped_rows' => $skippedRows,
            'warnings' => $warnings,
        ];
    }

    /**
     * @param  list<string>  $codes
     * @return array<string, int>
     */
    private function userIdsByNationalCode(array $codes): array
    {
        $userIds = [];

        foreach (array_chunk($codes, 500) as $chunk) {
            $users = User::query()
                ->whereIn('national_code', $chunk)
                ->get(['id', 'national_code']);

            foreach ($users as $user) {
                $userIds[$user->national_code] = $user->id;
            }
        }

        return $userIds;
    }

    private function normalizePersonnelCode(mixed $value): ?string
    {
        if (is_int($value) || is_float($value)) {
            $value = number_format((float) $value, 0, '', '');
        }

        $value = trim((string) ($value ?? ''));

        if ($value === '') {
            return null;
        }

        $value = $this->toEnglishDigits($value);

        if (preg_match('/^\d{1,10}$/', $value) !== 1) {
            return null;
        }

        return str_pad($value, 10, '0', STR_PAD_LEFT);
    }

    private function normalizeValue(mixed $value): string
    {
        if (is_int($value)) {
            $value = (string) $value;
        } elseif (is_float($value)) {
            $value = floor($value) === $value
                ? number_format($value, 0, '', '')
                : (string) $value;
        }

        $value = trim((string) ($value ?? ''));

        if ($value === '') {
            return '';
        }

        $value = $this->toEnglishDigits($value);

        // اعداد دارای جداکننده را به عدد خالص تبدیل می‌کنیم تا نمایش دوباره
        // بتواند با جداکننده هزارگان قالب‌بندی شود. متن‌ها دست‌نخورده می‌مانند.
        $numeric = str_replace([',', '٬', ' ', "\u{00A0}"], '', $value);
        $numeric = str_replace('٫', '.', $numeric);

        if (preg_match('/^-?\d+(?:\.\d+)?$/', $numeric) === 1) {
            return $numeric;
        }

        return $value;
    }

    private function toEnglishDigits(string $value): string
    {
        return strtr($value, [
            '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
            '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
            '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
            '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
        ]);
    }

    /**
     * @param  array<int, mixed>  $headers
     * @return array<string, int>
     */
    private function headerIndexes(array $headers): array
    {
        $indexes = [];

        foreach ($headers as $index => $header) {
            $indexes[$this->normalizeHeader($header)] = $index;
        }

        return $indexes;
    }

    private function normalizeHeader(mixed $header): string
    {
        $header = (string) ($header ?? '');
        $header = preg_replace('/^\x{FEFF}/u', '', $header) ?? $header;
        $header = str_replace(["\u{200c}", "\u{200e}", "\u{200f}"], ' ', $header);
        $header = preg_replace('/\s+/u', ' ', $header) ?? $header;

        return trim($header);
    }

    /**
     * @param  array<int, mixed>  $row
     */
    private function isEmptyRow(array $row): bool
    {
        foreach ($row as $value) {
            if ($this->normalizeValue($value) !== '') {
                return false;
            }
        }

        return true;
    }
}
