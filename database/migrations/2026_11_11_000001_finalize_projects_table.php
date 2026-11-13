<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // نام پروژه به project_name تغییر می‌کند و یکتا نیست.
        Schema::table('projects', function (Blueprint $table) {
            $table->dropUnique(['name']);
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->renameColumn('name', 'project_name');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->string('project_name', 250)->change();
        });

        // مدیر پروژه در مشخصات پروژه وجود ندارد.
        Schema::table('projects', function (Blueprint $table) {
            $table->dropConstrainedForeignId('manager_id');
        });

        Schema::table('projects', function (Blueprint $table) {
            // شناسه و مشخصات پروژه
            $table->string('internal_code', 8)->nullable()->unique()->after('id');
            $table->string('contract_number', 20)->nullable()->after('project_name');
            $table->string('plan_code', 15)->nullable()->after('contract_number');

            // اطلاعات سازمانی
            $table->string('ministry', 40)->nullable();
            $table->string('consultant', 40)->nullable();

            // مبالغ
            $table->decimal('initial_amount_billion_rials', 15, 2)->nullable();
            $table->decimal('initial_amount_million_currency', 15, 2)->nullable();
            $table->decimal('aggregate_amount', 15, 2)->nullable();
            $table->unsignedBigInteger('remaining_amount')->nullable();

            // اطلاعات زمانی قرارداد (شمسی، Y-m-d)
            $table->string('contract_date', 10)->nullable();
            $table->string('notification_date', 10)->nullable();
            $table->string('start_date', 10)->nullable();
            $table->unsignedSmallInteger('initial_duration')->nullable();
            $table->string('end_date', 10)->nullable();
            $table->unsignedSmallInteger('extended_duration')->nullable();
            $table->string('extended_end_date', 10)->nullable();

            // ابعاد و شاخص پروژه
            $table->decimal('project_dimension', 11, 2)->nullable();
            $table->string('unit', 10)->nullable();
            $table->string('base_index', 10)->nullable();
            $table->unsignedSmallInteger('base_year')->nullable();

            // مشخصات تخصصی
            $table->string('field', 10)->nullable();
            $table->string('specialization', 20)->nullable();
            $table->string('acquisition_method', 15)->nullable();
            $table->string('nature', 10)->nullable();

            // وضعیت و نوع پروژه و قرارداد
            $table->string('status_code', 10)->nullable();
            $table->string('project_type', 20)->nullable();
            $table->string('contract_status', 100)->nullable();
            $table->string('project_status', 20)->nullable();
            $table->string('contract_type', 20)->nullable();

            // وضعیت عمرانی پروژه
            $table->string('is_civil', 20)->nullable();

            // موقعیت جغرافیایی
            $table->string('country', 10)->nullable();
            $table->string('province', 63)->nullable();
            $table->string('county', 15)->nullable();

            // وضعیت فعالیت
            $table->string('activity_status', 10)->nullable();

            // Indexes
            $table->index('contract_number');
            $table->index('project_name');
            $table->index('employer_id');
            $table->index(['activity_status', 'is_civil']);
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropUnique(['internal_code']);
            $table->dropIndex(['contract_number']);
            $table->dropIndex(['project_name']);
            $table->dropIndex(['employer_id']);
            $table->dropIndex(['activity_status', 'is_civil']);
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn([
                'internal_code',
                'contract_number',
                'plan_code',
                'ministry',
                'consultant',
                'initial_amount_billion_rials',
                'initial_amount_million_currency',
                'aggregate_amount',
                'remaining_amount',
                'contract_date',
                'notification_date',
                'start_date',
                'initial_duration',
                'end_date',
                'extended_duration',
                'extended_end_date',
                'project_dimension',
                'unit',
                'base_index',
                'base_year',
                'field',
                'specialization',
                'acquisition_method',
                'nature',
                'status_code',
                'project_type',
                'contract_status',
                'project_status',
                'contract_type',
                'is_civil',
                'country',
                'province',
                'county',
                'activity_status',
            ]);
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->renameColumn('project_name', 'name');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->string('name')->change();
            $table->unique('name');
            $table->foreignId('manager_id')->nullable()->constrained('users')->nullOnDelete();
        });
    }
};
