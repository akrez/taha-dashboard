<?php

namespace App\Exports;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class UsersExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping
{
    public function query(): Builder
    {
        return User::query()
            ->with(['discipline', 'project', 'section', 'position'])
            ->orderBy('id');
    }

    public function headings(): array
    {
        return [
            'دیسیپلین',
            'پروژه',
            'نام قسمت',
            'پست سازمانی',
            'کد پرسنلی',
            'کد ملی',
            'نام',
            'نام خانوادگی',
            'نام پدر',
            'نوع عضویت',
            'وضعیت',
            'رمز عبور',
        ];
    }

    /**
     * Passwords are deliberately not exported. A blank password preserves the
     * current password when this file is imported again.
     */
    public function map($user): array
    {
        return [
            $user->discipline?->name,
            $user->project?->name,
            $user->section?->name,
            $user->position?->name,
            $user->personnel_code,
            $user->national_code,
            $user->first_name,
            $user->last_name,
            $user->father_name,
            $user->membership_type,
            $user->is_disable ? 'غیرفعال' : '',
            '',
        ];
    }
}
