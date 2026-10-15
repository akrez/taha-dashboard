<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 256)->nullable();
            $table->unsignedInteger('jdate')->index();
            $table->smallInteger('jyear')->nullable()->index();
            $table->tinyInteger('jmonth')->nullable()->index();
            $table->tinyInteger('jday')->nullable()->index();
            $table->tinyInteger('jhour')->nullable()->index();
            $table->timestamp('visited_at')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visits');
    }
};
