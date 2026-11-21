<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payslips', function (Blueprint $table) {
            $table->id();

            $table->foreignId('upload_id')->constrained('payslip_uploads')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            // کد پرسنلی همان کد ملی کاربر است و همیشه ۱۰ رقمی ذخیره می‌شود.
            $table->string('national_code', 10)->index();
            $table->string('employee_name')->nullable();

            // تمام ستون‌های اکسل به صورت JSON
            $table->json('data');

            $table->timestamps();

            $table->unique(['upload_id', 'national_code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payslips');
    }
};
