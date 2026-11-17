<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();

            // شناسه و مشخصات پروژه
            $table->string('internal_code', 8)->nullable()->unique();
            $table->string('project_name', 250)->nullable();
            $table->string('contract_number', 20)->nullable();
            $table->string('plan_code', 15)->nullable();

            // اطلاعات سازمانی
            $table->string('ministry', 40)->nullable();
            $table->foreignId('employer_id')->nullable()->index()->constrained()->nullOnDelete();
            $table->string('consultant', 40)->nullable();

            // مبالغ
            $table->decimal('initial_amount_billion_rials', 15, 2)->nullable();
            $table->decimal('initial_amount_million_currency', 15, 2)->nullable();
            $table->decimal('aggregate_amount', 15, 2)->nullable();
            $table->decimal('aggregate_amount_currency', 15, 2)->nullable();
            $table->string('currency_type', 10)->nullable();
            $table->unsignedBigInteger('remaining_amount')->nullable();

            // اطلاعات زمانی قرارداد (شمسی، Y-m-d)
            $table->string('contract_date', 10)->nullable();
            $table->string('notification_date', 10)->nullable();
            $table->string('start_date', 10)->nullable();
            $table->unsignedSmallInteger('initial_duration')->nullable();
            $table->string('end_date', 10)->nullable();
            $table->unsignedSmallInteger('extended_duration')->nullable();
            $table->string('extended_end_date', 10)->nullable();

            // ابعاد و شاخص پروژه (حجم طول ابعاد)
            $table->decimal('project_dimension', 11, 2)->nullable()->comment('حجم طول ابعاد');
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
            $table->string('project_group', 30)->nullable();
            $table->string('contract_status', 100)->nullable();
            $table->string('project_status', 20)->nullable();
            $table->string('contract_type', 20)->nullable();

            // وضعیت عمرانی پروژه
            $table->string('is_civil', 20)->nullable();

            // موقعیت جغرافیایی
            $table->string('country', 10)->nullable();
            $table->string('province', 63)->nullable();
            $table->string('county', 15)->nullable();

            // آدرس محل اجرای پروژه
            $table->string('project_address', 255)->nullable();

            // وضعیت فعالیت
            $table->string('activity_status', 10)->nullable();

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            // Indexes
            $table->index('contract_number');
            $table->index('project_name');
            $table->index(['activity_status', 'is_civil']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
