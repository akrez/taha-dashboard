<?php

namespace App\Services;

use App\Exports\UsersExport;
use App\Models\Discipline;
use App\Models\Position;
use App\Models\Project;
use App\Models\Section;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Facades\Excel;

class UserImportService
{
    /**
     * Import users from the first worksheet.
     *
     * @return array{total_rows: int, created_users: int, updated_users: int, deactivated_users: int}
     */
    public function import(UploadedFile $file, bool $deactivateMissing = false): array
    {
        $sheets = Excel::toArray(new class {}, $file);
        $sheet = $sheets[0] ?? [];

        if ($sheet === []) {
            throw ValidationException::withMessages([
                'rows' => ['فایل اکسل خالی است.'],
            ]);
        }

        $headerIndexes = $this->headerIndexes((array) array_shift($sheet));
        $rows = [];
        $errors = [];
        $nationalCodeRows = [];
        $personnelCodeRows = [];

        foreach ($sheet as $index => $rawRow) {
            $excelRow = $index + 2;
            $row = $this->mapRow((array) $rawRow, $headerIndexes);

            if ($this->isEmptyRow($row)) {
                continue;
            }

            $nationalCode = $this->normalizeNationalCode($row['national_code']);

            if ($nationalCode === null) {
                $errors[] = "کد ملی در ردیف {$excelRow} نامعتبر است؛ کد ملی باید شامل ۱۰ رقم باشد.";
            } elseif (isset($nationalCodeRows[$nationalCode])) {
                $errors[] = "کد ملی ردیف {$excelRow} تکراری است و قبلاً در ردیف {$nationalCodeRows[$nationalCode]} آمده است.";
            } else {
                $nationalCodeRows[$nationalCode] = $excelRow;
            }

            $personnelCode = $this->nullableString($row['personnel_code']);
            if ($personnelCode !== null) {
                $personnelCode = $this->toEnglishDigits($personnelCode);

                if (isset($personnelCodeRows[$personnelCode])) {
                    $errors[] = "کد پرسنلی ردیف {$excelRow} تکراری است و قبلاً در ردیف {$personnelCodeRows[$personnelCode]} آمده است.";
                } else {
                    $personnelCodeRows[$personnelCode] = $excelRow;
                }
            }

            $row['national_code'] = $nationalCode;
            $row['personnel_code'] = $personnelCode;
            $row['excel_row'] = $excelRow;
            $rows[] = $row;
        }

        $this->validatePersonnelCodes($rows, $errors);

        if ($errors !== []) {
            throw ValidationException::withMessages(['rows' => $errors]);
        }

        return DB::transaction(function () use ($rows, $deactivateMissing): array {
            $created = 0;
            $updated = 0;
            $nationalCodes = [];
            $superAdminCodes = $this->superAdminNationalCodes();

            foreach ($rows as $row) {
                $nationalCode = $row['national_code'];
                $nationalCodes[] = $nationalCode;
                $user = User::query()->where('national_code', $nationalCode)->first();

                $attributes = [
                    'personnel_code' => $row['personnel_code'],
                    'first_name' => $this->nullableString($row['first_name']),
                    'last_name' => $this->nullableString($row['last_name']),
                    'father_name' => $this->nullableString($row['father_name']),
                    'membership_type' => $this->nullableString($row['membership_type']),
                    'discipline_id' => $this->relationId(Discipline::class, $row['discipline']),
                    'project_id' => $this->relationId(Project::class, $row['project']),
                    'section_id' => $this->relationId(Section::class, $row['section']),
                    'position_id' => $this->relationId(Position::class, $row['position']),
                    'is_disable' => in_array($nationalCode, $superAdminCodes, true)
                        ? false
                        : $this->nullableString($row['status']) !== null,
                ];

                $password = $this->nullableString($row['password']);

                if ($user === null) {
                    $attributes['national_code'] = $nationalCode;
                    $attributes['password'] = $password ?? $nationalCode;
                    User::query()->create($attributes);
                    $created++;
                } else {
                    if ($password !== null) {
                        $attributes['password'] = $password;
                    }

                    $user->update($attributes);
                    $updated++;
                }
            }

            $deactivated = 0;
            if ($deactivateMissing) {
                $deactivated = User::query()
                    ->where('is_disable', false)
                    ->when($nationalCodes !== [], fn ($query) => $query->whereNotIn('national_code', $nationalCodes))
                    ->when($superAdminCodes !== [], fn ($query) => $query->whereNotIn('national_code', $superAdminCodes))
                    ->update(['is_disable' => true]);
            }

            return [
                'total_rows' => count($rows),
                'created_users' => $created,
                'updated_users' => $updated,
                'deactivated_users' => $deactivated,
            ];
        });
    }

    public function toEnglishDigits(string $value): string
    {
        return strtr($value, [
            '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
            '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
            '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
            '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
        ]);
    }

    /** @return array<string, int> */
    private function headerIndexes(array $headers): array
    {
        $indexes = [];

        foreach ($headers as $index => $header) {
            $name = trim((string) $header);
            $name = preg_replace('/^\x{FEFF}/u', '', $name) ?? $name;
            $indexes[$name] = $index;
        }

        $missing = array_values(array_diff(app(UsersExport::class)->headings(), array_keys($indexes)));
        if ($missing !== []) {
            throw ValidationException::withMessages([
                'rows' => ['ستون‌های الزامی زیر در فایل وجود ندارند: '.implode('، ', $missing)],
            ]);
        }

        return $indexes;
    }

    /** @return array<string, mixed> */
    private function mapRow(array $row, array $indexes): array
    {
        $value = static fn (string $heading) => $row[$indexes[$heading]] ?? null;

        return [
            'discipline' => $value('دیسیپلین'),
            'project' => $value('پروژه'),
            'section' => $value('نام قسمت'),
            'position' => $value('پست سازمانی'),
            'personnel_code' => $value('کد پرسنلی'),
            'national_code' => $value('کد ملی'),
            'first_name' => $value('نام'),
            'last_name' => $value('نام خانوادگی'),
            'father_name' => $value('نام پدر'),
            'membership_type' => $value('نوع عضویت'),
            'status' => $value('وضعیت'),
            'password' => $value('رمز عبور'),
        ];
    }

    private function isEmptyRow(array $row): bool
    {
        foreach ($row as $value) {
            if ($this->nullableString($value) !== null) {
                return false;
            }
        }

        return true;
    }

    private function normalizeNationalCode(mixed $value): ?string
    {
        $value = $this->nullableString($value);
        if ($value === null) {
            return null;
        }

        $value = $this->toEnglishDigits($value);
        if (! preg_match('/^\d{1,10}$/', $value)) {
            return null;
        }

        return str_pad($value, 10, '0', STR_PAD_LEFT);
    }

    private function nullableString(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    /**
     * Prevent a database uniqueness error and return a useful row-level error.
     *
     * @param  array<int, array<string, mixed>>  $rows
     * @param  array<int, string>  $errors
     */
    private function validatePersonnelCodes(array $rows, array &$errors): void
    {
        foreach ($rows as $row) {
            if ($row['personnel_code'] === null || $row['national_code'] === null) {
                continue;
            }

            $owner = User::query()
                ->where('personnel_code', $row['personnel_code'])
                ->where('national_code', '!=', $row['national_code'])
                ->exists();

            if ($owner) {
                $errors[] = "کد پرسنلی ردیف {$row['excel_row']} قبلاً برای کاربر دیگری ثبت شده است.";
            }
        }
    }

    /** @param class-string<Discipline|Project|Section|Position> $model */
    private function relationId(string $model, mixed $name): ?int
    {
        $name = $this->nullableString($name);

        return $name === null ? null : $model::query()->firstOrCreate(['name' => $name])->getKey();
    }

    /** @return array<int, string> */
    private function superAdminNationalCodes(): array
    {
        $codes = explode(',', (string) config('permission.super_admin_national_codes'));

        return array_values(array_unique(array_filter(array_map(
            fn (string $code) => $this->normalizeNationalCode($code),
            $codes,
        ))));
    }
}
