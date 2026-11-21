<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payslip_uploads', function (Blueprint $table) {
            $table->id();

            // دوره فیش حقوقی (شمسی)
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('month');

            // وضعیت نمایش برای کارکنان
            $table->boolean('is_active')->default(false)->index();

            // اطلاعات آپلود
            $table->string('original_file_name')->nullable();
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();

            // آمار پردازش فایل
            $table->unsignedInteger('total_rows')->default(0);
            $table->unsignedInteger('imported_rows')->default(0);
            $table->unsignedInteger('linked_rows')->default(0);
            $table->unsignedInteger('unlinked_rows')->default(0);
            $table->unsignedInteger('skipped_rows')->default(0);

            $table->timestamps();

            $table->unique(['year', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payslip_uploads');
    }
};
